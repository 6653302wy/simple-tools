import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Checked: FC<SVGIconProps> = ({ color = ['#2E2E2E', '#0D9D17'], ...props }) => {
    return (
        <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <path
                d="M4 0.5H8C9.933 0.5 11.5 2.067 11.5 4V8C11.5 9.933 9.933 11.5 8 11.5H4C2.067 11.5 0.5 9.933 0.5 8V4C0.5 2.067 2.067 0.5 4 0.5Z"
                stroke={getColor(color, 1, '#2E2E2E')}
            />
            <path
                d="M3 5.59183L4.44194 7.84597C4.92547 8.60185 6.03722 8.57905 6.48935 7.80398L9 3.5"
                stroke={getColor(color, 2, '#0D9D17')}
                strokeWidth="1.4"
                strokeLinecap="round"
            />
        </svg>
    );
};
