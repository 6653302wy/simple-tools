import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const CloseCircle: FC<SVGIconProps> = ({
    color = ['white', '#86909C', '#86909C', '#86909C', '#86909C'],
    ...props
}) => {
    return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <rect
                x="0.75"
                y="0.75"
                width="22.5"
                height="22.5"
                rx="11.25"
                fill={getColor(color, 1, 'white')}
                fillOpacity="0.2"
            />
            <rect
                x="0.75"
                y="0.75"
                width="22.5"
                height="22.5"
                rx="11.25"
                stroke={getColor(color, 2, '#86909C')}
                strokeWidth="1.5"
            />
            <path
                d="M8 8L12 12"
                stroke={getColor(color, 3, '#86909C')}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M14 14L16 16"
                stroke={getColor(color, 4, '#86909C')}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M8 16L16 8"
                stroke={getColor(color, 5, '#86909C')}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
