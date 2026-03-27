import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Schedule: FC<SVGIconProps> = ({
    color = ['url(#paint0_linear_3992_101682)', '#D8D9DC', '#BCC4CE', '#8892A8'],
    ...props
}) => {
    return (
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g filter="url(#filter0_i_3992_101682)">
                <path
                    d="M2.57821 12.7441C2.93 12.7441 3.13107 12.5431 3.13107 12.1913V7.99734C3.13107 7.64556 2.93 7.44448 2.57821 7.44448H0V12.7445L2.57821 12.7441ZM7.51179 10.087C7.51179 11.2363 8.33036 12.2198 9.40036 12.4784V7.71734C8.86178 7.83641 8.38038 8.13673 8.03663 8.56811C7.69289 8.99948 7.50761 9.53541 7.51179 10.087ZM10.5564 12.4788C11.6336 12.2202 12.4307 11.2366 12.445 10.0873C12.4521 8.93841 11.6411 7.97627 10.5564 7.7177V12.4788ZM17.4218 7.44484C17.07 7.44484 16.8689 7.64591 16.8689 7.9977V12.1916C16.8689 12.5434 17.07 12.7445 17.4218 12.7445H20V7.44448L17.4218 7.44484ZM20 13.9006H17.4C16.3375 13.9006 15.7129 13.2756 15.7129 12.2127V7.97591C15.7129 6.91306 16.3375 6.28841 17.4004 6.28841H20V5.54841C20 4.06913 19.2461 3.32234 17.745 3.32234H10.5564V6.63306C12.2368 6.90591 13.4793 8.33484 13.5007 10.0945C13.5221 11.8681 12.2439 13.2973 10.5564 13.5702V16.8738H17.745C19.2461 16.8738 20 16.1266 20 14.6473V13.9006ZM0 13.9006V14.647C0 16.1266 0.761071 16.8734 2.255 16.8734H9.4V13.5698C7.71964 13.3045 6.45571 11.8752 6.45571 10.0945C6.45571 8.3277 7.71964 6.87698 9.4 6.61877V3.32234H2.255C0.760714 3.32234 0 4.06198 0 5.54841V6.28841H2.59964C3.6625 6.28841 4.28714 6.91306 4.28714 7.97591V12.2127C4.28714 13.2756 3.66214 13.9006 2.59964 13.9006H0Z"
                    fill={getColor(color, 1, 'url(#paint0_linear_3992_101682)')}
                />
            </g>
            <defs>
                <filter
                    id="filter0_i_3992_101682"
                    x="-2.59259"
                    y="2.02605"
                    width="22.5926"
                    height="14.8477"
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
                    <feOffset dx="-2.59259" dy="-1.2963" />
                    <feGaussianBlur stdDeviation="1.94444" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.960487 0 0 0 0 0.960487 0 0 0 0 0.960487 0 0 0 0.5 0"
                    />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_3992_101682" />
                </filter>
                <linearGradient
                    id="paint0_linear_3992_101682"
                    x1="1.25"
                    y1="3.93832"
                    x2="9.6464"
                    y2="19.0317"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.462622" stopColor={getColor(color, 2, '#D8D9DC')} />
                    <stop offset="0.5329" stopColor={getColor(color, 3, '#BCC4CE')} />
                    <stop offset="1" stopColor={getColor(color, 4, '#8892A8')} />
                </linearGradient>
            </defs>
        </svg>
    );
};
