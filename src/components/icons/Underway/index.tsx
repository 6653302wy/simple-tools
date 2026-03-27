import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Underway: FC<SVGIconProps> = ({
    color = [
        'url(#paint0_linear_3992_101699)',
        'url(#paint1_linear_3992_101699)',
        'white',
        '#D4D6D9',
        '#BCC4CE',
        '#9EA5B5',
        '#D8D9DC',
        '#BCC4CE',
        '#8892A8',
    ],
    ...props
}) => {
    return (
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g filter="url(#filter0_i_3992_101699)">
                <path
                    d="M6.90563 11.1315C5.83814 10.7547 5.83814 9.24508 6.90563 8.86831L17.4001 5.16439C18.1808 4.88883 18.9995 5.46803 18.9995 6.29598L18.9995 13.7038C18.9995 14.5318 18.1808 15.111 17.4001 14.8354L6.90563 11.1315Z"
                    fill={getColor(color, 1, 'url(#paint0_linear_3992_101699)')}
                />
            </g>
            <g filter="url(#filter1_i_3992_101699)">
                <path
                    d="M0.999268 5.79981C0.999268 4.14295 2.34241 2.7998 3.99927 2.7998H12.3993C14.0561 2.7998 15.3993 4.14295 15.3993 5.7998V14.1998C15.3993 15.8567 14.0561 17.1998 12.3993 17.1998H3.99927C2.34241 17.1998 0.999268 15.8567 0.999268 14.1998V5.79981Z"
                    fill={getColor(color, 2, 'url(#paint1_linear_3992_101699)')}
                />
            </g>
            <path
                opacity="0.9"
                d="M10.0239 10.7809C10.5243 10.3805 10.5243 9.61946 10.0239 9.21913L7.6247 7.29976C6.96993 6.77595 6 7.24212 6 8.08062L6 11.9194C6 12.7579 6.96993 13.2241 7.62469 12.7002L10.0239 10.7809Z"
                fill={getColor(color, 3, 'white')}
            />
            <defs>
                <filter
                    id="filter0_i_3992_101699"
                    x="3.77168"
                    y="3.92832"
                    width="15.2278"
                    height="10.9765"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dx="-2.33333" dy="-1.16667" />
                    <feGaussianBlur stdDeviation="1.75" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.960487 0 0 0 0 0.960487 0 0 0 0 0.960487 0 0 0 0.5 0"
                    />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_3992_101699" />
                </filter>
                <filter
                    id="filter1_i_3992_101699"
                    x="-1.33407"
                    y="1.63314"
                    width="16.7333"
                    height="15.5667"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dx="-2.33333" dy="-1.16667" />
                    <feGaussianBlur stdDeviation="1.75" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.960487 0 0 0 0 0.960487 0 0 0 0 0.960487 0 0 0 0.5 0"
                    />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_3992_101699" />
                </filter>
                <linearGradient
                    id="paint0_linear_3992_101699"
                    x1="4.39492"
                    y1="14.7249"
                    x2="13.8791"
                    y2="3.69379"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.427083" stopColor={getColor(color, 4, '#D4D6D9')} />
                    <stop offset="0.541667" stopColor={getColor(color, 5, '#BCC4CE')} />
                    <stop offset="1" stopColor={getColor(color, 6, '#9EA5B5')} />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_3992_101699"
                    x1="1.89927"
                    y1="3.45435"
                    x2="12.1993"
                    y2="15.9998"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.462622" stopColor={getColor(color, 7, '#D8D9DC')} />
                    <stop offset="0.5329" stopColor={getColor(color, 8, '#BCC4CE')} />
                    <stop offset="1" stopColor={getColor(color, 9, '#8892A8')} />
                </linearGradient>
            </defs>
        </svg>
    );
};
