import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Historical: FC<SVGIconProps> = ({
    color = [
        'url(#paint0_linear_4263_74795)',
        'url(#paint1_linear_4263_74795)',
        'url(#paint2_linear_4263_74795)',
        '#86D136',
        '#61C03B',
        '#009B39',
        '#86D136',
        '#61C03B',
        '#009B39',
        '#86D136',
        '#61C03B',
        '#009B39',
    ],
    ...props
}) => {
    return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g filter="url(#filter0_i_4263_74795)">
                <path
                    d="M24.708 4.66663C23.3963 4.66663 22.333 5.72995 22.333 7.04163V27.625C22.333 28.9366 23.3963 30 24.708 30H26.2913C27.603 30 28.6663 28.9366 28.6663 27.625V7.04163C28.6663 5.72995 27.603 4.66663 26.2913 4.66663H24.708Z"
                    fill={getColor(color, 1, 'url(#paint0_linear_4263_74795)')}
                />
                <path
                    d="M15.208 11C13.8963 11 12.833 12.0633 12.833 13.375V27.625C12.833 28.9366 13.8963 30 15.208 30H16.7913C18.103 30 19.1663 28.9366 19.1663 27.625V13.375C19.1663 12.0633 18.103 11 16.7913 11H15.208Z"
                    fill={getColor(color, 2, 'url(#paint1_linear_4263_74795)')}
                />
                <path
                    d="M5.70801 17.3333C4.39633 17.3333 3.33301 18.3966 3.33301 19.7083V27.625C3.33301 28.9366 4.39633 30 5.70801 30H7.29134C8.60302 30 9.66634 28.9366 9.66634 27.625V19.7083C9.66634 18.3966 8.60302 17.3333 7.29134 17.3333H5.70801Z"
                    fill={getColor(color, 3, 'url(#paint2_linear_4263_74795)')}
                />
            </g>
            <defs>
                <filter
                    id="filter0_i_4263_74795"
                    x="-0.666992"
                    y="2.66663"
                    width="29.333"
                    height="27.3334"
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
                    <feOffset dx="-4" dy="-2" />
                    <feGaussianBlur stdDeviation="3" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.652788 0 0 0 0 1 0 0 0 0 0.583346 0 0 0 0.5 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_4263_74795" />
                </filter>
                <linearGradient
                    id="paint0_linear_4263_74795"
                    x1="4.91634"
                    y1="5.81814"
                    x2="27.6854"
                    y2="18.0689"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.427083" stopColor={getColor(color, 4, '#86D136')} />
                    <stop offset="0.541667" stopColor={getColor(color, 5, '#61C03B')} />
                    <stop offset="1" stopColor={getColor(color, 6, '#009B39')} />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_4263_74795"
                    x1="4.91634"
                    y1="5.81814"
                    x2="27.6854"
                    y2="18.0689"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.427083" stopColor={getColor(color, 7, '#86D136')} />
                    <stop offset="0.541667" stopColor={getColor(color, 8, '#61C03B')} />
                    <stop offset="1" stopColor={getColor(color, 9, '#009B39')} />
                </linearGradient>
                <linearGradient
                    id="paint2_linear_4263_74795"
                    x1="4.91634"
                    y1="5.81814"
                    x2="27.6854"
                    y2="18.0689"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.427083" stopColor={getColor(color, 10, '#86D136')} />
                    <stop offset="0.541667" stopColor={getColor(color, 11, '#61C03B')} />
                    <stop offset="1" stopColor={getColor(color, 12, '#009B39')} />
                </linearGradient>
            </defs>
        </svg>
    );
};
