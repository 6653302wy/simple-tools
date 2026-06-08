import {
    ensureOperationSchemaModel,
    getContentSchema,
    getContentSchemaInfo,
    normalizeSchema,
    schemaToType,
} from './schema';
import { getOperationService, stripServicePathPrefix } from './services';
import type {
    ApiOperation,
    ApiParameter,
    ApiParameterLocation,
    ApiService,
    GeneratorContext,
    JsonRecord,
    RequestBodySchema,
} from './types';
import {
    HTTP_METHODS,
    quotePropertyName,
    readArray,
    readDescription,
    readRecord,
    readString,
    renderJSDoc,
    resolveRecordRef,
    splitCommentLines,
    toCamelCase,
    toPascalCase,
    uniqueName,
} from './utils';

function getConsumesContentType(operation: JsonRecord, spec: JsonRecord) {
    const operationConsumes = readArray(operation.consumes).find((value): value is string => typeof value === 'string');
    const specConsumes = readArray(spec.consumes).find((value): value is string => typeof value === 'string');

    return operationConsumes || specConsumes || 'application/json';
}

function readParameters(parametersInput: unknown, context: GeneratorContext): JsonRecord[] {
    return readArray(parametersInput).flatMap((parameterInput) => {
        const resolved = resolveRecordRef(context.spec, parameterInput);

        return resolved ? [resolved] : [];
    });
}

function parameterToApiParameter(parameter: JsonRecord): ApiParameter | null {
    const name = readString(parameter.name);
    const rawLocation = readString(parameter.in);

    if (!name || !['path', 'query', 'header'].includes(rawLocation)) {
        return null;
    }

    const location = rawLocation as ApiParameterLocation;
    const schema = readRecord(parameter.schema) ?? getContentSchema(parameter.content) ?? normalizeSchema(parameter);

    return {
        description: readDescription(parameter.description, schema.description),
        location,
        name,
        required: parameter.required === true || location === 'path',
        schema,
    };
}

function getRequestBodySchema(
    operation: JsonRecord,
    parameters: JsonRecord[],
    context: GeneratorContext,
): RequestBodySchema | null {
    const requestBody = resolveRecordRef(context.spec, operation.requestBody);
    const requestBodySchema = getContentSchemaInfo(requestBody?.content);

    if (requestBodySchema) {
        return {
            contentType: requestBodySchema.contentType,
            description: readDescription(requestBody?.description, requestBodySchema.schema.description),
            required: requestBody?.required === true,
            schema: requestBodySchema.schema,
        };
    }

    const bodyParameter = parameters.find((parameter) => readString(parameter.in) === 'body');
    const bodySchema = readRecord(bodyParameter?.schema);

    if (bodySchema) {
        return {
            contentType: getConsumesContentType(operation, context.spec),
            description: readDescription(bodyParameter?.description, bodySchema.description),
            required: bodyParameter?.required === true,
            schema: bodySchema,
        };
    }

    const formParameters = parameters.filter((parameter) => readString(parameter.in) === 'formData');

    if (formParameters.length > 0) {
        const requiredNames = formParameters
            .filter((parameter) => parameter.required === true)
            .map((parameter) => readString(parameter.name))
            .filter(Boolean);
        const properties = Object.fromEntries(
            formParameters
                .map((parameter) => [readString(parameter.name), normalizeSchema(parameter)] as const)
                .filter(([name]) => Boolean(name)),
        );

        return {
            contentType: getConsumesContentType(operation, context.spec),
            description: readDescription(...formParameters.map((parameter) => parameter.description)),
            required: requiredNames.length > 0,
            schema: {
                properties,
                required: requiredNames,
                type: 'object',
            },
        };
    }

    return null;
}

function getResponseSchema(operation: JsonRecord, context: GeneratorContext) {
    const responses = readRecord(operation.responses);

    if (!responses) {
        return undefined;
    }

    const sortedKeys = Object.keys(responses).sort((leftKey, rightKey) => {
        const leftRank = leftKey.startsWith('2') ? 0 : leftKey === 'default' ? 1 : 2;
        const rightRank = rightKey.startsWith('2') ? 0 : rightKey === 'default' ? 1 : 2;

        return leftRank - rightRank || leftKey.localeCompare(rightKey);
    });

    for (const key of sortedKeys) {
        const response = resolveRecordRef(context.spec, responses[key]);
        const contentSchema = getContentSchema(response?.content);
        const swaggerSchema = readRecord(response?.schema);
        const schema = contentSchema ?? swaggerSchema;

        if (schema) {
            return {
                description: readDescription(response?.description, schema?.description),
                schema,
            };
        }
    }

    return undefined;
}

function formatRouteNameSegment(segment: string) {
    const pathParam = segment.match(/^\{(.+)\}$/) ?? segment.match(/^:(.+)$/);

    if (pathParam) {
        return `by ${pathParam[1]}`;
    }

    return segment;
}

function getRouteNameSeed(path: string) {
    const rawSegments = path
        .split('/')
        .map((segment) => segment.trim())
        .filter(Boolean);
    const lastRawSegment = rawSegments.at(-1) ?? 'api';
    const previousSegment = rawSegments.at(-2);
    const lastSegment = formatRouteNameSegment(lastRawSegment);
    const isLastSegmentPathParam = /^\{.+\}$/.test(lastRawSegment) || /^:.+/.test(lastRawSegment);

    if (isLastSegmentPathParam && previousSegment) {
        return `${formatRouteNameSegment(previousSegment)} ${lastSegment}`;
    }

    return lastSegment;
}

function getOperationName(path: string, usedFunctionNames: Set<string>) {
    return uniqueName(toCamelCase(getRouteNameSeed(path), 'callApi'), usedFunctionNames);
}

function getOperationModelBaseName(path: string) {
    return toPascalCase(getRouteNameSeed(path), 'Api');
}

type InterfacePropertyEntry = {
    description: string;
    name: string;
    optional: boolean;
    typeText: string;
};

function appendInterfaceModel(name: string, propertyEntries: InterfacePropertyEntry[], context: GeneratorContext) {
    const fingerprint = JSON.stringify(
        propertyEntries
            .map(({ name: propertyName, optional, typeText }) => ({ name: propertyName, optional, typeText }))
            .sort((left, right) => left.name.localeCompare(right.name)),
    );
    const duplicatedName = context.interfaceNameByFingerprint.get(fingerprint);

    if (duplicatedName) {
        return duplicatedName;
    }

    const typeName = uniqueName(toPascalCase(name), context.usedModelNames);
    const declaration = [
        `export interface ${typeName} {`,
        ...propertyEntries.flatMap((property) => {
            const optionalToken = property.optional ? '?' : '';
            const parameterComment = renderJSDoc(splitCommentLines(property.description), '    ');

            return [
                ...parameterComment,
                `    ${quotePropertyName(property.name)}${optionalToken}: ${property.typeText};`,
            ];
        }),
        '}',
    ].join('\n');

    context.interfaceNameByFingerprint.set(fingerprint, typeName);
    context.declarations.push({ declaration, name: typeName });
    context.declarationsByName.add(typeName);

    return typeName;
}

function buildOperationRequestModel(
    modelBaseName: string,
    parameters: ApiParameter[],
    requestBody: ReturnType<typeof getRequestBodySchema>,
    context: GeneratorContext,
) {
    if (parameters.length === 0 && !requestBody) {
        return {
            requestBodyOnly: false,
            requestRequired: false,
            requestType: '',
        };
    }

    const requestName = `${modelBaseName}Request`;

    if (parameters.length === 0 && requestBody) {
        return {
            requestBodyOnly: true,
            requestRequired: requestBody.required,
            requestType: ensureOperationSchemaModel(requestName, requestBody.schema, context),
        };
    }

    const parameterEntries = parameters.map((parameter) => ({
        description: parameter.description,
        name: parameter.name,
        optional: !parameter.required,
        typeText: schemaToType(parameter.schema, context, `${requestName}${toPascalCase(parameter.name)}`),
    }));
    const bodyEntry: InterfacePropertyEntry[] = requestBody
        ? [
              {
                  description: requestBody.description,
                  name: 'body',
                  optional: !requestBody.required,
                  typeText: schemaToType(requestBody.schema, context, `${requestName}Body`),
              },
          ]
        : [];

    return {
        requestBodyOnly: false,
        requestRequired: [...parameterEntries, ...bodyEntry].some((property) => !property.optional),
        requestType: appendInterfaceModel(requestName, [...parameterEntries, ...bodyEntry], context),
    };
}

export function buildOperationList(
    spec: JsonRecord,
    context: GeneratorContext,
    services: ApiService[],
    baseUrl: string,
): ApiOperation[] {
    const paths = readRecord(spec.paths);

    if (!paths) {
        throw new Error('Swagger/OpenAPI paths is missing.');
    }

    const usedFunctionNames = new Set<string>();
    const operations: ApiOperation[] = [];

    for (const [path, pathItemInput] of Object.entries(paths)) {
        const pathItem = readRecord(pathItemInput);

        if (!pathItem) {
            continue;
        }

        const pathParameters = readParameters(pathItem.parameters, context);

        for (const [method, operationInput] of Object.entries(pathItem)) {
            if (!HTTP_METHODS.has(method)) {
                continue;
            }

            const operation = readRecord(operationInput);

            if (!operation) {
                continue;
            }

            const rawParameters = [...pathParameters, ...readParameters(operation.parameters, context)];
            const apiParameters = rawParameters.flatMap((parameter) => {
                const apiParameter = parameterToApiParameter(parameter);

                return apiParameter ? [apiParameter] : [];
            });
            const functionName = getOperationName(path, usedFunctionNames);
            const modelBaseName = getOperationModelBaseName(path);
            const service = getOperationService(path, pathItem, operation, services, baseUrl);
            const requestBody = getRequestBodySchema(operation, rawParameters, context);
            const responseSchema = getResponseSchema(operation, context);
            const requestModel = buildOperationRequestModel(modelBaseName, apiParameters, requestBody, context);
            const responseType = responseSchema
                ? ensureOperationSchemaModel(`${modelBaseName}Response`, responseSchema.schema, context)
                : 'void';

            operations.push({
                bodyDescription: requestBody?.description ?? '',
                description: readDescription(operation.summary, operation.description),
                functionName,
                headerParameters: apiParameters.filter((parameter) => parameter.location === 'header'),
                hasRequestBody: Boolean(requestBody),
                method: method.toUpperCase(),
                path: stripServicePathPrefix(path, service),
                pathParameters: apiParameters.filter((parameter) => parameter.location === 'path'),
                queryParameters: apiParameters.filter((parameter) => parameter.location === 'query'),
                requestBodyOnly: requestModel.requestBodyOnly,
                requestContentType: requestBody?.contentType ?? 'application/json',
                requestRequired: requestModel.requestRequired,
                requestType: requestModel.requestType,
                responseDescription: responseSchema?.description ?? '',
                responseType,
                serviceKey: service.key,
            });
        }
    }

    return operations;
}
