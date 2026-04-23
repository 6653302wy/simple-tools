export type XhsMediaKind = 'image' | 'video' | 'live-photo-image' | 'live-photo-motion';

export type XhsResolvedMedia = {
    extension: string;
    fileName: string;
    groupId?: string;
    height?: number;
    id: string;
    kind: XhsMediaKind;
    mimeType?: string;
    qualityLabel?: string;
    size?: number;
    url: string;
    width?: number;
};

export type XhsResolvedNote = {
    authorId?: string;
    authorName?: string;
    description?: string;
    noteId: string;
    sourceUrl: string;
    title: string;
    type: 'image' | 'video' | 'livePhoto' | 'unknown';
};

export type XhsResolvePayload = {
    media: XhsResolvedMedia[];
    note: XhsResolvedNote;
    resolvedUrl: string;
    warnings: string[];
};
