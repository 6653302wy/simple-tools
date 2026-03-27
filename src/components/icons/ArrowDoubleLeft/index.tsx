import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const ArrowDoubleLeft: FC<SVGIconProps> = ({ color = ['currentColor', 'currentColor'], ...props }) => {
    return (
        <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <path
                d="M6 10L2.28284 6.28284C2.12663 6.12663 2.12663 5.87337 2.28284 5.71716L6 2"
                stroke={getColor(color, 1, '#3C4851')}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M10 10L6.28284 6.28284C6.12663 6.12663 6.12663 5.87337 6.28284 5.71716L10 2"
                stroke={getColor(color, 2, '#3C4851')}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
};
