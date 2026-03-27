import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Overview: FC<SVGIconProps> = ({
    color = [
        'url(#paint0_linear_4263_74799)',
        'url(#paint1_linear_4263_74799)',
        'url(#paint2_linear_4263_74799)',
        'url(#paint3_linear_4263_74799)',
        'url(#paint4_linear_4263_74799)',
        'url(#paint5_linear_4263_74799)',
        '#86D136',
        '#61C03B',
        '#009B39',
        '#86D136',
        '#61C03B',
        '#009B39',
        '#86D136',
        '#61C03B',
        '#009B39',
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
            <g filter="url(#filter0_i_4263_74799)">
                <path
                    d="M7.87222 7.62201C7.01559 6.66733 6.51614 5.66779 6.34097 4.64175C8.76324 2.6134 11.8791 1.33337 15.2783 1.33337C17.0334 1.33337 18.7072 1.67303 20.2555 2.26733C17.6628 4.86499 15.4945 7.94074 13.7986 11.2609C11.2996 10.3572 9.21677 9.121 7.87222 7.62201Z"
                    fill={getColor(color, 1, 'url(#paint0_linear_4263_74799)')}
                />
                <path
                    d="M6.65137 8.7179C8.15634 10.3953 10.3934 11.7595 13.066 12.7509C12.7339 13.4793 12.4286 14.223 12.1413 14.9762C10.7687 14.681 9.34622 14.5131 7.89551 14.5131C5.61166 14.5131 3.39297 14.9006 1.34711 15.6128C1.34518 15.519 1.33301 15.4278 1.33301 15.3334C1.33301 11.7221 2.72455 8.43762 4.98468 5.95831C5.31815 6.91919 5.87164 7.84909 6.65137 8.7179Z"
                    fill={getColor(color, 2, 'url(#paint1_linear_4263_74799)')}
                />
                <path
                    d="M29.0132 12.3864C27.2694 12.6947 25.3374 12.8724 23.4814 12.8724C20.6044 12.8724 17.8407 12.464 15.3777 11.7625C17.0749 8.5015 19.2568 5.50031 21.8611 2.99045C25.4053 4.89661 28.1399 8.34577 29.0132 12.3864Z"
                    fill={getColor(color, 3, 'url(#paint2_linear_4263_74799)')}
                />
                <path
                    d="M1.48853 17.3019C3.46753 16.557 5.64563 16.1537 7.89551 16.1537C9.15674 16.1537 10.3953 16.2859 11.5899 16.5273C10.3772 20.1642 9.67542 24.0953 9.55557 28.0912C5.28909 26.1611 2.17041 22.0956 1.48853 17.3019Z"
                    fill={getColor(color, 4, 'url(#paint3_linear_4263_74799)')}
                />
                <path
                    d="M29.333 15.3334C29.333 19.6477 27.2534 23.5645 24.1665 26.1243C23.8395 23.9486 22.8585 21.8081 21.2608 20.0166C19.3604 17.886 16.7233 16.2904 13.7368 15.3797C14.0147 14.6628 14.3183 13.96 14.6387 13.267C17.3073 14.0585 20.313 14.5131 23.4814 14.5131C25.4199 14.5131 27.4371 14.3279 29.2657 14.0066C29.3072 14.4438 29.333 14.8856 29.333 15.3334Z"
                    fill={getColor(color, 5, 'url(#paint4_linear_4263_74799)')}
                />
                <path
                    d="M20.0359 21.1085C21.6498 22.9183 22.5242 25.0408 22.6364 27.2123C20.4973 28.5481 17.9807 29.3334 15.2783 29.3334C13.8575 29.3334 12.4867 29.1172 11.1941 28.7205C11.2569 24.636 11.9426 20.6199 13.1893 16.9234C15.9183 17.7418 18.3188 19.1831 20.0359 21.1085Z"
                    fill={getColor(color, 6, 'url(#paint5_linear_4263_74799)')}
                />
            </g>
            <defs>
                <filter
                    id="filter0_i_4263_74799"
                    x="-2.64187"
                    y="-0.654063"
                    width="31.9749"
                    height="29.9874"
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
                    <feOffset dx="-3.97487" dy="-1.98744" />
                    <feGaussianBlur stdDeviation="2.98116" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.652788 0 0 0 0 1 0 0 0 0 0.583346 0 0 0 0.5 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_4263_74799" />
                </filter>
                <linearGradient
                    id="paint0_linear_4263_74799"
                    x1="3.08301"
                    y1="2.6061"
                    x2="28.2488"
                    y2="16.1464"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.427083" stopColor={getColor(color, 7, '#86D136')} />
                    <stop offset="0.541667" stopColor={getColor(color, 8, '#61C03B')} />
                    <stop offset="1" stopColor={getColor(color, 9, '#009B39')} />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_4263_74799"
                    x1="3.08301"
                    y1="2.6061"
                    x2="28.2488"
                    y2="16.1464"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.427083" stopColor={getColor(color, 10, '#86D136')} />
                    <stop offset="0.541667" stopColor={getColor(color, 11, '#61C03B')} />
                    <stop offset="1" stopColor={getColor(color, 12, '#009B39')} />
                </linearGradient>
                <linearGradient
                    id="paint2_linear_4263_74799"
                    x1="3.08301"
                    y1="2.6061"
                    x2="28.2488"
                    y2="16.1464"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.427083" stopColor={getColor(color, 13, '#86D136')} />
                    <stop offset="0.541667" stopColor={getColor(color, 14, '#61C03B')} />
                    <stop offset="1" stopColor={getColor(color, 15, '#009B39')} />
                </linearGradient>
                <linearGradient
                    id="paint3_linear_4263_74799"
                    x1="3.08301"
                    y1="2.6061"
                    x2="28.2488"
                    y2="16.1464"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.427083" stopColor={getColor(color, 16, '#86D136')} />
                    <stop offset="0.541667" stopColor={getColor(color, 17, '#61C03B')} />
                    <stop offset="1" stopColor={getColor(color, 18, '#009B39')} />
                </linearGradient>
                <linearGradient
                    id="paint4_linear_4263_74799"
                    x1="3.08301"
                    y1="2.6061"
                    x2="28.2488"
                    y2="16.1464"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.427083" stopColor={getColor(color, 19, '#86D136')} />
                    <stop offset="0.541667" stopColor={getColor(color, 20, '#61C03B')} />
                    <stop offset="1" stopColor={getColor(color, 21, '#009B39')} />
                </linearGradient>
                <linearGradient
                    id="paint5_linear_4263_74799"
                    x1="3.08301"
                    y1="2.6061"
                    x2="28.2488"
                    y2="16.1464"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.427083" stopColor={getColor(color, 22, '#86D136')} />
                    <stop offset="0.541667" stopColor={getColor(color, 23, '#61C03B')} />
                    <stop offset="1" stopColor={getColor(color, 24, '#009B39')} />
                </linearGradient>
            </defs>
        </svg>
    );
};
