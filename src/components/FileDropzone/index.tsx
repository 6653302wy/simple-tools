'use client';

import { type ChangeEvent, type DragEvent, useId, useState } from 'react';
import { cn } from '@/libs/utils';

interface FileDropzoneProps {
    accept?: string;
    className?: string;
    disabled?: boolean;
    label: string;
    multiple?: boolean;
    onFilesSelect: (files: FileList) => void;
}

/** 图片上传拖拽组件 */
export function FileDropzone({ accept, className, disabled, label, multiple, onFilesSelect }: FileDropzoneProps) {
    const inputId = useId();
    const [dragging, setDragging] = useState(false);

    function handleFiles(files: FileList | null) {
        if (!files?.length || disabled) {
            return;
        }

        onFilesSelect(files);
    }

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        handleFiles(event.target.files);
        event.target.value = '';
    }

    function handleDragOver(event: DragEvent<HTMLLabelElement>) {
        event.preventDefault();

        if (!disabled) {
            setDragging(true);
        }
    }

    function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setDragging(false);
        }
    }

    function handleDrop(event: DragEvent<HTMLLabelElement>) {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
    }

    return (
        <label
            htmlFor={inputId}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-neutral-j bg-fill-b px-4 py-[9.5px] text-body-md text-text-e transition',
                dragging ? 'border-primary-300 bg-primary-100 text-primary-700' : 'hover:bg-fill-c',
                disabled && 'pointer-events-none opacity-60',
                className,
            )}
        >
            <input
                id={inputId}
                type="file"
                accept={accept}
                multiple={multiple}
                className="hidden"
                onChange={handleChange}
            />
            {label}
        </label>
    );
}
