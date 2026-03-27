import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Favorite: FC<SVGIconProps> = ({
    color = ['url(#paint0_linear_4050_36200)', 'white', '#D8D9DC', '#BCC4CE', '#8892A8'],
    ...props
}) => {
    return (
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g filter="url(#filter0_i_4050_36200)">
                <path
                    d="M8.22953 2.14427C8.95375 0.618578 11.0462 0.618576 11.7705 2.14427L13.0221 4.78106C13.3097 5.38691 13.8656 5.80684 14.5087 5.904L17.3074 6.32682C18.9268 6.57148 19.5734 8.64059 18.4016 9.82817L16.3764 11.8806C15.9111 12.3522 15.6988 13.0317 15.8086 13.6976L16.2867 16.5957C16.5633 18.2726 14.8704 19.5514 13.422 18.7596L10.9187 17.3913C10.3436 17.0769 9.65643 17.0769 9.08125 17.3913L6.57799 18.7596C5.12955 19.5514 3.43668 18.2726 3.71331 16.5957L4.19139 13.6976C4.30124 13.0317 4.0889 12.3522 3.62357 11.8806L1.59839 9.82818C0.42658 8.64059 1.0732 6.57148 2.69259 6.32682L5.49134 5.904C6.1344 5.80684 6.69031 5.38691 6.9779 4.78106L8.22953 2.14427Z"
                    fill={getColor(color, 1, 'url(#paint0_linear_4050_36200)')}
                />
            </g>
            <path
                opacity="0.9"
                d="M8 12C9.10457 13.1045 10.8955 13.1046 12 12"
                stroke={getColor(color, 2, 'white')}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <defs>
                <filter
                    id="filter0_i_4050_36200"
                    x="-1.33333"
                    y="-0.166667"
                    width="20.3333"
                    height="19.1667"
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
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_4050_36200" />
                </filter>
                <linearGradient
                    id="paint0_linear_4050_36200"
                    x1="2.125"
                    y1="1.81818"
                    x2="15"
                    y2="17.5"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.462622" stopColor={getColor(color, 3, '#D8D9DC')} />
                    <stop offset="0.5329" stopColor={getColor(color, 4, '#BCC4CE')} />
                    <stop offset="1" stopColor={getColor(color, 5, '#8892A8')} />
                </linearGradient>
            </defs>
        </svg>
    );
};
