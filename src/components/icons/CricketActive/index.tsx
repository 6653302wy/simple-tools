import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const CricketActive: FC<SVGIconProps> = ({
    color = [
        'url(#paint0_linear_1_17931)',
        'url(#paint1_linear_1_17931)',
        'url(#paint2_linear_1_17931)',
        '#FF3838',
        '#A43100',
        '#FF3838',
        '#A43100',
        '#FF3838',
        '#A43100',
    ],
    ...props
}) => {
    return (
        <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g filter="url(#filter0_d_1_17931)">
                <path
                    d="M21.4972 16.9995C20.8342 16.9995 20.1984 17.2628 19.7295 17.7317C19.2607 18.2005 18.9973 18.8364 18.9973 19.4994C18.9973 20.1624 19.2607 20.7983 19.7295 21.2671C20.1984 21.7359 20.8342 21.9993 21.4972 21.9993C22.1603 21.9993 22.7961 21.7359 23.265 21.2671C23.7338 20.7983 23.9972 20.1624 23.9972 19.4994C23.9972 18.8364 23.7338 18.2005 23.265 17.7317C22.7961 17.2628 22.1603 16.9995 21.4972 16.9995Z"
                    fill={getColor(color, 1, 'url(#paint0_linear_1_17931)')}
                />
                <path
                    d="M4.18769 20.0494C4.1283 20.1071 4.08109 20.1761 4.04885 20.2523C4.01661 20.3286 4 20.4106 4 20.4933C4 20.5761 4.01661 20.6581 4.04885 20.7344C4.08109 20.8106 4.1283 20.8796 4.18769 20.9373L5.06266 21.8123C5.31265 22.0623 5.71264 22.0623 5.95063 21.8123L7.7887 19.9824C8.01271 19.7594 8.01311 19.3969 7.7896 19.1734L6.83478 18.2186C6.61198 17.9958 6.25086 17.9954 6.02756 18.2177L4.18769 20.0494Z"
                    fill={getColor(color, 2, 'url(#paint1_linear_1_17931)')}
                />
                <path
                    d="M23.634 5.01502L20.9841 2.3651C20.7482 2.13122 20.4294 2 20.0971 2C19.7649 2 19.4461 2.13122 19.2102 2.3651L10.3744 11.2028C10.1406 11.4388 10.0093 11.7576 10.0093 12.0898C10.0093 12.422 10.1406 12.7408 10.3744 12.9768L10.8244 13.4268L7.7207 16.5296C7.49749 16.7527 7.49747 17.1146 7.72065 17.3378L8.67453 18.2917C8.89764 18.5148 9.25936 18.5148 9.48254 18.2918L12.5864 15.1897L13.0234 15.6267C13.2594 15.8609 13.5784 15.9923 13.9108 15.9923C14.2433 15.9923 14.5623 15.8609 14.7983 15.6267L23.634 6.79096C23.8682 6.55496 23.9996 6.23596 23.9996 5.90349C23.9996 5.57102 23.8682 5.25102 23.634 5.01502Z"
                    fill={getColor(color, 3, 'url(#paint2_linear_1_17931)')}
                />
            </g>
            <defs>
                <filter
                    id="filter0_d_1_17931"
                    x="0"
                    y="0"
                    width="28"
                    height="28"
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
                    <feColorMatrix type="matrix" values="0 0 0 0 0.643137 0 0 0 0 0.192157 0 0 0 0 0 0 0 0 0.3 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_17931" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_17931" result="shape" />
                </filter>
                <linearGradient
                    id="paint0_linear_1_17931"
                    x1="19.7473"
                    y1="17.4994"
                    x2="23.2472"
                    y2="21.4993"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 4, '#FF3838')} />
                    <stop offset="1" stopColor={getColor(color, 5, '#A43100')} />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_1_17931"
                    x1="4.62918"
                    y1="18.2339"
                    x2="7.55729"
                    y2="21.5884"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 6, '#FF3838')} />
                    <stop offset="1" stopColor={getColor(color, 7, '#A43100')} />
                </linearGradient>
                <linearGradient
                    id="paint2_linear_1_17931"
                    x1="9.81899"
                    y1="3.66956"
                    x2="21.5071"
                    y2="17.0174"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 8, '#FF3838')} />
                    <stop offset="1" stopColor={getColor(color, 9, '#A43100')} />
                </linearGradient>
            </defs>
        </svg>
    );
};
