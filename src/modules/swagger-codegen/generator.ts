type JsonRecord = Record<string, unknown>;

type ApiParameterLocation = 'path' | 'query' | 'header';

type ApiParameter = {
    description: string;
    name: string;
    location: ApiParameterLocation;
    required: boolean;
    schema: JsonRecord;
};

type RequestBodySchema = {
    description: string;
    required: boolean;
    schema: JsonRecord;
};

type ApiOperation = {
    bodyDescription: string;
    description: string;
    functionName: string;
    headerParameters: ApiParameter[];
    hasRequestBody: boolean;
    method: string;
    path: string;
    pathParameters: ApiParameter[];
    queryParameters: ApiParameter[];
    requestBodyOnly: boolean;
    requestRequired: boolean;
    requestType: string;
    responseDescription: string;
    responseType: string;
};

type ModelDeclaration = {
    declaration: string;
    name: string;
};

type GeneratorContext = {
    declarations: ModelDeclaration[];
    declarationsByName: Set<string>;
    interfaceNameByFingerprint: Map<string, string>;
    modelNameByFingerprint: Map<string, string>;
    refNameByRef: Map<string, string>;
    spec: JsonRecord;
    usedModelNames: Set<string>;
};

export type GeneratedSwaggerSdk = {
    apis: string;
    models: string;
    summary: {
        modelCount: number;
        operationCount: number;
        title: string;
    };
};

export type GenerateSwaggerSdkOptions = {
    baseUrl: string;
    customRequestFunction?: string;
    requestHeaders?: Record<string, string>;
    spec: unknown;
};

const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options']);
const RESERVED_WORDS = new Set([
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'enum',
    'export',
    'extends',
    'false',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'new',
    'null',
    'return',
    'super',
    'switch',
    'this',
    'throw',
    'true',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield',
]);
const IGNORED_SCHEMA_KEYS = new Set([
    'deprecated',
    'description',
    'example',
    'examples',
    'externalDocs',
    'readOnly',
    'title',
    'writeOnly',
    'xml',
]);
const CUSTOM_REQUEST_PATTERN = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/;

function isRecord(value: unknown): value is JsonRecord {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readRecord(value: unknown): JsonRecord | undefined {
    return isRecord(value) ? value : undefined;
}

function readArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

function readString(value: unknown) {
    return typeof value === 'string' ? value : '';
}

function uniqueName(baseName: string, usedNames: Set<string>) {
    let nextName = baseName || 'GeneratedModel';
    let index = 2;

    while (usedNames.has(nextName) || RESERVED_WORDS.has(nextName)) {
        nextName = `${baseName}${index}`;
        index += 1;
    }

    usedNames.add(nextName);
    return nextName;
}

function splitWords(value: string) {
    return value
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .split(/[^A-Za-z0-9]+/)
        .map((word) => word.trim())
        .filter(Boolean);
}

function toPascalCase(value: string, fallback = 'GeneratedModel') {
    const words = splitWords(value);

    if (!words.length) {
        return fallback;
    }

    const name = words.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join('');

    return /^\d/.test(name) ? `${fallback}${name}` : name;
}

function toCamelCase(value: string, fallback = 'generatedOperation') {
    const pascal = toPascalCase(value, fallback);
    const name = `${pascal.charAt(0).toLowerCase()}${pascal.slice(1)}`;

    if (/^\d/.test(name) || RESERVED_WORDS.has(name)) {
        return `${fallback}${pascal}`;
    }

    return name;
}

function quotePropertyName(name: string) {
    return /^[A-Za-z_$][\w$]*$/.test(name) && !RESERVED_WORDS.has(name) ? name : JSON.stringify(name);
}

function toLiteralType(value: unknown): string {
    if (value === null) {
        return 'null';
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return JSON.stringify(value);
    }

    return 'unknown';
}

function readDescription(...values: unknown[]) {
    const descriptions = values
        .map((value) => readString(value).trim())
        .filter(Boolean)
        .filter((value, index, array) => array.indexOf(value) === index);

    return descriptions.join('\n\n');
}

function getSchemaDescription(schemaInput: unknown) {
    return readDescription(readRecord(schemaInput)?.description);
}

function sanitizeCommentText(value: string) {
    return value.replace(/\*\//g, '* /');
}

function splitCommentLines(value: string) {
    return sanitizeCommentText(value.trim()).split(/\r?\n/);
}

function collapseComment(value: string) {
    return splitCommentLines(value)
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' ');
}

function renderJSDoc(lines: string[], indent = '') {
    const visibleLines = lines.filter((line) => line.trim());

    if (!visibleLines.length) {
        return [];
    }

    return [
        `${indent}/**`,
        ...visibleLines.flatMap((line) => splitCommentLines(line).map((commentLine) => `${indent} * ${commentLine}`)),
        `${indent} */`,
    ];
}

function normalizeSchema(schemaInput: unknown): JsonRecord {
    return readRecord(schemaInput) ?? {};
}

function resolvePointer(root: JsonRecord, ref: string): unknown {
    if (!ref.startsWith('#/')) {
        return undefined;
    }

    return ref
        .slice(2)
        .split('/')
        .map((part) => part.replace(/~1/g, '/').replace(/~0/g, '~'))
        .reduce<unknown>((currentValue, key) => {
            if (isRecord(currentValue) && key in currentValue) {
                return currentValue[key];
            }

            return undefined;
        }, root);
}

function resolveRecordRef(spec: JsonRecord, value: unknown): JsonRecord | undefined {
    const record = readRecord(value);
    const ref = readString(record?.$ref);

    if (!ref) {
        return record;
    }

    return readRecord(resolvePointer(spec, ref));
}

function getRefDisplayName(ref: string) {
    const lastPart = ref.split('/').filter(Boolean).at(-1) ?? 'GeneratedModel';

    return decodeURIComponent(lastPart);
}

function canonicalize(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(canonicalize);
    }

    if (!isRecord(value)) {
        return value;
    }

    return Object.fromEntries(
        Object.entries(value)
            .filter(([key]) => !IGNORED_SCHEMA_KEYS.has(key))
            .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
            .map(([key, childValue]) => [key, canonicalize(childValue)]),
    );
}

function schemaFingerprint(schema: JsonRecord) {
    return JSON.stringify(canonicalize(schema));
}

function withNullability(schema: JsonRecord, typeText: string) {
    const rawType = schema.type;
    const hasNullType = Array.isArray(rawType) && rawType.includes('null');

    if ((schema.nullable === true || hasNullType) && !typeText.includes('null')) {
        return `${typeText} | null`;
    }

    return typeText;
}

function ensureRefModel(ref: string, context: GeneratorContext): string {
    const cachedName = context.refNameByRef.get(ref);

    if (cachedName) {
        return cachedName;
    }

    const resolvedSchema = normalizeSchema(resolvePointer(context.spec, ref));
    const fingerprint = schemaFingerprint(resolvedSchema);
    const duplicatedName = context.modelNameByFingerprint.get(fingerprint);

    if (duplicatedName) {
        context.refNameByRef.set(ref, duplicatedName);
        return duplicatedName;
    }

    const name = uniqueName(toPascalCase(getRefDisplayName(ref)), context.usedModelNames);

    context.refNameByRef.set(ref, name);
    context.modelNameByFingerprint.set(fingerprint, name);
    appendModelDeclaration(name, resolvedSchema, context);

    return name;
}

function ensureInlineModel(schema: JsonRecord, preferredName: string, context: GeneratorContext): string {
    const ref = readString(schema.$ref);

    if (ref) {
        return ensureRefModel(ref, context);
    }

    const fingerprint = schemaFingerprint(schema);
    const duplicatedName = context.modelNameByFingerprint.get(fingerprint);

    if (duplicatedName) {
        return duplicatedName;
    }

    const name = uniqueName(toPascalCase(preferredName), context.usedModelNames);

    context.modelNameByFingerprint.set(fingerprint, name);
    appendModelDeclaration(name, schema, context);

    return name;
}

function getSchemaKind(schema: JsonRecord): string {
    const rawType = schema.type;

    if (Array.isArray(rawType)) {
        return rawType.find((typeValue) => typeValue !== 'null') ?? '';
    }

    if (typeof rawType === 'string') {
        return rawType;
    }

    if (readRecord(schema.properties) || schema.additionalProperties) {
        return 'object';
    }

    if (schema.items) {
        return 'array';
    }

    return '';
}

function schemaToType(schemaInput: unknown, context: GeneratorContext, preferredName = ''): string {
    const schema = normalizeSchema(schemaInput);
    const ref = readString(schema.$ref);

    if (ref) {
        return ensureRefModel(ref, context);
    }

    const allOf = readArray(schema.allOf).map((childSchema) => schemaToType(childSchema, context, preferredName));

    if (allOf.length > 0) {
        return withNullability(schema, allOf.join(' & '));
    }

    const oneOf = readArray(schema.oneOf).map((childSchema) => schemaToType(childSchema, context, preferredName));

    if (oneOf.length > 0) {
        return withNullability(schema, oneOf.join(' | '));
    }

    const anyOf = readArray(schema.anyOf).map((childSchema) => schemaToType(childSchema, context, preferredName));

    if (anyOf.length > 0) {
        return withNullability(schema, anyOf.join(' | '));
    }

    const enumValues = readArray(schema.enum);

    if (enumValues.length > 0) {
        return withNullability(schema, enumValues.map(toLiteralType).join(' | '));
    }

    const schemaKind = getSchemaKind(schema);
    let typeText = 'unknown';

    switch (schemaKind) {
        case 'integer':
        case 'number':
            typeText = 'number';
            break;
        case 'boolean':
            typeText = 'boolean';
            break;
        case 'string':
            typeText = schema.format === 'binary' ? 'Blob' : 'string';
            break;
        case 'array': {
            const itemPreferredName = preferredName ? `${preferredName}Item` : '';

            typeText = `Array<${schemaToType(schema.items, context, itemPreferredName)}>`;
            break;
        }
        case 'object':
            if (preferredName) {
                typeText = ensureInlineModel(schema, preferredName, context);
            } else {
                typeText = objectSchemaToInlineType(schema, context, preferredName);
            }
            break;
        default:
            if (preferredName && (schema.properties || schema.additionalProperties)) {
                typeText = ensureInlineModel(schema, preferredName, context);
            }
    }

    return withNullability(schema, typeText);
}

function objectSchemaToInlineType(schema: JsonRecord, context: GeneratorContext, preferredName: string) {
    const properties = readRecord(schema.properties);

    if (!properties) {
        const additionalProperties = schema.additionalProperties;

        if (isRecord(additionalProperties)) {
            return `Record<string, ${schemaToType(additionalProperties, context, preferredName)}>`;
        }

        return 'Record<string, unknown>';
    }

    const required = new Set(readArray(schema.required).filter((item): item is string => typeof item === 'string'));
    const lines = Object.entries(properties).map(([propertyName, propertySchema]) => {
        const propertyType = schemaToType(propertySchema, context, `${preferredName}${toPascalCase(propertyName)}`);
        const optionalToken = required.has(propertyName) ? '' : '?';

        return `${quotePropertyName(propertyName)}${optionalToken}: ${propertyType}`;
    });

    return `{ ${lines.join('; ')} }`;
}

function appendModelDeclaration(name: string, schema: JsonRecord, context: GeneratorContext) {
    if (context.declarationsByName.has(name)) {
        return;
    }

    context.declarationsByName.add(name);
    context.declarations.push({
        declaration: buildModelDeclaration(name, schema, context),
        name,
    });
}

function buildModelDeclaration(name: string, schema: JsonRecord, context: GeneratorContext) {
    const properties = readRecord(schema.properties);
    const schemaKind = getSchemaKind(schema);
    const modelComment = renderJSDoc(splitCommentLines(readDescription(schema.description)));

    if (schemaKind === 'object' && properties) {
        const required = new Set(readArray(schema.required).filter((item): item is string => typeof item === 'string'));
        const propertyLines = Object.entries(properties).flatMap(([propertyName, propertySchema]) => {
            const propertyType = schemaToType(propertySchema, context, `${name}${toPascalCase(propertyName)}`);
            const optionalToken = required.has(propertyName) ? '' : '?';
            const propertyComment = renderJSDoc(splitCommentLines(getSchemaDescription(propertySchema)), '    ');

            return [...propertyComment, `    ${quotePropertyName(propertyName)}${optionalToken}: ${propertyType};`];
        });

        if (schema.additionalProperties) {
            propertyLines.push('    [key: string]: unknown;');
        }

        return [...modelComment, `export interface ${name} {`, ...propertyLines, '}'].join('\n');
    }

    if (schemaKind === 'object' && schema.additionalProperties) {
        const additionalType = isRecord(schema.additionalProperties)
            ? schemaToType(schema.additionalProperties, context, `${name}Value`)
            : 'unknown';

        return [...modelComment, `export type ${name} = Record<string, ${additionalType}>;`].join('\n');
    }

    return [...modelComment, `export type ${name} = ${schemaToType({ ...schema, title: undefined }, context)};`].join(
        '\n',
    );
}

function getComponentSchemas(spec: JsonRecord): JsonRecord {
    const componentsSchemas = readRecord(readRecord(spec.components)?.schemas);
    const definitions = readRecord(spec.definitions);

    return componentsSchemas ?? definitions ?? {};
}

function getContentSchema(value: unknown): JsonRecord | undefined {
    const content = readRecord(value);

    if (!content) {
        return undefined;
    }

    const jsonMediaType =
        readRecord(content['application/json']) ??
        Object.entries(content).find(([mediaType]) => mediaType.includes('+json'))?.[1] ??
        Object.values(content)[0];

    return readRecord(readRecord(jsonMediaType)?.schema);
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
    const requestBodySchema = getContentSchema(requestBody?.content);

    if (requestBodySchema) {
        return {
            description: readDescription(requestBody?.description, requestBodySchema.description),
            required: requestBody?.required === true,
            schema: requestBodySchema,
        };
    }

    const bodyParameter = parameters.find((parameter) => readString(parameter.in) === 'body');
    const bodySchema = readRecord(bodyParameter?.schema);

    if (bodySchema) {
        return {
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

function ensureOperationSchemaModel(name: string, schema: JsonRecord, context: GeneratorContext) {
    const fingerprint = JSON.stringify(canonicalize(schema));
    const duplicatedName = context.interfaceNameByFingerprint.get(fingerprint);

    if (duplicatedName) {
        return duplicatedName;
    }

    const typeName = uniqueName(toPascalCase(name), context.usedModelNames);

    context.interfaceNameByFingerprint.set(fingerprint, typeName);
    appendModelDeclaration(typeName, schema, context);

    return typeName;
}

function buildOperationRequestModel(
    modelBaseName: string,
    parameters: ApiParameter[],
    requestBody: RequestBodySchema | null,
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

function buildOperationList(spec: JsonRecord, context: GeneratorContext) {
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
                path,
                pathParameters: apiParameters.filter((parameter) => parameter.location === 'path'),
                queryParameters: apiParameters.filter((parameter) => parameter.location === 'query'),
                requestBodyOnly: requestModel.requestBodyOnly,
                requestRequired: requestModel.requestRequired,
                requestType: requestModel.requestType,
                responseDescription: responseSchema?.description ?? '',
                responseType,
            });
        }
    }

    return operations;
}

function formatParameterObject(parameters: ApiParameter[]) {
    if (!parameters.length) {
        return '{}';
    }

    return `{ ${parameters.map((parameter) => `${JSON.stringify(parameter.name)}: params[${JSON.stringify(parameter.name)}]`).join(', ')} }`;
}

function collectModelNames(typeText: string, modelNames: Set<string>) {
    return typeText.split(/[^A-Za-z0-9_$]+/).filter((part) => modelNames.has(part));
}

function renderOperationComment(operation: ApiOperation) {
    const requestValueName = operation.requestBodyOnly ? 'body' : 'params';
    const commentLines = [
        ...splitCommentLines(operation.description),
        ...(!operation.requestBodyOnly
            ? [...operation.pathParameters, ...operation.queryParameters, ...operation.headerParameters]
                  .filter((parameter) => parameter.description)
                  .map(
                      (parameter) =>
                          `@param ${requestValueName}.${parameter.name} ${collapseComment(parameter.description)}`,
                  )
            : []),
        operation.bodyDescription
            ? `@param ${operation.requestBodyOnly ? 'body' : `${requestValueName}.body`} ${collapseComment(operation.bodyDescription)}`
            : '',
        operation.responseDescription ? `@returns ${collapseComment(operation.responseDescription)}` : '',
    ];

    return renderJSDoc(commentLines);
}

function renderOperation(operation: ApiOperation) {
    const requestValueName = operation.requestBodyOnly ? 'body' : 'params';
    const argumentsText = [
        operation.requestType
            ? operation.requestRequired
                ? `${requestValueName}: ${operation.requestType}`
                : operation.requestBodyOnly
                  ? `${requestValueName}: ${operation.requestType} | undefined = undefined`
                  : `${requestValueName}: ${operation.requestType} = {}`
            : '',
    ]
        .filter(Boolean)
        .join(', ');
    const pathParams = formatParameterObject(operation.pathParameters);
    const queryParams = formatParameterObject(operation.queryParameters);
    const headerParams = formatParameterObject(operation.headerParameters);
    const lines = [
        ...renderOperationComment(operation),
        `export const ${operation.functionName} = async (${argumentsText}): Promise<${operation.responseType}> => {`,
        `    return request<${operation.responseType}>({`,
        `        path: ${JSON.stringify(operation.path)},`,
        `        method: ${JSON.stringify(operation.method)},`,
    ];

    if (operation.pathParameters.length > 0) {
        lines.push(`        pathParams: ${pathParams},`);
    }

    if (operation.queryParameters.length > 0) {
        lines.push(`        queryParams: ${queryParams},`);
    }

    if (operation.headerParameters.length > 0) {
        lines.push(`        headers: ${headerParams},`);
    }

    if (operation.hasRequestBody) {
        lines.push(`        body: ${operation.requestBodyOnly ? 'body' : 'params.body'},`);
    }

    lines.push('    });', '};');

    return lines.filter(Boolean).join('\n');
}

function renderApisFile(
    operations: ApiOperation[],
    context: GeneratorContext,
    baseUrl: string,
    customRequestFunction: string,
    requestHeaders: Record<string, string>,
) {
    const modelNames = new Set(context.declarations.map((declaration) => declaration.name));
    const importedModelNames = new Set<string>();

    for (const operation of operations) {
        for (const typeText of [operation.requestType, operation.responseType]) {
            for (const modelName of collectModelNames(typeText, modelNames)) {
                importedModelNames.add(modelName);
            }
        }
    }

    const importLine =
        importedModelNames.size > 0
            ? `import type { ${[...importedModelNames].sort().join(', ')} } from './Models';\n\n`
            : '';
    const defaultHeaders = JSON.stringify(requestHeaders, null, 4);
    const customRequesterSetup = customRequestFunction
        ? `type CustomApiRequestConfig = { url: string; method: string; headers?: Record<string, string>; body?: unknown };\ntype ApiRequestFn = <T>(config: CustomApiRequestConfig) => Promise<T>;\nconst apiRequester = ${customRequestFunction} as ApiRequestFn;\n`
        : '';
    const requestImplementation = customRequestFunction
        ? `const request = async <T>({ path, method, pathParams = {}, queryParams = {}, headers = {}, body }: ApiRequestConfig): Promise<T> => {\n    const url = buildUrl(path, pathParams, queryParams);\n    const requestHeaders = pickDefined({\n        ...(body === undefined ? {} : { "Content-Type": "application/json" }),\n        ...DEFAULT_HEADERS,\n        ...headers,\n    });\n\n    return apiRequester<T>({\n        url,\n        method,\n        headers: requestHeaders,\n        body,\n    });\n};\n`
        : `const request = async <T>({ path, method, pathParams = {}, queryParams = {}, headers = {}, body }: ApiRequestConfig): Promise<T> => {\n    const url = buildUrl(path, pathParams, queryParams);\n    const requestHeaders = pickDefined({\n        ...(body === undefined ? {} : { "Content-Type": "application/json" }),\n        ...DEFAULT_HEADERS,\n        ...headers,\n    });\n    const response = await fetch(url, {\n        method,\n        headers: requestHeaders,\n        body: body === undefined ? undefined : JSON.stringify(body),\n    });\n\n    if (!response.ok) {\n        throw new Error(\`Request failed: \${response.status} \${response.statusText}\`);\n    }\n\n    if (response.status === 204) {\n        return undefined as T;\n    }\n\n    const text = await response.text();\n\n    return (text ? JSON.parse(text) : undefined) as T;\n};\n`;

    return `${importLine}const BASE_URL = ${JSON.stringify(baseUrl)};\nconst DEFAULT_HEADERS: Record<string, string> = ${defaultHeaders};\n\ntype Primitive = string | number | boolean | null | undefined;\n\ntype ApiRequestConfig = {\n    path: string;\n    method: string;\n    pathParams?: Record<string, Primitive>;\n    queryParams?: Record<string, unknown>;\n    headers?: Record<string, unknown>;\n    body?: unknown;\n};\n\nconst pickDefined = (values: Record<string, unknown>): Record<string, string> => {\n    const output: Record<string, string> = {};\n\n    for (const [key, value] of Object.entries(values)) {\n        if (value !== undefined && value !== null && value !== '') {\n            output[key] = String(value);\n        }\n    }\n\n    return output;\n};\n\nconst appendQueryValue = (params: URLSearchParams, key: string, value: unknown): void => {\n    if (value === undefined || value === null || value === '') {\n        return;\n    }\n\n    if (Array.isArray(value)) {\n        for (const item of value) {\n            appendQueryValue(params, key, item);\n        }\n        return;\n    }\n\n    params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));\n};\n\nconst buildUrl = (path: string, pathParams: Record<string, Primitive>, queryParams: Record<string, unknown>, baseUrl = BASE_URL) => {\n    const resolvedPath = path.replace(/\\{([^}]+)\\}/g, (_, key: string) => {\n        const value = pathParams[key];\n\n        if (value === undefined || value === null || value === '') {\n            throw new Error(\`Missing path parameter: \${key}\`);\n        }\n\n        return encodeURIComponent(String(value));\n    });\n    const url = new URL(resolvedPath, baseUrl);\n\n    for (const [key, value] of Object.entries(queryParams)) {\n        appendQueryValue(url.searchParams, key, value);\n    }\n\n    return url.toString();\n};\n\n${customRequesterSetup}${requestImplementation}\n// API request definitions\n${operations.map((operation) => renderOperation(operation)).join('\n\n')}\n`;
}

function getSpecTitle(spec: JsonRecord) {
    return readString(readRecord(spec.info)?.title) || 'Swagger API';
}

function formatGeneratedTypeScript(source: string) {
    return `${source
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()}\n`;
}

export function generateSwaggerTypeScriptSdk({
    baseUrl,
    customRequestFunction = '',
    requestHeaders = {},
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

    try {
        new URL(normalizedBaseUrl);
    } catch {
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

    for (const [schemaName, schema] of Object.entries(getComponentSchemas(spec))) {
        if (isRecord(schema)) {
            const name = uniqueName(toPascalCase(schemaName), context.usedModelNames);
            const fingerprint = schemaFingerprint(schema);
            const duplicatedName = context.modelNameByFingerprint.get(fingerprint);

            if (duplicatedName) {
                context.refNameByRef.set(`#/components/schemas/${schemaName}`, duplicatedName);
                context.refNameByRef.set(`#/definitions/${schemaName}`, duplicatedName);
                continue;
            }

            context.modelNameByFingerprint.set(fingerprint, name);
            context.refNameByRef.set(`#/components/schemas/${schemaName}`, name);
            context.refNameByRef.set(`#/definitions/${schemaName}`, name);
            appendModelDeclaration(name, schema, context);
        }
    }

    const operations = buildOperationList(spec, context);

    if (operations.length === 0) {
        throw new Error('No API operations found in paths.');
    }

    const models = formatGeneratedTypeScript(
        context.declarations.map((declaration) => declaration.declaration).join('\n\n'),
    );
    const apis = formatGeneratedTypeScript(
        renderApisFile(operations, context, normalizedBaseUrl, normalizedCustomRequestFunction, requestHeaders),
    );

    return {
        apis,
        models,
        summary: {
            modelCount: context.declarations.length,
            operationCount: operations.length,
            title: getSpecTitle(spec),
        },
    };
}
