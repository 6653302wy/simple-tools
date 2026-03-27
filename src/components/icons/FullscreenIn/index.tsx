import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const FullscreenIn: FC<SVGIconProps> = ({ color = ['currentColor', 'currentColor'], ...props }) => {
    return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <rect
                x="3.5"
                y="3.5"
                width="17"
                height="17"
                rx="4"
                stroke={getColor(color, 1, 'white')}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M17.2306 17.2307H13.9614M17.2306 17.2307V13.9615M17.2306 17.2307L13.3075 13.3076M6.76904 6.76917H10.0383M6.76904 6.76917V10.0384M6.76904 6.76917L10.6921 10.6922"
                stroke={getColor(color, 2, 'white')}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
