import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const UnderwayActive: FC<SVGIconProps> = ({
    color = ['#FDC135', 'url(#paint0_linear_3992_101703)', 'white', '#FFEE9A', '#FEC84F', '#FB8B07'],
    ...props
}) => {
    return (
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g filter="url(#filter0_i_3992_101703)">
                <path
                    d="M6.372 11.1431C5.48243 10.8291 5.48243 9.57107 6.372 9.25711L17.6674 5.27051C18.318 5.04087 19.0002 5.52354 19.0002 6.21349L19.0002 14.1867C19.0002 14.8767 18.318 15.3593 17.6674 15.1297L6.372 11.1431Z"
                    fill={getColor(color, 1, '#FDC135')}
                />
            </g>
            <g filter="url(#filter1_i_3992_101703)">
                <rect
                    x="1"
                    y="3"
                    width="14.4"
                    height="14.4"
                    rx="3"
                    fill={getColor(color, 2, 'url(#paint0_linear_3992_101703)')}
                />
            </g>
            <path
                d="M10.0246 10.9811C10.5251 10.5807 10.5251 9.81965 10.0246 9.41933L7.62543 7.49995C6.97066 6.97614 6.00073 7.44231 6.00073 8.28082L6.00073 12.1196C6.00073 12.9581 6.97066 13.4243 7.62543 12.9004L10.0246 10.9811Z"
                fill={getColor(color, 3, 'white')}
            />
            <defs>
                <filter
                    id="filter0_i_3992_101703"
                    x="3.70482"
                    y="4.21266"
                    width="15.2954"
                    height="10.9749"
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
                    <feOffset dx="-2" dy="-1" />
                    <feGaussianBlur stdDeviation="1.5" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.992157 0 0 0 0 0.756863 0 0 0 0 0.207843 0 0 0 1 0"
                    />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_3992_101703" />
                </filter>
                <filter
                    id="filter1_i_3992_101703"
                    x="-1"
                    y="2"
                    width="16.4"
                    height="15.4"
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
                    <feOffset dx="-2" dy="-1" />
                    <feGaussianBlur stdDeviation="1.5" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.9 0 0 0 0 0 0 0 0 1 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_3992_101703" />
                </filter>
                <linearGradient
                    id="paint0_linear_3992_101703"
                    x1="1.9"
                    y1="3.65455"
                    x2="12.2"
                    y2="16.2"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.427083" stopColor={getColor(color, 4, '#FFEE9A')} />
                    <stop offset="0.541667" stopColor={getColor(color, 5, '#FEC84F')} />
                    <stop offset="1" stopColor={getColor(color, 6, '#FB8B07')} />
                </linearGradient>
            </defs>
        </svg>
    );
};
