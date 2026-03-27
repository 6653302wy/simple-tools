import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const ArrowDoubleDown: FC<SVGIconProps> = ({ color = ['currentColor', 'currentColor'], ...props }) => {
    return (
        <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <path
                d="M10 6L6.28284 9.71716C6.12663 9.87337 5.87337 9.87337 5.71716 9.71716L2 6"
                stroke={getColor(color, 1, '#3C4851')}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M10 2L6.28284 5.71716C6.12663 5.87337 5.87337 5.87337 5.71716 5.71716L2 2"
                stroke={getColor(color, 2, '#3C4851')}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
};
