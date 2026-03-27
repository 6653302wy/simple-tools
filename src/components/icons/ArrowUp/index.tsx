import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const ArrowUp: FC<SVGIconProps> = ({ color = ['currentColor'], ...props }) => {
    return (
        <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <path
                d="M2 8L5.71716 4.28284C5.87337 4.12663 6.12663 4.12663 6.28284 4.28284L10 8"
                stroke={getColor(color, 1, '#3C4851')}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
};
