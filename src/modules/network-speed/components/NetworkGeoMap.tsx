'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { type CountryKey, networkCountryMap } from '@/modules/network-speed/countries';
import type { CountrySummary, ProbeEntry } from '@/modules/network-speed/types';
import { useI18n } from '@/services/i18n';

const WORLD_MAP_NAME = 'network-world-map';

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
    const admin1CollectionRef = useRef<GeoFeatureCollection | null>(null);
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
        const provinceSeriesData = Array.from(provinceMetrics.values()).map((metric) => ({
            name: metric.name,
            value: resolveVisualValue(metric.avgMs, metric.packetLoss),
        }));

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
                    data: focusCountry && provinceFeatures ? provinceSeriesData : worldSeriesData,
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
            const admin1Collection = (await import('geojson-places/data/states/admin1.json'))
                .default as GeoFeatureCollection;
            const { feature } = await import('topojson-client');

            if (cancelled || !containerRef.current) {
                return;
            }

            admin1CollectionRef.current = admin1Collection;
            echarts.use([MapChart, TooltipComponent, VisualMapComponent, CanvasRenderer]);

            if (!registeredMapsRef.current.has(WORLD_MAP_NAME)) {
                const worldFeature = sanitizeWorldFeatureCollection(
                    feature(
                        worldAtlas as never,
                        (worldAtlas.objects as { countries: unknown }).countries as never,
                    ) as unknown as GeoFeatureCollection,
                );

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
        if (
            !focusCountry ||
            !admin1CollectionRef.current ||
            !activeProvinceMapKey ||
            provinceFeatureCollectionsRef.current.has(activeProvinceMapKey)
        ) {
            return;
        }

        const echartsPromise = import('echarts/core');
        void echartsPromise.then((echarts) => {
            const provinceCollection = buildProvinceFeatureCollection(
                admin1CollectionRef.current as GeoFeatureCollection,
                focusCountry,
                language,
            );

            if (!provinceCollection.features.length) {
                return;
            }

            provinceFeatureCollectionsRef.current.set(activeProvinceMapKey, provinceCollection);

            if (!registeredMapsRef.current.has(activeProvinceMapKey)) {
                echarts.registerMap(activeProvinceMapKey, provinceCollection as never);
                registeredMapsRef.current.add(activeProvinceMapKey);
            }

            setProvinceMapReadyToken((value) => value + 1);
        });
    }, [activeProvinceMapKey, focusCountry, language]);

    useEffect(() => {
        void provinceMapReadyToken;

        if (focusCountry && activeProvinceMapKey && !provinceFeatures && admin1CollectionRef.current) {
            return;
        }

        (chartRef.current as EChartsInstanceLike | null)?.setOption(mapOption, true);
    }, [activeProvinceMapKey, focusCountry, mapOption, provinceFeatures, provinceMapReadyToken]);

    return <div ref={containerRef} className="h-[34rem] w-full overflow-hidden rounded-[2rem]" />;
}
