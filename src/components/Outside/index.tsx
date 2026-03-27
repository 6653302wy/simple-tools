import {
    type FunctionComponent,
    type MutableRefObject,
    type ReactElement,
    useCallback,
    useEffect,
    useRef,
} from 'react';

interface PropsType {
    children: ReactElement;
    clickCallback?: (event: MouseEvent) => void;
}
/**
 * Hook that alerts clicks outside of the passed ref
 */
const useOutside = (
    ref: MutableRefObject<HTMLDivElement | null>,
    clickCallback?: (event: MouseEvent) => void,
): void => {
    const handleClickOutside = useCallback(
        (event: any) => {
            if (ref.current && !ref.current.contains(event.target)) {
                clickCallback?.(event);
            }
        },
        [clickCallback, ref],
    );

    useEffect(() => {
        // Bind the event listener
        document.addEventListener('mousedown', handleClickOutside);
        return (): void => {
            // Unbind the event listener on clean up
            document.removeEventListener('mousedown', handleClickOutside);
        };
    });
};

export const Outside: FunctionComponent<PropsType> = ({ children, clickCallback }): ReactElement => {
    const wrapperRef = useRef(null);
    useOutside(wrapperRef, clickCallback);

    return <div ref={wrapperRef}>{children}</div>;
};
