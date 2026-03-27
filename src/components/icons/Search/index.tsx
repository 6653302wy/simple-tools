import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Search: FC<SVGIconProps> = ({ color = ['#3C4851', '#3C4851', 'white'], ...props }) => {
    return (
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g clipPath="url(#clip0_1_18409)">
                <circle
                    cx="6.85714"
                    cy="6.85714"
                    r="6.15714"
                    stroke={getColor(color, 1, '#3C4851')}
                    strokeWidth="1.4"
                />
                <path
                    d="M14.857 14.8572L11.4285 11.4286"
                    stroke={getColor(color, 2, '#3C4851')}
                    strokeWidth="1.4"
                    strokeLinecap="round"
                />
            </g>
            <defs>
                <clipPath id="clip0_1_18409">
                    <rect width="16" height="16" fill={getColor(color, 3, 'white')} />
                </clipPath>
            </defs>
        </svg>
    );
};
