import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Close: FC<SVGIconProps> = ({ color = ['currentColor'], ...props }) => {
    return (
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <path
                d="M2 2L14 14M2 14L14 2"
                stroke={getColor(color, 1, '#3C4851')}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
};
