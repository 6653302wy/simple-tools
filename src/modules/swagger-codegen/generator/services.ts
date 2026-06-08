import type { ApiService, ApiServiceConfig, JsonRecord } from './types';
import {
    getSpecTitle,
    HTTP_METHODS,
    normalizeAbsoluteUrl,
    readArray,
    readRecord,
    readString,
    toCamelCase,
    uniqueName,
} from './utils';

function resolveServerTemplate(url: string, serverInput: JsonRecord) {
    const variables = readRecord(serverInput.variables);

    if (!variables) {
        return url;
    }

    return url.replace(/\{([^}]+)\}/g, (placeholder, key: string) => {
        const defaultValue = readString(readRecord(variables[key])?.default);

        return defaultValue || placeholder;
    });
}

function normalizeUrlPath(pathname: string) {
    const normalized = pathname.replace(/\/+$/g, '');

    return normalized || '/';
}

function getUrlPathPrefix(url: string) {
    try {
        return normalizeUrlPath(new URL(url).pathname);
    } catch {
        return '/';
    }
}

function getServiceNameFromUrl(url: string) {
    try {
        const parsedUrl = new URL(url);
        const pathName = normalizeUrlPath(parsedUrl.pathname);
        const pathSegment = pathName === '/' ? '' : pathName.split('/').filter(Boolean).at(-1);

        return pathSegment || parsedUrl.hostname || 'Default';
    } catch {
        return 'Default';
    }
}

function normalizeServiceKey(value: string, usedKeys: Set<string>) {
    return uniqueName(toCamelCase(value, 'service'), usedKeys);
}

function normalizeServiceConfig(service: ApiServiceConfig, index: number, baseUrl: string, usedKeys: Set<string>) {
    const normalizedUrl = normalizeAbsoluteUrl(service.baseUrl, baseUrl);

    if (!normalizedUrl) {
        throw new Error(`Service ${index + 1} baseUrl must be a valid absolute URL.`);
    }

    const name = (service.name ?? '').trim() || getServiceNameFromUrl(normalizedUrl);
    const keySeed = (service.key ?? '').trim() || name || `service ${index + 1}`;

    return {
        baseUrl: normalizedUrl,
        key: normalizeServiceKey(keySeed, usedKeys),
        name,
    };
}

function readServerEntries(serversInput: unknown, fallbackName: string, baseUrl: string) {
    return readArray(serversInput).flatMap((serverInput) => {
        const server = readRecord(serverInput);

        if (!server) {
            return [];
        }

        const rawUrl = resolveServerTemplate(readString(server.url), server);
        const normalizedUrl = normalizeAbsoluteUrl(rawUrl, baseUrl);

        if (!normalizedUrl) {
            return [];
        }

        const name = readString(server.description).trim() || fallbackName || getServiceNameFromUrl(normalizedUrl);

        return [
            {
                baseUrl: normalizedUrl,
                name,
                key: readString(server['x-service-key']).trim() || readString(server.name).trim() || name,
            },
        ];
    });
}

function getSwagger2BaseUrl(spec: JsonRecord, baseUrl: string) {
    const host = readString(spec.host).trim();

    if (!host) {
        return '';
    }

    const basePath = readString(spec.basePath).trim();
    const schemes = readArray(spec.schemes).filter((scheme): scheme is string => typeof scheme === 'string');
    const fallbackProtocol = new URL(baseUrl).protocol.replace(/:$/, '');
    const scheme = schemes[0] || fallbackProtocol || 'https';

    return normalizeAbsoluteUrl(`${scheme}://${host}${basePath || ''}`, baseUrl);
}

function readExtensionServices(spec: JsonRecord): ApiServiceConfig[] {
    return readArray(spec['x-codegen-services']).flatMap((serviceInput) => {
        const service = readRecord(serviceInput);

        if (!service) {
            return [];
        }

        const baseUrl = readString(service.baseUrl || service.url).trim();

        if (!baseUrl) {
            return [];
        }

        return [
            {
                baseUrl,
                key: readString(service.key).trim() || undefined,
                name: readString(service.name).trim() || undefined,
            },
        ];
    });
}

function collectServerServices(spec: JsonRecord, baseUrl: string) {
    const title = getSpecTitle(spec);
    const services: ApiServiceConfig[] = [
        ...readExtensionServices(spec),
        ...readServerEntries(spec.servers, title, baseUrl),
    ];
    const swagger2BaseUrl = getSwagger2BaseUrl(spec, baseUrl);

    if (swagger2BaseUrl) {
        services.push({
            baseUrl: swagger2BaseUrl,
            key: readString(spec.host).trim() || title,
            name: title,
        });
    }

    const paths = readRecord(spec.paths);

    if (!paths) {
        return services;
    }

    for (const pathItemInput of Object.values(paths)) {
        const pathItem = readRecord(pathItemInput);

        if (!pathItem) {
            continue;
        }

        services.push(...readServerEntries(pathItem.servers, title, baseUrl));

        for (const [method, operationInput] of Object.entries(pathItem)) {
            if (!HTTP_METHODS.has(method)) {
                continue;
            }

            const operation = readRecord(operationInput);

            if (operation) {
                services.push(...readServerEntries(operation.servers, title, baseUrl));
            }
        }
    }

    return services;
}

export function detectServices(spec: JsonRecord, baseUrl: string, configuredServices: ApiServiceConfig[]) {
    const rawServices = configuredServices.length > 0 ? configuredServices : collectServerServices(spec, baseUrl);
    const usedKeys = new Set<string>();
    const seenUrls = new Set<string>();
    const services: ApiService[] = [];

    for (const rawService of rawServices) {
        const normalizedService = normalizeServiceConfig(rawService, services.length, baseUrl, usedKeys);

        if (seenUrls.has(normalizedService.baseUrl)) {
            continue;
        }

        seenUrls.add(normalizedService.baseUrl);
        services.push(normalizedService);
    }

    if (services.length > 0) {
        return services;
    }

    return [
        normalizeServiceConfig(
            {
                baseUrl,
                key: 'default',
                name: 'Default',
            },
            0,
            baseUrl,
            usedKeys,
        ),
    ];
}

export function getDetectionBaseUrl(baseUrl: string, sourceUrl: string) {
    for (const value of [baseUrl, sourceUrl, 'https://api.example.com']) {
        const normalizedUrl = normalizeAbsoluteUrl(value, 'https://api.example.com');

        if (normalizedUrl) {
            return normalizedUrl;
        }
    }

    return 'https://api.example.com';
}

function urlsShareBase(leftUrl: string, rightUrl: string) {
    try {
        const left = new URL(leftUrl);
        const right = new URL(rightUrl);

        return left.origin === right.origin && normalizeUrlPath(left.pathname) === normalizeUrlPath(right.pathname);
    } catch {
        return false;
    }
}

function findServiceByUrl(serverUrl: string, services: ApiService[], baseUrl: string) {
    const normalizedUrl = normalizeAbsoluteUrl(serverUrl, baseUrl);

    if (!normalizedUrl) {
        return undefined;
    }

    return services.find((service) => urlsShareBase(service.baseUrl, normalizedUrl));
}

function pathStartsWithPrefix(path: string, prefix: string) {
    return path === prefix || path.startsWith(`${prefix}/`);
}

function findServiceByPathPrefix(path: string, services: ApiService[]) {
    return services
        .map((service) => ({
            prefix: getUrlPathPrefix(service.baseUrl),
            service,
        }))
        .filter(({ prefix }) => prefix !== '/' && pathStartsWithPrefix(path, prefix))
        .sort((left, right) => right.prefix.length - left.prefix.length)[0]?.service;
}

export function getOperationService(
    path: string,
    pathItem: JsonRecord,
    operation: JsonRecord,
    services: ApiService[],
    baseUrl: string,
) {
    const extensionServiceKey = readString(
        operation['x-codegen-service-key'] || pathItem['x-codegen-service-key'],
    ).trim();
    const extensionService = services.find((service) => service.key === extensionServiceKey);

    if (extensionService) {
        return extensionService;
    }

    const operationServer = readServerEntries(operation.servers, '', baseUrl)[0];
    const pathServer = readServerEntries(pathItem.servers, '', baseUrl)[0];
    const matchedByServer = findServiceByUrl(operationServer?.baseUrl || pathServer?.baseUrl || '', services, baseUrl);

    if (matchedByServer) {
        return matchedByServer;
    }

    return findServiceByPathPrefix(path, services) ?? services[0];
}

export function stripServicePathPrefix(path: string, service: ApiService) {
    const prefix = getUrlPathPrefix(service.baseUrl);

    if (prefix === '/' || !pathStartsWithPrefix(path, prefix)) {
        return path;
    }

    const strippedPath = path.slice(prefix.length);

    return strippedPath ? (strippedPath.startsWith('/') ? strippedPath : `/${strippedPath}`) : '/';
}
