import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Warn: FC<SVGIconProps> = ({
    color = ['url(#paint0_linear_4327_140160)', '#FF7D00', '#FF7D00', 'white'],
    ...props
}) => {
    return (
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g clipPath="url(#clip0_4327_140160)">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.66666 10.0001C1.66666 5.39771 5.39762 1.66675 9.99999 1.66675C14.6024 1.66675 18.3333 5.39771 18.3333 10.0001C18.3333 14.6025 14.6024 18.3334 9.99999 18.3334C5.39762 18.3334 1.66666 14.6025 1.66666 10.0001ZM9.16666 12.5001V14.1667H10.8333V12.5001H9.16666ZM10.8333 11.6667L10.8333 5.83342H9.16666L9.16666 11.6667H10.8333Z"
                    fill={getColor(color, 1, 'url(#paint0_linear_4327_140160)')}
                />
            </g>
            <defs>
                <linearGradient
                    id="paint0_linear_4327_140160"
                    x1="9.99999"
                    y1="1.66675"
                    x2="9.99999"
                    y2="18.3334"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 2, '#FF7D00')} />
                    <stop offset="1" stopColor={getColor(color, 3, '#FF7D00')} />
                </linearGradient>
                <clipPath id="clip0_4327_140160">
                    <rect width="20" height="20" fill={getColor(color, 4, 'white')} />
                </clipPath>
            </defs>
        </svg>
    );
};
