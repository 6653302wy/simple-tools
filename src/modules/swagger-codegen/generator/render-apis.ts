import type { ApiOperation, ApiService, GeneratorContext } from './types';
import { collapseComment, quotePropertyName, renderJSDoc, splitCommentLines } from './utils';

function formatParameterObject(parameters: ApiOperation['pathParameters']) {
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
        `        serviceKey: ${JSON.stringify(operation.serviceKey)},`,
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
        lines.push(`        headerParams: ${headerParams},`);
    }

    if (operation.hasRequestBody) {
        lines.push(`        contentType: ${JSON.stringify(operation.requestContentType)},`);
        lines.push(`        body: ${operation.requestBodyOnly ? 'body' : 'params.body'},`);
    }

    lines.push('    });', '};');

    return lines.filter(Boolean).join('\n');
}

export function renderApisFile(
    operations: ApiOperation[],
    context: GeneratorContext,
    services: ApiService[],
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
    const serviceMap = `{\n${services
        .map((service) =>
            [
                ...renderJSDoc(splitCommentLines(service.name), '    '),
                `    ${quotePropertyName(service.key)}: ${JSON.stringify(service.baseUrl)},`,
            ].join('\n'),
        )
        .join('\n')}\n} as const`;
    const defaultHeaders = JSON.stringify(requestHeaders, null, 4);
    const customRequesterSetup = customRequestFunction
        ? `type ApiRequestFn = <T>(config: PreparedApiRequestConfig) => Promise<T>;\nconst apiRequester = ${customRequestFunction} as ApiRequestFn;\n`
        : '';
    const requestImplementation = customRequestFunction
        ? `const executeRequest = async <T>(config: PreparedApiRequestConfig): Promise<T> => {\n    return apiRequester<T>(config);\n};\n`
        : `const executeRequest = async <T>({ url, method, headers, body }: PreparedApiRequestConfig): Promise<T> => {\n    const response = await fetch(url, {\n        method,\n        headers,\n        body: serializeBody(body, headers),\n    });\n\n    if (!response.ok) {\n        throw new Error(\`Request failed: \${response.status} \${response.statusText}\`);\n    }\n\n    if (response.status === 204) {\n        return undefined as T;\n    }\n\n    const text = await response.text();\n\n    return (text ? JSON.parse(text) : undefined) as T;\n};\n`;

    return `${importLine}const SERVICES = ${serviceMap};\nconst DEFAULT_HEADERS: Record<string, string> = ${defaultHeaders};\n\ntype ServiceKey = keyof typeof SERVICES;\ntype Primitive = string | number | boolean | null | undefined;\n\ntype ApiRequestConfig = {\n    serviceKey: ServiceKey;\n    path: string;\n    method: string;\n    pathParams?: Record<string, Primitive>;\n    queryParams?: Record<string, unknown>;\n    headerParams?: Record<string, unknown>;\n    contentType?: string;\n    body?: unknown;\n};\n\ntype PreparedApiRequestConfig = {\n    serviceKey: ServiceKey;\n    url: string;\n    method: string;\n    headers: Record<string, string>;\n    body?: unknown;\n};\n\nconst pickDefined = (values: Record<string, unknown>): Record<string, string> => {\n    const output: Record<string, string> = {};\n\n    for (const [key, value] of Object.entries(values)) {\n        if (value !== undefined && value !== null && value !== '') {\n            output[key] = String(value);\n        }\n    }\n\n    return output;\n};\n\nconst appendQueryValue = (params: URLSearchParams, key: string, value: unknown): void => {\n    if (value === undefined || value === null || value === '') {\n        return;\n    }\n\n    if (Array.isArray(value)) {\n        for (const item of value) {\n            appendQueryValue(params, key, item);\n        }\n        return;\n    }\n\n    params.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));\n};\n\nconst joinBasePath = (basePath: string, path: string) => {\n    const normalizedBasePath = basePath.replace(/\\/+$/g, '');\n    const normalizedPath = path.startsWith('/') ? path : \`/\${path}\`;\n\n    return \`\${normalizedBasePath}\${normalizedPath}\` || '/';\n};\n\nconst buildUrl = (serviceKey: ServiceKey, path: string, pathParams: Record<string, Primitive>, queryParams: Record<string, unknown>) => {\n    const resolvedPath = path.replace(/\\{([^}]+)\\}/g, (_, key: string) => {\n        const value = pathParams[key];\n\n        if (value === undefined || value === null || value === '') {\n            throw new Error(\`Missing path parameter: \${key}\`);\n        }\n\n        return encodeURIComponent(String(value));\n    });\n    const url = new URL(SERVICES[serviceKey]);\n\n    url.pathname = joinBasePath(url.pathname, resolvedPath);\n\n    for (const [key, value] of Object.entries(queryParams)) {\n        appendQueryValue(url.searchParams, key, value);\n    }\n\n    return url.toString();\n};\n\nconst getHeaderValue = (headers: Record<string, string>, name: string) => {\n    const lowerName = name.toLowerCase();\n\n    return Object.entries(headers).find(([key]) => key.toLowerCase() === lowerName)?.[1] ?? '';\n};\n\nconst serializeBody = (body: unknown, headers: Record<string, string>): BodyInit | undefined => {\n    if (body === undefined) {\n        return undefined;\n    }\n\n    const contentType = getHeaderValue(headers, "Content-Type");\n\n    if (contentType.includes("application/json") || contentType.includes("+json")) {\n        return JSON.stringify(body);\n    }\n\n    return body as BodyInit;\n};\n\nconst createRequestConfig = ({\n    serviceKey,\n    path,\n    method,\n    pathParams = {},\n    queryParams = {},\n    headerParams = {},\n    contentType = "application/json",\n    body,\n}: ApiRequestConfig): PreparedApiRequestConfig => {\n    const url = buildUrl(serviceKey, path, pathParams, queryParams);\n    const headers = pickDefined({\n        ...(body === undefined ? {} : { "Content-Type": contentType || "application/json" }),\n        ...DEFAULT_HEADERS,\n        ...headerParams,\n    });\n\n    return {\n        serviceKey,\n        url,\n        method,\n        headers,\n        body,\n    };\n};\n\n${customRequesterSetup}${requestImplementation}\nconst request = async <T>(config: ApiRequestConfig): Promise<T> => {\n    return executeRequest<T>(createRequestConfig(config));\n};\n\n// API request definitions\n${operations.map((operation) => renderOperation(operation)).join('\n\n')}\n`;
}
