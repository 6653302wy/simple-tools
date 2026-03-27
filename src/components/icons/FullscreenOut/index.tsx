import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const FullscreenOut: FC<SVGIconProps> = ({ color = ['currentColor', 'currentColor'], ...props }) => {
    return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <rect
                x="4"
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
                d="M13.8079 10.6924H17.0771M13.8079 10.6924V7.42313M13.8079 10.6924L17.731 6.76929M11.1925 13.3077H7.92326M11.1925 13.3077V16.577M11.1925 13.3077L7.26942 17.2308"
                stroke={getColor(color, 2, 'white')}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
