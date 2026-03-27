import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Trophy: FC<SVGIconProps> = ({
    color = ['currentColor', 'currentColor', 'currentColor', 'currentColor', 'currentColor', 'currentColor'],
    ...props
}) => {
    return (
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <path
                d="M8.00006 10.4C4.54408 10.4 3.93185 6.95572 3.82339 4.22387C3.79322 3.46397 3.77814 3.08402 4.06357 2.73248C4.349 2.38095 4.69062 2.32331 5.37386 2.20803C6.0483 2.09424 6.92993 1.99998 8.00006 1.99998C9.07019 1.99998 9.95181 2.09424 10.6262 2.20803C11.3095 2.32331 11.6511 2.38095 11.9365 2.73248C12.222 3.08402 12.2069 3.46397 12.1767 4.22387C12.0683 6.95572 11.456 10.4 8.00006 10.4Z"
                stroke={getColor(color, 1, '#1D2129')}
                strokeWidth="1.1"
            />
            <path
                d="M12.2001 3.79999L12.7692 3.98971C13.3633 4.18772 13.6603 4.28673 13.8302 4.52244C14 4.75815 14 5.07123 14 5.6974L14 5.74091C14 6.25736 14 6.51558 13.8757 6.72685C13.7514 6.93812 13.5256 7.06353 13.0742 7.31434L11.3 8.3"
                stroke={getColor(color, 2, '#1D2129')}
                strokeWidth="1.1"
            />
            <path
                d="M3.79997 3.79999L3.23079 3.98971C2.63676 4.18772 2.33974 4.28673 2.16986 4.52244C1.99997 4.75815 1.99998 5.07123 2 5.6974L2 5.74091C2.00002 6.25736 2.00002 6.51558 2.12434 6.72685C2.24865 6.93812 2.47438 7.06353 2.92583 7.31434L4.69997 8.3"
                stroke={getColor(color, 3, '#1D2129')}
                strokeWidth="1.1"
            />
            <path d="M8 11V12.2" stroke={getColor(color, 4, '#1D2129')} strokeWidth="1.1" strokeLinecap="round" />
            <path
                d="M10.0999 14H5.8999L6.10344 12.9823C6.15953 12.7019 6.40578 12.5 6.69179 12.5H9.30803C9.59404 12.5 9.84029 12.7019 9.89638 12.9823L10.0999 14Z"
                stroke={getColor(color, 5, '#1D2129')}
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M11.5999 14H4.3999"
                stroke={getColor(color, 6, '#1D2129')}
                strokeWidth="1.1"
                strokeLinecap="round"
            />
        </svg>
    );
};
