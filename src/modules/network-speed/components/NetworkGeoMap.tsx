'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { type CountryKey, networkCountryMap } from '@/modules/network-speed/countries';
import type { CountrySummary, ProbeEntry } from '@/modules/network-speed/types';
import { useI18n } from '@/services/i18n';

const WORLD_MAP_NAME = 'network-world-map';
const NINE_DASH_LINE_NAME = 'South China Sea Nine-Dash Line';
const southChinaSeaRegionNames = new Set(['Paracel Islands', '西沙群岛', '西沙群島']);

type NetworkGeoMapProps = {
    summaries: CountrySummary[];
    probes: ProbeEntry[];
    focusCountry: CountryKey | null;
    countryLabels: Record<CountryKey, string>;
    onDrillDown: (countryKey: CountryKey) => void;
};
type EChartsInstanceLike = {
    dispose: () => void;
    resize: () => void;
    setOption: (option: Record<string, unknown>, notMerge?: boolean) => void;
    on: (...args: unknown[]) => unknown;
    off: (...args: unknown[]) => unknown;
};
type GeoFeature = {
    type: 'Feature';
    geometry: {
        type: 'Polygon' | 'MultiPolygon';
        coordinates: number[][][] | number[][][][];
    };
    properties: Record<string, unknown>;
};
type GeoFeatureCollection = {
    type: 'FeatureCollection';
    features: GeoFeature[];
};
type ProvinceMetric = {
    name: string;
    avgMs: number | null;
    packetLoss: number;
    count: number;
    locations: string[];
};
type SouthChinaSeaInsetPath = {
    id: string;
    d: string;
    tone: 'land' | 'dash';
};

function collectBounds(coords: number[][][] | number[][][][]) {
    let minLon = Number.POSITIVE_INFINITY;
    let maxLon = Number.NEGATIVE_INFINITY;
    let minLat = Number.POSITIVE_INFINITY;
    let maxLat = Number.NEGATIVE_INFINITY;

    const visitPolygon = (polygon: number[][][]) => {
        for (const ring of polygon) {
            for (const [lon, lat] of ring) {
                minLon = Math.min(minLon, lon);
                maxLon = Math.max(maxLon, lon);
                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
            }
        }
    };

    if (Array.isArray(coords[0][0][0])) {
        for (const polygon of coords as number[][][][]) {
            visitPolygon(polygon);
        }
    } else {
        visitPolygon(coords as number[][][]);
    }

    return {
        minLon,
        maxLon,
        minLat,
        maxLat,
        width: maxLon - minLon,
    };
}

function sanitizeWorldFeatureCollection(collection: GeoFeatureCollection) {
    return {
        type: 'FeatureCollection',
        features: collection.features
            .filter((feature) => feature.properties.name !== 'Antarctica')
            .map((feature) => {
                if (feature.geometry.type === 'Polygon') {
                    const bounds = collectBounds(feature.geometry.coordinates);

                    if (bounds.width >= 300 || bounds.minLat <= -70 || bounds.maxLat >= 85) {
                        return null;
                    }

                    return feature;
                }

                const polygons = (feature.geometry.coordinates as number[][][][]).filter((polygon) => {
                    const bounds = collectBounds(polygon);

                    return bounds.width < 300 && bounds.minLat > -70 && bounds.maxLat < 85;
                });

                if (!polygons.length) {
                    return null;
                }

                return {
                    ...feature,
                    geometry: {
                        ...feature.geometry,
                        coordinates: polygons,
                    },
                } satisfies GeoFeature;
            })
            .filter((feature): feature is GeoFeature => feature !== null),
    } satisfies GeoFeatureCollection;
}

function isNineDashLineFeature(feature: GeoFeature) {
    return feature.properties.adcode === '100000_JD' || feature.properties.adchar === 'JD';
}

function buildChinaWorldFeature(collection: GeoFeatureCollection) {
    const chinaPolygons = collection.features.filter((feature) => !isNineDashLineFeature(feature)).flatMap(toPolygons);

    if (!chinaPolygons.length) {
        return null;
    }

    return {
        type: 'Feature',
        geometry: {
            type: 'MultiPolygon',
            coordinates: chinaPolygons,
        },
        properties: {
            name: 'China',
        },
    } satisfies GeoFeature;
}

function buildNineDashLineFeature(collection: GeoFeatureCollection) {
    const nineDashLineFeature = collection.features.find(isNineDashLineFeature);

    if (!nineDashLineFeature) {
        return null;
    }

    return {
        ...nineDashLineFeature,
        properties: {
            ...nineDashLineFeature.properties,
            name: NINE_DASH_LINE_NAME,
        },
    } satisfies GeoFeature;
}

function mergeChinaFeatureCollection(
    worldCollection: GeoFeatureCollection,
    chinaCollection: GeoFeatureCollection | null,
) {
    if (!chinaCollection) {
        return worldCollection;
    }

    const chinaFeature = buildChinaWorldFeature(chinaCollection);
    const nineDashLineFeature = buildNineDashLineFeature(chinaCollection);

    if (!chinaFeature) {
        return worldCollection;
    }

    return {
        type: 'FeatureCollection',
        features: [
            ...worldCollection.features.filter((feature) => {
                return feature.properties.name !== 'China' && feature.properties.name !== 'Taiwan';
            }),
            chinaFeature,
            ...(nineDashLineFeature ? [nineDashLineFeature] : []),
        ],
    } satisfies GeoFeatureCollection;
}

async function fetchDataVChinaCollection() {
    try {
        const response = await fetch('/maps/admin1/cn.geojson');

        if (!response.ok) {
            return null;
        }

        return (await response.json()) as GeoFeatureCollection;
    } catch {
        return null;
    }
}

function formatMs(value: number | null) {
    if (value === null) {
        return '--';
    }

    return `${value >= 100 ? value.toFixed(0) : value.toFixed(1)} ms`;
}

function resolveVisualValue(avgMs: number | null, packetLoss = 0, status = 'finished') {
    if (status !== 'finished' || packetLoss >= 100) {
        return 1000;
    }

    if (avgMs === null) {
        return -1;
    }

    return avgMs;
}

function pointInRing(point: [number, number], ring: number[][]) {
    let isInside = false;
    const [x, y] = point;

    for (
        let previousIndex = ring.length - 1, currentIndex = 0;
        currentIndex < ring.length;
        previousIndex = currentIndex++
    ) {
        const [currentX, currentY] = ring[currentIndex];
        const [previousX, previousY] = ring[previousIndex];
        const intersects =
            currentY > y !== previousY > y &&
            x < ((previousX - currentX) * (y - currentY)) / (previousY - currentY || Number.EPSILON) + currentX;

        if (intersects) {
            isInside = !isInside;
        }
    }

    return isInside;
}

function pointInFeature(point: [number, number], feature: GeoFeature) {
    if (feature.geometry.type === 'Polygon') {
        const [outerRing, ...holes] = feature.geometry.coordinates as number[][][];

        if (!pointInRing(point, outerRing)) {
            return false;
        }

        return !holes.some((hole) => pointInRing(point, hole));
    }

    return (feature.geometry.coordinates as number[][][][]).some((polygon) => {
        const [outerRing, ...holes] = polygon;

        if (!pointInRing(point, outerRing)) {
            return false;
        }

        return !holes.some((hole) => pointInRing(point, hole));
    });
}

function resolveLocalizedProvinceName(feature: GeoFeature, language: 'zh' | 'en') {
    const zhName =
        (typeof feature.properties.name_zh === 'string' && feature.properties.name_zh) ||
        (typeof feature.properties.name_zht === 'string' && feature.properties.name_zht);
    const enName =
        (typeof feature.properties.name_en === 'string' && feature.properties.name_en) ||
        (typeof feature.properties.name === 'string' && feature.properties.name);

    return language === 'zh' ? zhName || enName || '--' : enName || zhName || '--';
}

function buildProvinceFeatureCollection(
    collection: GeoFeatureCollection,
    focusCountry: CountryKey,
    language: 'zh' | 'en',
) {
    const countryCode = networkCountryMap[focusCountry].countryCode;

    return {
        type: 'FeatureCollection',
        features: collection.features
            .filter((feature) => feature.properties.iso_a2 === countryCode)
            .map((feature) => ({
                ...feature,
                properties: {
                    ...feature.properties,
                    name: resolveLocalizedProvinceName(feature, language),
                },
            })),
    } satisfies GeoFeatureCollection;
}

function buildProvinceMetrics(probes: ProbeEntry[], collection: GeoFeatureCollection) {
    const provinceMap = new Map<string, ProvinceMetric>();

    for (const probe of probes) {
        if (probe.latitude === null || probe.longitude === null) {
            continue;
        }

        const matchedFeature = collection.features.find((feature) => {
            return pointInFeature([probe.longitude as number, probe.latitude as number], feature);
        });

        if (!matchedFeature) {
            continue;
        }

        const provinceName =
            (typeof matchedFeature.properties.name === 'string' && matchedFeature.properties.name) || '--';
        const currentMetric = provinceMap.get(provinceName);

        if (!currentMetric) {
            provinceMap.set(provinceName, {
                name: provinceName,
                avgMs: probe.avgMs,
                packetLoss: probe.packetLoss,
                count: 1,
                locations: [probe.locationLabel],
            });
            continue;
        }

        const totals = [currentMetric.avgMs, probe.avgMs].filter(
            (value): value is number => value !== null && Number.isFinite(value),
        );

        provinceMap.set(provinceName, {
            name: provinceName,
            avgMs: totals.length ? totals.reduce((sum, value) => sum + value, 0) / totals.length : null,
            packetLoss: Math.max(currentMetric.packetLoss, probe.packetLoss),
            count: currentMetric.count + 1,
            locations: [...currentMetric.locations, probe.locationLabel],
        });
    }

    return provinceMap;
}

function findHainanFeature(collection: GeoFeatureCollection) {
    return collection.features.find((feature) => {
        const { adcode, name } = feature.properties;

        return adcode === 460000 || name === '海南省' || name === 'Hainan';
    });
}

function toPolygons(feature: GeoFeature) {
    if (feature.geometry.type === 'Polygon') {
        return [feature.geometry.coordinates as number[][][]];
    }

    return feature.geometry.coordinates as number[][][][];
}

function polygonBounds(polygon: number[][][]) {
    return collectBounds(polygon);
}

function buildSouthChinaSeaInsetPaths(collection: GeoFeatureCollection) {
    const hainanFeature = findHainanFeature(collection);
    const nineDashLineFeature = buildNineDashLineFeature(collection);

    if (!hainanFeature && !nineDashLineFeature) {
        return [];
    }

    const landPolygons = hainanFeature
        ? toPolygons(hainanFeature).filter((polygon) => {
              const bounds = polygonBounds(polygon);

              return bounds.maxLat <= 18 && bounds.minLon >= 108 && bounds.maxLon <= 119;
          })
        : [];
    const dashPolygons = nineDashLineFeature ? toPolygons(nineDashLineFeature) : [];
    const southChinaSeaPolygons = [
        ...landPolygons.map((polygon) => ({ polygon, tone: 'land' as const })),
        ...dashPolygons.map((polygon) => ({ polygon, tone: 'dash' as const })),
    ];

    if (!southChinaSeaPolygons.length) {
        return [];
    }

    const insetBounds = southChinaSeaPolygons.reduce(
        (acc, { polygon }) => {
            const bounds = polygonBounds(polygon);

            return {
                minLon: Math.min(acc.minLon, bounds.minLon),
                maxLon: Math.max(acc.maxLon, bounds.maxLon),
                minLat: Math.min(acc.minLat, bounds.minLat),
                maxLat: Math.max(acc.maxLat, bounds.maxLat),
            };
        },
        {
            minLon: Number.POSITIVE_INFINITY,
            maxLon: Number.NEGATIVE_INFINITY,
            minLat: Number.POSITIVE_INFINITY,
            maxLat: Number.NEGATIVE_INFINITY,
        },
    );

    const viewWidth = 128;
    const viewHeight = 112;
    const padding = 10;
    const width = insetBounds.maxLon - insetBounds.minLon || 1;
    const height = insetBounds.maxLat - insetBounds.minLat || 1;
    const scale = Math.min((viewWidth - padding * 2) / width, (viewHeight - padding * 2) / height);
    const contentWidth = width * scale;
    const contentHeight = height * scale;
    const offsetX = (viewWidth - contentWidth) / 2;
    const offsetY = (viewHeight - contentHeight) / 2;

    const project = ([lon, lat]: number[]) => {
        const x = offsetX + (lon - insetBounds.minLon) * scale;
        const y = offsetY + contentHeight - (lat - insetBounds.minLat) * scale;

        return [Number(x.toFixed(2)), Number(y.toFixed(2))] as const;
    };

    return southChinaSeaPolygons.map(({ polygon, tone }, polygonIndex) => {
        const d = polygon
            .map((ring) =>
                ring
                    .map((point, pointIndex) => {
                        const [x, y] = project(point);

                        return `${pointIndex === 0 ? 'M' : 'L'}${x} ${y}`;
                    })
                    .join(' ')
                    .concat(' Z'),
            )
            .join(' ');

        return {
            id: `south-china-sea-${polygonIndex}`,
            d,
            tone,
        };
    });
}

function SouthChinaSeaInset() {
    const [paths, setPaths] = useState<SouthChinaSeaInsetPath[]>([]);

    useEffect(() => {
        let cancelled = false;

        async function loadInsetData() {
            const collection = await fetchDataVChinaCollection();

            if (!cancelled) {
                setPaths(collection ? buildSouthChinaSeaInsetPaths(collection) : []);
            }
        }

        void loadInsetData();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="pointer-events-none absolute right-10 bottom-14 h-28 w-32 border border-[#34AF61] bg-white/90">
            <svg className="h-full w-full" viewBox="0 0 128 112" aria-hidden="true">
                {paths.map((path) => (
                    <path
                        key={path.id}
                        d={path.d}
                        fill={path.tone === 'dash' ? '#222222' : '#22B520'}
                        stroke={path.tone === 'dash' ? '#222222' : '#22B520'}
                        strokeWidth={path.tone === 'dash' ? '0.4' : '0.8'}
                    />
                ))}
            </svg>
        </div>
    );
}

export function NetworkGeoMap({ summaries, probes, focusCountry, countryLabels, onDrillDown }: NetworkGeoMapProps) {
    const { t, language } = useI18n();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<unknown>(null);
    const registeredMapsRef = useRef(new Set<string>());
    const onDrillDownRef = useRef(onDrillDown);
    const focusCountryRef = useRef<CountryKey | null>(focusCountry);
    const summaryByMapNameRef = useRef(new Map<string, CountrySummary>());
    const countryKeyByMapNameRef = useRef(new Map<string, CountryKey>());
    const provinceFeatureCollectionsRef = useRef(new Map<string, GeoFeatureCollection>());
    const mapOptionRef = useRef<Record<string, unknown> | null>(null);
    const [provinceMapReadyToken, setProvinceMapReadyToken] = useState(0);

    const summaryByMapName = useMemo(
        () => new Map(summaries.map((summary) => [networkCountryMap[summary.key].mapName, summary] as const)),
        [summaries],
    );
    const countryKeyByMapName = useMemo(
        () => new Map(Object.values(networkCountryMap).map((country) => [country.mapName, country.key] as const)),
        [],
    );
    const activeProvinceMapKey = focusCountry ? `${focusCountry}-${language}` : null;
    const provinceFeatures = activeProvinceMapKey
        ? (provinceFeatureCollectionsRef.current.get(activeProvinceMapKey) ?? null)
        : null;
    const showSouthChinaSeaInset = focusCountry === 'cn' && Boolean(provinceFeatures);
    const provinceMetrics = useMemo(() => {
        if (!focusCountry || !provinceFeatures) {
            return new Map<string, ProvinceMetric>();
        }

        return buildProvinceMetrics(
            probes.filter((probe) => probe.countryKey === focusCountry),
            provinceFeatures,
        );
    }, [focusCountry, probes, provinceFeatures]);
    const activeMapName = activeProvinceMapKey && provinceFeatures ? activeProvinceMapKey : WORLD_MAP_NAME;
    const mapOption = useMemo(() => {
        const worldSeriesData = summaries.map((summary) => ({
            name: networkCountryMap[summary.key].mapName,
            value: resolveVisualValue(summary.avgMs, summary.packetLossAlerts > 0 ? 1 : 0),
        }));
        const worldMapData = focusCountry
            ? worldSeriesData
            : [
                  ...worldSeriesData,
                  {
                      name: NINE_DASH_LINE_NAME,
                      value: -1,
                      itemStyle: {
                          areaColor: '#222222',
                          borderColor: '#222222',
                      },
                      emphasis: {
                          itemStyle: {
                              areaColor: '#222222',
                          },
                      },
                  },
              ];
        const provinceSeriesData = Array.from(provinceMetrics.values()).map((metric) => ({
            name: metric.name,
            value: resolveVisualValue(metric.avgMs, metric.packetLoss),
        }));
        const provinceSeriesNameSet = new Set(provinceSeriesData.map((item) => item.name));
        const provinceFallbackData =
            focusCountry && provinceFeatures
                ? provinceFeatures.features
                      .map((feature) => {
                          const name = typeof feature.properties.name === 'string' ? feature.properties.name : null;

                          if (!name || provinceSeriesNameSet.has(name)) {
                              return null;
                          }

                          return {
                              name,
                              value: -1,
                          };
                      })
                      .filter((item): item is { name: string; value: number } => item !== null)
                : [];
        const focusedRegionStyles =
            focusCountry === 'cn' && provinceFeatures
                ? Array.from(southChinaSeaRegionNames).map((name) => ({
                      name,
                      itemStyle: {
                          areaColor: '#F7FAF8',
                          borderColor: '#34AF61',
                          borderWidth: 1.6,
                      },
                  }))
                : [];
        const regionStyles = [
            ...focusedRegionStyles,
            {
                name: NINE_DASH_LINE_NAME,
                itemStyle: {
                    areaColor: '#222222',
                    borderColor: '#222222',
                },
                emphasis: {
                    itemStyle: {
                        areaColor: '#222222',
                    },
                },
                select: {
                    disabled: true,
                },
            },
        ];

        return {
            backgroundColor: 'transparent',
            animationDuration: 320,
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(24, 38, 28, 0.88)',
                borderWidth: 0,
                textStyle: {
                    color: '#FFFFFF',
                    fontSize: 12,
                },
                formatter: (rawParams: Record<string, unknown>) => {
                    const params = rawParams as { name?: string };

                    if (focusCountry && provinceFeatures) {
                        const metric = params.name ? provinceMetrics.get(params.name) : null;

                        if (!metric) {
                            return [
                                `<div style="font-weight:600;margin-bottom:6px;">${params.name ?? '--'}</div>`,
                                `<div>${t('network.noProbeData')}</div>`,
                            ].join('');
                        }

                        return [
                            `<div style="font-weight:600;margin-bottom:6px;">${metric.name}</div>`,
                            `<div>${t('network.summaryAverage')}: ${formatMs(metric.avgMs)}</div>`,
                            `<div>${t('network.columnLoss')}: ${metric.packetLoss.toFixed(metric.packetLoss >= 10 ? 0 : 1)}%</div>`,
                            `<div>${metric.count}${t('network.pointsSuffix')}</div>`,
                            `<div style="margin-top:6px;">${metric.locations.join('<br/>')}</div>`,
                        ].join('');
                    }

                    const summary = params.name ? summaryByMapName.get(params.name) : null;

                    if (!summary) {
                        return `<div style="font-weight:600;">${params.name ?? '--'}</div>`;
                    }

                    return [
                        `<div style="font-weight:600;margin-bottom:6px;">${countryLabels[summary.key]}</div>`,
                        `<div>${t('network.summaryAverage')}: ${formatMs(summary.avgMs)}</div>`,
                        `<div>${t('network.summaryFastest')}: ${summary.fastestLabel}</div>`,
                        `<div>${t('network.summarySlowest')}: ${summary.slowestLabel}</div>`,
                        `<div>${summary.count}${t('network.pointsSuffix')}</div>`,
                    ].join('');
                },
            },
            visualMap: {
                type: 'piecewise',
                left: 18,
                bottom: 18,
                orient: 'vertical',
                itemWidth: 18,
                itemHeight: 12,
                textStyle: {
                    color: '#5A6779',
                    fontSize: 12,
                },
                pieces: [
                    { gte: 1000, label: 'Loss / Failed', color: '#EF4444' },
                    { gt: 250, lt: 1000, label: '> 250ms', color: '#FB923C' },
                    { gt: 200, lte: 250, label: '201ms - 250ms', color: '#FACC15' },
                    { gt: 100, lte: 200, label: '101ms - 200ms', color: '#BEF264' },
                    { gt: 50, lte: 100, label: '51ms - 100ms', color: '#4ADE80' },
                    { gte: 0, lte: 50, label: '<= 50ms', color: '#10B981' },
                ],
                outOfRange: {
                    color: '#F7FAF8',
                },
            },
            series: [
                {
                    type: 'map',
                    map: activeMapName,
                    roam: true,
                    zoom: focusCountry && provinceFeatures ? 1.08 : 1.38,
                    layoutCenter: ['50%', focusCountry && provinceFeatures ? '50%' : '47%'],
                    layoutSize: focusCountry && provinceFeatures ? '118%' : '150%',
                    scaleLimit: {
                        min: 1,
                        max: 12,
                    },
                    itemStyle: {
                        areaColor: '#F7FAF8',
                        borderColor: '#E4F0E8',
                        borderWidth: 1,
                    },
                    emphasis: {
                        label: {
                            show: false,
                            color: '#1D2A22',
                        },
                        itemStyle: {
                            areaColor: '#7ACC63',
                        },
                    },
                    select: {
                        disabled: true,
                    },
                    label: {
                        show: false,
                        fontSize: 10,
                        color: '#627086',
                    },
                    regions: regionStyles,
                    data:
                        focusCountry && provinceFeatures
                            ? [...provinceFallbackData, ...provinceSeriesData]
                            : worldMapData,
                },
            ],
        } satisfies Record<string, unknown>;
    }, [activeMapName, countryLabels, focusCountry, provinceFeatures, provinceMetrics, summaries, summaryByMapName, t]);

    useEffect(() => {
        mapOptionRef.current = mapOption;
    }, [mapOption]);

    useEffect(() => {
        onDrillDownRef.current = onDrillDown;
    }, [onDrillDown]);

    useEffect(() => {
        focusCountryRef.current = focusCountry;
    }, [focusCountry]);

    useEffect(() => {
        summaryByMapNameRef.current = summaryByMapName;
    }, [summaryByMapName]);

    useEffect(() => {
        countryKeyByMapNameRef.current = countryKeyByMapName;
    }, [countryKeyByMapName]);

    useEffect(() => {
        let cancelled = false;
        let resizeObserver: ResizeObserver | null = null;

        async function setupChart() {
            if (!containerRef.current) {
                return;
            }

            const echarts = await import('echarts/core');
            const { MapChart } = await import('echarts/charts');
            const { TooltipComponent, VisualMapComponent } = await import('echarts/components');
            const { CanvasRenderer } = await import('echarts/renderers');
            const worldAtlas = (await import('world-atlas/countries-110m.json')).default as Record<string, unknown>;
            const { feature } = await import('topojson-client');
            const datavChinaCollection = await fetchDataVChinaCollection();

            if (cancelled || !containerRef.current) {
                return;
            }

            echarts.use([MapChart, TooltipComponent, VisualMapComponent, CanvasRenderer]);

            if (!registeredMapsRef.current.has(WORLD_MAP_NAME)) {
                const baseWorldFeature = sanitizeWorldFeatureCollection(
                    feature(
                        worldAtlas as never,
                        (worldAtlas.objects as { countries: unknown }).countries as never,
                    ) as unknown as GeoFeatureCollection,
                );
                const worldFeature = mergeChinaFeatureCollection(baseWorldFeature, datavChinaCollection);

                echarts.registerMap(WORLD_MAP_NAME, worldFeature as never);
                registeredMapsRef.current.add(WORLD_MAP_NAME);
            }

            const chart = echarts.init(containerRef.current);
            chartRef.current = chart;

            if (mapOptionRef.current) {
                chart.setOption(mapOptionRef.current, true);
            }

            const resizeHandler = () => {
                (chartRef.current as EChartsInstanceLike | null)?.resize();
            };

            resizeObserver = new ResizeObserver(resizeHandler);
            resizeObserver.observe(containerRef.current);

            chart.on('click', (params) => {
                if (focusCountryRef.current) {
                    return;
                }

                const countryName =
                    typeof (params as { name?: unknown }).name === 'string' ? (params as { name: string }).name : null;
                const countryKey = countryName ? countryKeyByMapNameRef.current.get(countryName) : null;

                if (!countryKey) {
                    return;
                }

                onDrillDownRef.current(countryKey);
            });
        }

        void setupChart();

        return () => {
            cancelled = true;
            resizeObserver?.disconnect();
            (chartRef.current as EChartsInstanceLike | null)?.dispose();
            chartRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!focusCountry || !activeProvinceMapKey || provinceFeatureCollectionsRef.current.has(activeProvinceMapKey)) {
            return;
        }

        const countryKey = focusCountry;
        const provinceMapKey = activeProvinceMapKey;
        let cancelled = false;

        async function loadProvinceMap() {
            try {
                const [echarts, response] = await Promise.all([
                    import('echarts/core'),
                    fetch(`/maps/admin1/${countryKey}.json`),
                ]);

                if (cancelled || !response.ok) {
                    return;
                }

                const sourceCollection = (await response.json()) as GeoFeatureCollection;
                const provinceCollection = buildProvinceFeatureCollection(sourceCollection, countryKey, language);

                if (cancelled || !provinceCollection.features.length) {
                    return;
                }

                provinceFeatureCollectionsRef.current.set(provinceMapKey, provinceCollection);

                if (!registeredMapsRef.current.has(provinceMapKey)) {
                    echarts.registerMap(provinceMapKey, provinceCollection as never);
                    registeredMapsRef.current.add(provinceMapKey);
                }

                setProvinceMapReadyToken((value) => value + 1);
            } catch {
                // Keep the current map visible if a country asset fails to load.
            }
        }

        void loadProvinceMap();

        return () => {
            cancelled = true;
        };
    }, [activeProvinceMapKey, focusCountry, language]);

    useEffect(() => {
        void provinceMapReadyToken;

        if (focusCountry && activeProvinceMapKey && !provinceFeatures) {
            return;
        }

        (chartRef.current as EChartsInstanceLike | null)?.setOption(mapOption, true);
    }, [activeProvinceMapKey, focusCountry, mapOption, provinceFeatures, provinceMapReadyToken]);

    return (
        <div className="relative h-[34rem] w-full overflow-hidden rounded-[2rem]">
            <div ref={containerRef} className="h-full w-full" />
            {showSouthChinaSeaInset ? <SouthChinaSeaInset /> : null}
        </div>
    );
}
