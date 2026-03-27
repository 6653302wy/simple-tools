import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const TennisActive: FC<SVGIconProps> = ({
    color = [
        'url(#paint0_linear_1_17902)',
        'url(#paint1_linear_1_17902)',
        'url(#paint2_linear_1_17902)',
        '#B3FF00',
        '#00971C',
        '#B3FF00',
        '#00971C',
        '#B3FF00',
        '#00971C',
    ],
    ...props
}) => {
    return (
        <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g filter="url(#filter0_d_1_17902)">
                <path
                    d="M7.52381 4.34095C8.68078 3.35783 9.99675 2.68459 11.371 2.31169C12.0025 2.14036 12.6065 2.58413 12.7625 3.21956C13.2549 5.22594 14.2318 7.82273 16.1764 10.1112C18.121 12.3997 20.5261 13.7829 22.4267 14.5927C23.028 14.8489 23.3684 15.5153 23.0979 16.1103C22.5084 17.4072 21.632 18.5981 20.4745 19.5817C19.3168 20.5654 18 21.2386 16.6248 21.6112C15.9936 21.7823 15.3917 21.3383 15.2358 20.7031C14.7433 18.6967 13.7665 16.0999 11.8219 13.8114C9.87727 11.5229 7.47219 10.1398 5.5716 9.32993C4.96932 9.0733 4.62816 8.40634 4.89938 7.81048C5.48939 6.51428 6.3667 5.32419 7.52381 4.34095Z"
                    fill={getColor(color, 1, 'url(#paint0_linear_1_17902)')}
                />
                <path
                    d="M4.02682 11.2328C4.06239 10.7468 4.56321 10.4533 5.01153 10.6443C6.78435 11.3997 8.97771 12.6705 10.7333 14.7365C12.4888 16.8025 13.3889 19.1722 13.8483 21.0437C13.9643 21.5163 13.5936 21.9627 13.1089 21.9195C10.5866 21.6945 8.14805 20.5188 6.37878 18.4367C4.60958 16.3546 3.84198 13.7582 4.02682 11.2328Z"
                    fill={getColor(color, 2, 'url(#paint1_linear_1_17902)')}
                />
                <path
                    d="M14.15 2.87898C14.0339 2.40603 14.403 1.95968 14.888 2.00288C17.4108 2.22753 19.8499 3.40347 21.6195 5.48599C23.3892 7.5686 24.1552 10.1656 23.9695 12.6915C23.9338 13.1766 23.4342 13.469 22.9868 13.2783C21.2139 12.5229 19.0206 11.2522 17.265 9.18618C15.5095 7.12018 14.6094 4.75048 14.15 2.87898Z"
                    fill={getColor(color, 3, 'url(#paint2_linear_1_17902)')}
                />
            </g>
            <defs>
                <filter
                    id="filter0_d_1_17902"
                    x="0"
                    y="0"
                    width="27.9966"
                    height="27.9224"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                    />
                    <feOffset dy="2" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.592157 0 0 0 0 0.109804 0 0 0 0.3 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_17902" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_17902" result="shape" />
                </filter>
                <linearGradient
                    id="paint0_linear_1_17902"
                    x1="9.16235"
                    y1="1.73044"
                    x2="18.9485"
                    y2="22.1381"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 4, '#B3FF00')} />
                    <stop offset="1" stopColor={getColor(color, 5, '#00971C')} />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_1_17902"
                    x1="9.16235"
                    y1="1.73044"
                    x2="18.9485"
                    y2="22.1381"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 6, '#B3FF00')} />
                    <stop offset="1" stopColor={getColor(color, 7, '#00971C')} />
                </linearGradient>
                <linearGradient
                    id="paint2_linear_1_17902"
                    x1="9.16235"
                    y1="1.73044"
                    x2="18.9485"
                    y2="22.1381"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 8, '#B3FF00')} />
                    <stop offset="1" stopColor={getColor(color, 9, '#00971C')} />
                </linearGradient>
            </defs>
        </svg>
    );
};
