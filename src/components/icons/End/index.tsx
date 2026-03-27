import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const End: FC<SVGIconProps> = ({ color = ['#86909C', '#86909C', 'white'], ...props }) => {
    return (
        <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g clipPath="url(#clip0_4050_15868)">
                <path
                    d="M6.0002 10.8C8.65116 10.8 10.8002 8.65098 10.8002 6.00001C10.8002 3.34905 8.65116 1.20001 6.0002 1.20001C3.34923 1.20001 1.2002 3.34905 1.2002 6.00001C1.2002 8.65098 3.34923 10.8 6.0002 10.8Z"
                    stroke={getColor(color, 1, '#86909C')}
                    strokeWidth="1.2"
                />
                <rect x="4.7998" y="4.79999" width="2.4" height="2.4" rx="0.72" fill={getColor(color, 2, '#86909C')} />
            </g>
            <defs>
                <clipPath id="clip0_4050_15868">
                    <rect width="12" height="12" fill={getColor(color, 3, 'white')} />
                </clipPath>
            </defs>
        </svg>
    );
};
