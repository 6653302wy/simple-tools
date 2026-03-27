import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const ScheduleActive: FC<SVGIconProps> = ({
    color = ['url(#paint0_linear_3992_101684)', '#FFEE9A', '#FEC84F', '#FB8B07'],
    ...props
}) => {
    return (
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g filter="url(#filter0_i_3992_101684)">
                <path
                    d="M2.57821 12.7441C2.93 12.7441 3.13107 12.5431 3.13107 12.1913V7.99734C3.13107 7.64556 2.93 7.44448 2.57821 7.44448H0V12.7445L2.57821 12.7441ZM7.51179 10.087C7.51179 11.2363 8.33036 12.2198 9.40036 12.4784V7.71734C8.86178 7.83641 8.38038 8.13673 8.03663 8.56811C7.69289 8.99948 7.50761 9.53541 7.51179 10.087ZM10.5564 12.4788C11.6336 12.2202 12.4307 11.2366 12.445 10.0873C12.4521 8.93841 11.6411 7.97627 10.5564 7.7177V12.4788ZM17.4218 7.44484C17.07 7.44484 16.8689 7.64591 16.8689 7.9977V12.1916C16.8689 12.5434 17.07 12.7445 17.4218 12.7445H20V7.44448L17.4218 7.44484ZM20 13.9006H17.4C16.3375 13.9006 15.7129 13.2756 15.7129 12.2127V7.97591C15.7129 6.91306 16.3375 6.28841 17.4004 6.28841H20V5.54841C20 4.06913 19.2461 3.32234 17.745 3.32234H10.5564V6.63306C12.2368 6.90591 13.4793 8.33484 13.5007 10.0945C13.5221 11.8681 12.2439 13.2973 10.5564 13.5702V16.8738H17.745C19.2461 16.8738 20 16.1266 20 14.6473V13.9006ZM0 13.9006V14.647C0 16.1266 0.761071 16.8734 2.255 16.8734H9.4V13.5698C7.71964 13.3045 6.45571 11.8752 6.45571 10.0945C6.45571 8.3277 7.71964 6.87698 9.4 6.61877V3.32234H2.255C0.760714 3.32234 0 4.06198 0 5.54841V6.28841H2.59964C3.6625 6.28841 4.28714 6.91306 4.28714 7.97591V12.2127C4.28714 13.2756 3.66214 13.9006 2.59964 13.9006H0Z"
                    fill={getColor(color, 1, 'url(#paint0_linear_3992_101684)')}
                />
            </g>
            <defs>
                <filter
                    id="filter0_i_3992_101684"
                    x="-2.22222"
                    y="2.21123"
                    width="22.2222"
                    height="14.6625"
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
                    <feOffset dx="-2.22222" dy="-1.11111" />
                    <feGaussianBlur stdDeviation="1.66667" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.9 0 0 0 0 0 0 0 0 1 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_3992_101684" />
                </filter>
                <linearGradient
                    id="paint0_linear_3992_101684"
                    x1="1.25"
                    y1="3.93832"
                    x2="9.6464"
                    y2="19.0317"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.427083" stopColor={getColor(color, 2, '#FFEE9A')} />
                    <stop offset="0.541667" stopColor={getColor(color, 3, '#FEC84F')} />
                    <stop offset="1" stopColor={getColor(color, 4, '#FB8B07')} />
                </linearGradient>
            </defs>
        </svg>
    );
};
