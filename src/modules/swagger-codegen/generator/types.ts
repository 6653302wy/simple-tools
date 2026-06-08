export type JsonRecord = Record<string, unknown>;

export type ApiParameterLocation = 'path' | 'query' | 'header';

export type ApiParameter = {
    description: string;
    name: string;
    location: ApiParameterLocation;
    required: boolean;
    schema: JsonRecord;
};

export type RequestBodySchema = {
    contentType: string;
    description: string;
    required: boolean;
    schema: JsonRecord;
};

export type ApiService = {
    baseUrl: string;
    key: string;
    name: string;
};

export type ApiOperation = {
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
    requestContentType: string;
    requestRequired: boolean;
    requestType: string;
    responseDescription: string;
    responseType: string;
    serviceKey: string;
};

export type ModelDeclaration = {
    declaration: string;
    name: string;
};

export type GeneratorContext = {
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
    services: ApiServiceConfig[];
    summary: {
        modelCount: number;
        operationCount: number;
        serviceCount: number;
        title: string;
    };
};

export type ApiServiceConfig = {
    baseUrl: string;
    key?: string;
    name?: string;
};

export type GenerateSwaggerSdkOptions = {
    baseUrl: string;
    customRequestFunction?: string;
    requestHeaders?: Record<string, string>;
    services?: ApiServiceConfig[];
    spec: unknown;
};

export type DetectSwaggerServicesOptions = {
    baseUrl?: string;
    sourceUrl?: string;
    spec: unknown;
};
