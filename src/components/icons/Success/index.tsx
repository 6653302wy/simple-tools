import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Success: FC<SVGIconProps> = ({ color = ['#00B42B', 'white'], ...props }) => {
    return (
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g clipPath="url(#clip0_4327_140161)">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.66666 10.0001C1.66666 5.39771 5.39762 1.66675 9.99999 1.66675C14.6024 1.66675 18.3333 5.39771 18.3333 10.0001C18.3333 14.6025 14.6024 18.3334 9.99999 18.3334C5.39762 18.3334 1.66666 14.6025 1.66666 10.0001ZM9.16667 13.2619L14.5476 7.88102L13.3691 6.7025L9.16667 10.9049L6.83926 8.5775L5.66075 9.75601L9.16667 13.2619Z"
                    fill={getColor(color, 1, '#00B42B')}
                />
            </g>
            <defs>
                <clipPath id="clip0_4327_140161">
                    <rect width="20" height="20" fill={getColor(color, 2, 'white')} />
                </clipPath>
            </defs>
        </svg>
    );
};
