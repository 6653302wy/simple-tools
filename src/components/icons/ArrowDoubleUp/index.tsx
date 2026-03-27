import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const ArrowDoubleUp: FC<SVGIconProps> = ({ color = ['currentColor', 'currentColor'], ...props }) => {
    return (
        <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <path
                d="M10 6L6.28284 2.28284C6.12663 2.12663 5.87337 2.12663 5.71716 2.28284L2 6"
                stroke={getColor(color, 1, '#3C4851')}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M10 10L6.28284 6.28284C6.12663 6.12663 5.87337 6.12663 5.71716 6.28284L2 10"
                stroke={getColor(color, 2, '#3C4851')}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
};
