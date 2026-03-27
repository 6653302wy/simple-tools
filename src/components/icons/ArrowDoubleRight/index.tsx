import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const ArrowDoubleRight: FC<SVGIconProps> = ({ color = ['currentColor', 'currentColor'], ...props }) => {
    return (
        <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <path
                d="M2 2L5.71716 5.71716C5.87337 5.87337 5.87337 6.12663 5.71716 6.28284L2 10"
                stroke={getColor(color, 1, '#3C4851')}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M6 2L9.71716 5.71716C9.87337 5.87337 9.87337 6.12663 9.71716 6.28284L6 10"
                stroke={getColor(color, 2, '#3C4851')}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
};
