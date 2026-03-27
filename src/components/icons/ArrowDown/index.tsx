import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const ArrowDown: FC<SVGIconProps> = ({ color = ['currentColor'], ...props }) => {
    return (
        <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <path
                d="M2 4L5.71716 7.71716C5.87337 7.87337 6.12663 7.87337 6.28284 7.71716L10 4"
                stroke={getColor(color, 1, '#3C4851')}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
};
