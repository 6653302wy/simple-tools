import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Odds: FC<SVGIconProps> = ({
    color = ['url(#paint0_linear_4263_74787)', 'white', 'white', '#86D136', '#61C03B', '#009B39'],
    ...props
}) => {
    return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g filter="url(#filter0_i_4263_74787)">
                <path
                    d="M15.3523 21.204C15.4264 21.1005 15.524 21.0162 15.6372 20.958C15.7503 20.8998 15.8757 20.8694 16.003 20.8694C16.1302 20.8694 16.2556 20.8998 16.3688 20.958C16.482 21.0162 16.5796 21.1005 16.6537 21.204L20.3417 26.3613C20.4272 26.4809 20.4781 26.6218 20.4888 26.7684C20.4995 26.915 20.4696 27.0618 20.4024 27.1925C20.3351 27.3233 20.2332 27.4329 20.1077 27.5095C19.9822 27.5861 19.838 27.6266 19.691 27.6267H12.3163C12.1693 27.6266 12.0251 27.5861 11.8996 27.5095C11.7741 27.4329 11.6722 27.3233 11.605 27.1925C11.5377 27.0618 11.5078 26.915 11.5185 26.7684C11.5292 26.6218 11.5801 26.4809 11.6657 26.3613L15.3523 21.204ZM26.667 4C27.3742 4 28.0525 4.28095 28.5526 4.78105C29.0527 5.28115 29.3337 5.95942 29.3337 6.66667V21.3333C29.3337 22.0406 29.0527 22.7189 28.5526 23.219C28.0525 23.719 27.3742 24 26.667 24H21.7203L17.519 18.124C17.3463 17.8823 17.1184 17.6854 16.8542 17.5495C16.5901 17.4136 16.2974 17.3427 16.0003 17.3427C15.7033 17.3427 15.4105 17.4136 15.1464 17.5495C14.8823 17.6854 14.6544 17.8823 14.4817 18.124L10.2817 24H5.33366C4.62641 24 3.94814 23.719 3.44804 23.219C2.94794 22.7189 2.66699 22.0406 2.66699 21.3333V6.66667C2.66699 5.95942 2.94794 5.28115 3.44804 4.78105C3.94814 4.28095 4.62641 4 5.33366 4H26.667Z"
                    fill={getColor(color, 1, 'url(#paint0_linear_4263_74787)')}
                />
            </g>
            <rect x="6.66699" y="8" width="13.3333" height="2" rx="1" fill={getColor(color, 2, 'white')} />
            <path
                d="M6.66699 13.9333C6.66699 13.3811 7.11471 12.9333 7.66699 12.9333H15.0003C15.5526 12.9333 16.0003 13.3811 16.0003 13.9333C16.0003 14.4856 15.5526 14.9333 15.0003 14.9333H7.66699C7.11471 14.9333 6.66699 14.4856 6.66699 13.9333Z"
                fill={getColor(color, 3, 'white')}
            />
            <defs>
                <filter
                    id="filter0_i_4263_74787"
                    x="-1.33301"
                    y="2"
                    width="30.667"
                    height="25.6267"
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
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_4263_74787" />
                </filter>
                <linearGradient
                    id="paint0_linear_4263_74787"
                    x1="4.33366"
                    y1="5.07394"
                    x2="26.9127"
                    y2="18.7856"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.427083" stopColor={getColor(color, 4, '#86D136')} />
                    <stop offset="0.541667" stopColor={getColor(color, 5, '#61C03B')} />
                    <stop offset="1" stopColor={getColor(color, 6, '#009B39')} />
                </linearGradient>
            </defs>
        </svg>
    );
};
