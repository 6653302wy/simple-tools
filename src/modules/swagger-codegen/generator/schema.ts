import type { GeneratorContext, JsonRecord } from './types';
import {
    isRecord,
    quotePropertyName,
    readArray,
    readDescription,
    readRecord,
    readString,
    renderJSDoc,
    resolvePointer,
    schemaFingerprint,
    splitCommentLines,
    toLiteralType,
    toPascalCase,
    uniqueName,
} from './utils';

type SchemaRegistryEntry = {
    name: string;
    refs: string[];
    schema: JsonRecord;
};

export function normalizeSchema(schemaInput: unknown): JsonRecord {
    return readRecord(schemaInput) ?? {};
}

function getRefDisplayName(ref: string) {
    const lastPart = ref.split('/').filter(Boolean).at(-1) ?? 'GeneratedModel';

    return decodeURIComponent(lastPart);
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

export function schemaToType(schemaInput: unknown, context: GeneratorContext, preferredName = ''): string {
    if (schemaInput === true) {
        return 'unknown';
    }

    if (schemaInput === false) {
        return 'never';
    }

    const schema = normalizeSchema(schemaInput);
    const ref = readString(schema.$ref);

    if (ref) {
        return withNullability(schema, ensureRefModel(ref, context));
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

    if ('const' in schema) {
        return withNullability(schema, toLiteralType(schema.const));
    }

    const enumValues = readArray(schema.enum);

    if (enumValues.length > 0) {
        return withNullability(schema, enumValues.map(toLiteralType).join(' | '));
    }

    const rawType = schema.type;

    if (Array.isArray(rawType)) {
        const typeValues = rawType.filter((typeValue): typeValue is string => typeof typeValue === 'string');
        const nonNullTypes = typeValues.filter((typeValue) => typeValue !== 'null');

        if (nonNullTypes.length === 0 && typeValues.includes('null')) {
            return 'null';
        }

        if (nonNullTypes.length > 1) {
            const unionTypes = [
                ...new Set(
                    nonNullTypes.map((typeValue) =>
                        schemaToType(
                            {
                                ...schema,
                                type: typeValue,
                            },
                            context,
                            preferredName,
                        ),
                    ),
                ),
            ];

            if (typeValues.includes('null')) {
                unionTypes.push('null');
            }

            return unionTypes.join(' | ');
        }
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
        case 'null':
            typeText = 'null';
            break;
        case 'array': {
            const itemPreferredName = preferredName ? `${preferredName}Item` : '';
            const prefixItems = readArray(schema.prefixItems);

            typeText =
                prefixItems.length > 0
                    ? `[${prefixItems
                          .map((itemSchema, index) =>
                              schemaToType(itemSchema, context, `${itemPreferredName}${index + 1}`),
                          )
                          .join(', ')}]`
                    : `Array<${schemaToType(schema.items, context, itemPreferredName)}>`;
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

        if (additionalProperties === false) {
            return 'Record<string, never>';
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

export function appendModelDeclaration(name: string, schema: JsonRecord, context: GeneratorContext) {
    if (context.declarationsByName.has(name)) {
        return;
    }

    context.declarationsByName.add(name);
    context.declarations.push({
        declaration: buildModelDeclaration(name, schema, context),
        name,
    });
}

function getSchemaDescription(schemaInput: unknown) {
    return readDescription(readRecord(schemaInput)?.description);
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
            const additionalType = isRecord(schema.additionalProperties)
                ? schemaToType(schema.additionalProperties, context, `${name}Value`)
                : 'unknown';

            propertyLines.push(`    [key: string]: ${additionalType};`);
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

export function ensureOperationSchemaModel(name: string, schema: JsonRecord, context: GeneratorContext) {
    const fingerprint = schemaFingerprint(schema);
    const duplicatedName = context.interfaceNameByFingerprint.get(fingerprint);

    if (duplicatedName) {
        return duplicatedName;
    }

    const typeName = uniqueName(toPascalCase(name), context.usedModelNames);

    context.interfaceNameByFingerprint.set(fingerprint, typeName);
    appendModelDeclaration(typeName, schema, context);

    return typeName;
}

export function getSchemaRegistryEntries(spec: JsonRecord): SchemaRegistryEntry[] {
    const registries = [
        {
            prefix: '#/definitions',
            schemas: readRecord(spec.definitions),
        },
        {
            prefix: '#/$defs',
            schemas: readRecord(spec.$defs),
        },
        {
            prefix: '#/components/schemas',
            schemas: readRecord(readRecord(spec.components)?.schemas),
        },
    ];
    const entriesByName = new Map<string, SchemaRegistryEntry>();

    for (const registry of registries) {
        for (const [schemaName, schema] of Object.entries(registry.schemas ?? {})) {
            if (!isRecord(schema)) {
                continue;
            }

            const existingEntry = entriesByName.get(schemaName);
            const ref = `${registry.prefix}/${schemaName}`;

            if (existingEntry) {
                existingEntry.refs.push(ref);
                continue;
            }

            entriesByName.set(schemaName, {
                name: schemaName,
                refs: [ref],
                schema,
            });
        }
    }

    return [...entriesByName.values()];
}

export function getContentSchemaInfo(value: unknown): { contentType: string; schema: JsonRecord } | undefined {
    const content = readRecord(value);

    if (!content) {
        return undefined;
    }

    const contentEntries = Object.entries(content);
    const [contentType, mediaTypeValue] =
        contentEntries.find(([mediaType]) => mediaType === 'application/json') ??
        contentEntries.find(([mediaType]) => mediaType.includes('+json')) ??
        contentEntries[0] ??
        [];
    const schema = readRecord(readRecord(mediaTypeValue)?.schema);

    if (!contentType || !schema) {
        return undefined;
    }

    return {
        contentType,
        schema,
    };
}

export function getContentSchema(value: unknown): JsonRecord | undefined {
    return getContentSchemaInfo(value)?.schema;
}
