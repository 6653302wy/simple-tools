import type { JsonRecord } from './types';

export const HTTP_METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options']);
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
    '$anchor',
    '$comment',
    '$defs',
    '$dynamicAnchor',
    '$id',
    '$schema',
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

export const CUSTOM_REQUEST_PATTERN = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*$/;

export function isRecord(value: unknown): value is JsonRecord {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function readRecord(value: unknown): JsonRecord | undefined {
    return isRecord(value) ? value : undefined;
}

export function readArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

export function readString(value: unknown) {
    return typeof value === 'string' ? value : '';
}

export function uniqueName(baseName: string, usedNames: Set<string>) {
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

export function toPascalCase(value: string, fallback = 'GeneratedModel') {
    const words = splitWords(value);

    if (!words.length) {
        return fallback;
    }

    const name = words.map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join('');

    return /^\d/.test(name) ? `${fallback}${name}` : name;
}

export function toCamelCase(value: string, fallback = 'generatedOperation') {
    const pascal = toPascalCase(value, fallback);
    const name = `${pascal.charAt(0).toLowerCase()}${pascal.slice(1)}`;

    if (/^\d/.test(name) || RESERVED_WORDS.has(name)) {
        return `${fallback}${pascal}`;
    }

    return name;
}

export function quotePropertyName(name: string) {
    return /^[A-Za-z_$][\w$]*$/.test(name) && !RESERVED_WORDS.has(name) ? name : JSON.stringify(name);
}

export function normalizeAbsoluteUrl(value: string, baseUrl: string) {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return '';
    }

    try {
        return new URL(trimmedValue, baseUrl).toString();
    } catch {
        return '';
    }
}

export function toLiteralType(value: unknown): string {
    if (value === null) {
        return 'null';
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return JSON.stringify(value);
    }

    return 'unknown';
}

export function readDescription(...values: unknown[]) {
    const descriptions = values
        .map((value) => readString(value).trim())
        .filter(Boolean)
        .filter((value, index, array) => array.indexOf(value) === index);

    return descriptions.join('\n\n');
}

function sanitizeCommentText(value: string) {
    return value.replace(/\*\//g, '* /');
}

export function splitCommentLines(value: string) {
    return sanitizeCommentText(value.trim()).split(/\r?\n/);
}

export function collapseComment(value: string) {
    return splitCommentLines(value)
        .map((line) => line.trim())
        .filter(Boolean)
        .join(' ');
}

export function renderJSDoc(lines: string[], indent = '') {
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

export function resolvePointer(root: JsonRecord, ref: string): unknown {
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

export function resolveRecordRef(spec: JsonRecord, value: unknown): JsonRecord | undefined {
    const record = readRecord(value);
    const ref = readString(record?.$ref);

    if (!ref) {
        return record;
    }

    return readRecord(resolvePointer(spec, ref));
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

export function schemaFingerprint(schema: JsonRecord) {
    return JSON.stringify(canonicalize(schema));
}

export function getSpecTitle(spec: JsonRecord) {
    return readString(readRecord(spec.info)?.title) || 'Swagger API';
}

export function formatGeneratedTypeScript(source: string) {
    return `${source
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()}\n`;
}
