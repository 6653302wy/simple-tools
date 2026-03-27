import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const YellowCard: FC<SVGIconProps> = ({ color = ['#FFC700', 'white'], ...props }) => {
    return (
        <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g clipPath="url(#clip0_4013_106748)">
                <g filter="url(#filter0_i_4013_106748)">
                    <path
                        d="M5.14993 0.266602H11.21C12.725 0.266602 13.8192 1.61329 13.4825 3.21247L12.22 10.7876C11.9675 12.3868 10.4525 13.7334 8.93748 13.7334H2.8774C1.36238 13.7334 0.268199 12.3868 0.60487 10.7876L1.86739 3.21247C2.11989 1.61329 3.55074 0.266602 5.14993 0.266602Z"
                        fill={getColor(color, 1, '#FFC700')}
                    />
                </g>
            </g>
            <defs>
                <filter
                    id="filter0_i_4013_106748"
                    x="-1.4563"
                    y="-0.733398"
                    width="15"
                    height="14.4668"
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
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_4013_106748" />
                </filter>
                <clipPath id="clip0_4013_106748">
                    <rect width="14" height="14" fill={getColor(color, 2, 'white')} />
                </clipPath>
            </defs>
        </svg>
    );
};
