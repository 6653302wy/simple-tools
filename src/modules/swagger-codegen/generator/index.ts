import { buildOperationList } from './operations';
import { renderApisFile } from './render-apis';
import { appendModelDeclaration, getSchemaRegistryEntries } from './schema';
import { detectServices, getDetectionBaseUrl } from './services';
import type {
    ApiServiceConfig,
    DetectSwaggerServicesOptions,
    GeneratedSwaggerSdk,
    GenerateSwaggerSdkOptions,
    GeneratorContext,
} from './types';
import {
    CUSTOM_REQUEST_PATTERN,
    formatGeneratedTypeScript,
    getSpecTitle,
    normalizeAbsoluteUrl,
    readRecord,
    schemaFingerprint,
    toPascalCase,
    uniqueName,
} from './utils';

export type {
    ApiServiceConfig,
    DetectSwaggerServicesOptions,
    GeneratedSwaggerSdk,
    GenerateSwaggerSdkOptions,
} from './types';

export function detectSwaggerServices({
    baseUrl = '',
    sourceUrl = '',
    spec: specInput,
}: DetectSwaggerServicesOptions): ApiServiceConfig[] {
    const spec = readRecord(specInput);

    if (!spec) {
        throw new Error('Swagger/OpenAPI JSON must be an object.');
    }

    const services = detectServices(spec, getDetectionBaseUrl(baseUrl.trim(), sourceUrl.trim()), []);

    return services.map((service) => ({
        baseUrl: service.baseUrl,
        key: service.key,
        name: service.name,
    }));
}

export function generateSwaggerTypeScriptSdk({
    baseUrl,
    customRequestFunction = '',
    requestHeaders = {},
    services: configuredServices = [],
    spec: specInput,
}: GenerateSwaggerSdkOptions): GeneratedSwaggerSdk {
    const spec = readRecord(specInput);
    const normalizedBaseUrl = baseUrl.trim();
    const normalizedCustomRequestFunction = customRequestFunction.trim();

    if (!spec) {
        throw new Error('Swagger/OpenAPI JSON must be an object.');
    }

    if (!normalizedBaseUrl) {
        throw new Error('Base URL is required.');
    }

    if (!normalizeAbsoluteUrl(normalizedBaseUrl, normalizedBaseUrl)) {
        throw new Error('Base URL must be a valid absolute URL.');
    }

    if (normalizedCustomRequestFunction && !CUSTOM_REQUEST_PATTERN.test(normalizedCustomRequestFunction)) {
        throw new Error('Custom request function must be an identifier, for example request or apiClient.request.');
    }

    const context: GeneratorContext = {
        declarations: [],
        declarationsByName: new Set(),
        interfaceNameByFingerprint: new Map(),
        modelNameByFingerprint: new Map(),
        refNameByRef: new Map(),
        spec,
        usedModelNames: new Set(),
    };

    for (const entry of getSchemaRegistryEntries(spec)) {
        const name = uniqueName(toPascalCase(entry.name), context.usedModelNames);
        const fingerprint = schemaFingerprint(entry.schema);
        const duplicatedName = context.modelNameByFingerprint.get(fingerprint);

        if (duplicatedName) {
            for (const ref of entry.refs) {
                context.refNameByRef.set(ref, duplicatedName);
            }
            continue;
        }

        context.modelNameByFingerprint.set(fingerprint, name);

        for (const ref of entry.refs) {
            context.refNameByRef.set(ref, name);
        }

        appendModelDeclaration(name, entry.schema, context);
    }

    const services = detectServices(spec, normalizedBaseUrl, configuredServices);
    const operations = buildOperationList(spec, context, services, normalizedBaseUrl);

    if (operations.length === 0) {
        throw new Error('No API operations found in paths.');
    }

    const models = formatGeneratedTypeScript(
        context.declarations.map((declaration) => declaration.declaration).join('\n\n'),
    );
    const apis = formatGeneratedTypeScript(
        renderApisFile(operations, context, services, normalizedCustomRequestFunction, requestHeaders),
    );

    return {
        apis,
        models,
        services: services.map((service) => ({
            baseUrl: service.baseUrl,
            key: service.key,
            name: service.name,
        })),
        summary: {
            modelCount: context.declarations.length,
            operationCount: operations.length,
            serviceCount: services.length,
            title: getSpecTitle(spec),
        },
    };
}
