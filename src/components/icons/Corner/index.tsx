import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Corner: FC<SVGIconProps> = ({
    color = ['#CCCCCC', '#1D2129', '#EB3333', 'white', 'white', 'white'],
    ...props
}) => {
    return (
        <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g clipPath="url(#clip0_4013_106745)">
                <path d="M1.23193 14.0002H2.00893V6.16016H1.23193V14.0002Z" fill={getColor(color, 1, '#CCCCCC')} />
                <g filter="url(#filter0_i_4013_106745)">
                    <path
                        d="M0.573975 13.5657C0.573975 13.8037 0.762975 13.9927 1.00097 13.9927L13.02 13.9087C13.391 13.9087 13.58 13.4607 13.328 13.1947C12.005 11.7877 8.79197 8.78468 5.44597 8.72168C5.34097 8.72168 5.24297 8.75668 5.16597 8.82668C4.49397 9.42168 1.24597 12.3197 0.636975 13.3487C0.594975 13.4187 0.573975 13.4887 0.573975 13.5657Z"
                        fill={getColor(color, 2, '#1D2129')}
                    />
                </g>
                <g filter="url(#filter1_i_4013_106745)">
                    <path d="M1.23193 0V6.398L9.19093 6.37L1.23193 0Z" fill={getColor(color, 3, '#EB3333')} />
                </g>
                <path
                    d="M11.354 13.4606H2.00905C1.79205 13.4606 1.68005 13.3556 1.57505 13.1806C1.47005 13.0056 1.47705 12.7956 1.59605 12.6346L5.26405 9.80664L5.72605 10.3036L2.39405 12.7746H11.361V13.4606H11.354Z"
                    fill={getColor(color, 4, 'white')}
                />
                <path
                    d="M6.11085 13.2091C5.76085 12.0471 5.14485 11.2282 3.84985 10.9902L4.38885 10.5352C5.87985 11.0392 6.14585 11.6551 6.83185 13.0271L6.11085 13.2091Z"
                    fill={getColor(color, 5, 'white')}
                />
            </g>
            <defs>
                <filter
                    id="filter0_i_4013_106745"
                    x="-1.12603"
                    y="7.72168"
                    width="14.5689"
                    height="6.27148"
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
                    <feGaussianBlur stdDeviation="0.85" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.935622 0 0 0 0 0.935622 0 0 0 0 0.935622 0 0 0 1 0"
                    />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_4013_106745" />
                </filter>
                <filter
                    id="filter1_i_4013_106745"
                    x="-0.768066"
                    y="-1"
                    width="9.95898"
                    height="7.39844"
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
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.49067 0 0 0 0 0.454289 0 0 0 1 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_4013_106745" />
                </filter>
                <clipPath id="clip0_4013_106745">
                    <rect width="14" height="14" fill={getColor(color, 6, 'white')} />
                </clipPath>
            </defs>
        </svg>
    );
};
