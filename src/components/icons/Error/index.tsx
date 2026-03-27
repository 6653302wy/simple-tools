import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Error: FC<SVGIconProps> = ({ color = ['#EB3333', 'white'], ...props }) => {
    return (
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g clipPath="url(#clip0_4327_140159)">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.66666 10.0001C1.66666 5.39771 5.39762 1.66675 9.99999 1.66675C14.6024 1.66675 18.3333 5.39771 18.3333 10.0001C18.3333 14.6025 14.6024 18.3334 9.99999 18.3334C5.39762 18.3334 1.66666 14.6025 1.66666 10.0001ZM6.76181 7.94053L8.8242 10.0029L6.76181 12.0653L7.94032 13.2438L10.0027 11.1814L12.0651 13.2438L13.2436 12.0653L11.1812 10.0029L13.2436 7.94053L12.0651 6.76201L10.0027 8.82441L7.94032 6.76201L6.76181 7.94053Z"
                    fill={getColor(color, 1, '#EB3333')}
                />
            </g>
            <defs>
                <clipPath id="clip0_4327_140159">
                    <rect width="20" height="20" fill={getColor(color, 2, 'white')} />
                </clipPath>
            </defs>
        </svg>
    );
};
