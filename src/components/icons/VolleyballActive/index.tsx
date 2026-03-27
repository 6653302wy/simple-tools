import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const VolleyballActive: FC<SVGIconProps> = ({
    color = [
        'url(#paint0_linear_1_17922)',
        'url(#paint1_linear_1_17922)',
        'url(#paint2_linear_1_17922)',
        'url(#paint3_linear_1_17922)',
        'url(#paint4_linear_1_17922)',
        '#C5D6ED',
        '#537FB9',
        '#C5D6ED',
        '#537FB9',
        '#C5D6ED',
        '#537FB9',
        '#C5D6ED',
        '#537FB9',
        '#C5D6ED',
        '#537FB9',
    ],
    ...props
}) => {
    return (
        <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g filter="url(#filter0_d_1_17922)">
                <path
                    d="M23.9998 11.9998C23.9998 10.6906 23.7873 9.4876 23.2675 8.29604C23.1575 8.04399 22.8747 7.92094 22.6111 7.99934C22.112 8.14783 21.6405 8.29631 21.1506 8.44479C20.7801 8.55707 20.6193 8.99622 20.8116 9.33222C22.0969 11.5781 22.5748 14.1745 22.1834 16.6249C22.1342 16.9326 22.5208 17.1154 22.68 16.8475C23.5183 15.4363 23.9998 13.7582 23.9998 11.9998Z"
                    fill={getColor(color, 1, 'url(#paint0_linear_1_17922)')}
                />
            </g>
            <g filter="url(#filter1_d_1_17922)">
                <path
                    d="M19.7228 9.44526C19.5779 9.22073 19.2913 9.13927 19.0452 9.24357C17.7156 9.80726 16.4723 10.3877 15.2355 11.1446C15.0496 11.2584 14.9492 11.4705 14.9698 11.6875C15.1866 13.9694 15.0535 16.2513 14.8 18.5332V18.7999C14.6991 19.6067 14.522 20.4135 14.2686 21.2203C14.149 21.601 14.4261 21.999 14.8239 21.968C16.8464 21.8103 18.6456 21.0754 20.048 19.9367C20.1047 19.8907 20.1514 19.8334 20.1853 19.7687C21.9235 16.4581 21.7311 12.5574 19.7228 9.44526Z"
                    fill={getColor(color, 2, 'url(#paint1_linear_1_17922)')}
                />
            </g>
            <g filter="url(#filter2_d_1_17922)">
                <path
                    d="M8.99642 8.26474C8.8757 8.49815 8.94353 8.78262 9.15176 8.9429C10.2911 9.81988 11.5165 10.6027 12.7486 11.2913C12.9421 11.3994 13.1803 11.3825 13.361 11.2543C15.2408 9.92043 17.2313 8.92411 19.2237 8.04808C19.2959 8.01635 19.3826 8.00966 19.4416 7.95733C19.4594 7.94154 19.4751 7.92368 19.493 7.90802C19.5513 7.85711 19.6363 7.85083 19.7079 7.82126C20.3918 7.53848 21.1405 7.32313 21.8522 7.12435C22.2027 7.02645 22.372 6.62965 22.1735 6.32461C21.0964 4.66913 19.4465 3.43477 17.5838 2.71153C17.5067 2.68158 17.4237 2.66966 17.3413 2.67683C13.9273 2.97388 10.6515 5.06459 8.99642 8.26474Z"
                    fill={getColor(color, 3, 'url(#paint2_linear_1_17922)')}
                />
            </g>
            <g filter="url(#filter3_d_1_17922)">
                <path
                    d="M13.567 19.8458C13.6434 19.5206 13.4008 19.2003 13.0667 19.2003C10.3659 19.2003 7.75996 18.2504 5.73006 16.5913C5.48741 16.3929 5.13213 16.6421 5.28594 16.9151C6.77764 19.5634 9.43926 21.4648 12.5912 21.9399C12.8652 21.9812 13.1231 21.8062 13.1893 21.5371C13.3282 20.9733 13.4345 20.4096 13.567 19.8458Z"
                    fill={getColor(color, 4, 'url(#paint3_linear_1_17922)')}
                />
            </g>
            <g filter="url(#filter4_d_1_17922)">
                <path
                    d="M13.4088 18.1546C13.6765 18.1476 13.8961 17.9451 13.9337 17.6801C14.1382 16.2344 14.2394 14.8671 14.1568 13.4176C14.1445 13.2023 14.0072 13.0155 13.8093 12.9298C11.7194 12.0244 9.85578 10.7823 8.11035 9.41977C8.03876 9.36388 7.94042 9.33934 7.87568 9.27564C7.79905 9.20023 7.69069 9.15713 7.61409 9.0817C7.05459 8.53079 6.49834 8.03865 5.991 7.51397C5.72195 7.23572 5.25439 7.26753 5.07447 7.61022C4.38546 8.92249 4 10.4131 4 12C4 12.3801 4 12.7601 4.11437 13.1402C4.12639 13.1801 4.14418 13.2182 4.16585 13.2538C6.09639 16.4265 9.60501 18.2545 13.4088 18.1546ZM7.46126 7.54259C7.73258 7.78495 8.15299 7.69254 8.3358 7.37802C9.63069 5.15022 11.647 3.4475 14.0542 2.53418C14.2362 2.46512 14.1947 2 14 2C10.8386 2 8.03699 3.4392 6.27768 5.74887C6.11105 5.96762 6.14067 6.27448 6.33566 6.46837C6.71086 6.84145 7.08606 7.20745 7.46126 7.54259Z"
                    fill={getColor(color, 5, 'url(#paint4_linear_1_17922)')}
                />
            </g>
            <defs>
                <filter
                    id="filter0_d_1_17922"
                    x="16.7299"
                    y="5.97589"
                    width="11.2699"
                    height="17.0013"
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
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.32549 0 0 0 0 0.498039 0 0 0 0 0.72549 0 0 0 0.3 0"
                    />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_17922" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_17922" result="shape" />
                </filter>
                <filter
                    id="filter1_d_1_17922"
                    x="10.2405"
                    y="7.19867"
                    width="15.1293"
                    height="20.771"
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
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.32549 0 0 0 0 0.498039 0 0 0 0 0.72549 0 0 0 0.3 0"
                    />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_17922" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_17922" result="shape" />
                </filter>
                <filter
                    id="filter2_d_1_17922"
                    x="4.93677"
                    y="0.674805"
                    width="21.3212"
                    height="16.6877"
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
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.32549 0 0 0 0 0.498039 0 0 0 0 0.72549 0 0 0 0.3 0"
                    />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_17922" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_17922" result="shape" />
                </filter>
                <filter
                    id="filter3_d_1_17922"
                    x="1.24854"
                    y="14.5198"
                    width="16.3325"
                    height="13.4261"
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
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.32549 0 0 0 0 0.498039 0 0 0 0 0.72549 0 0 0 0.3 0"
                    />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_17922" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_17922" result="shape" />
                </filter>
                <filter
                    id="filter4_d_1_17922"
                    x="0"
                    y="0"
                    width="18.1857"
                    height="24.1585"
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
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.32549 0 0 0 0 0.498039 0 0 0 0 0.72549 0 0 0 0.3 0"
                    />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_17922" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_17922" result="shape" />
                </filter>
                <linearGradient
                    id="paint0_linear_1_17922"
                    x1="20.9398"
                    y1="8.87979"
                    x2="25.9288"
                    y2="10.9054"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 6, '#C5D6ED')} />
                    <stop offset="1" stopColor={getColor(color, 7, '#537FB9')} />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_1_17922"
                    x1="15.1055"
                    y1="10.3599"
                    x2="23.4594"
                    y2="15.8002"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 8, '#C5D6ED')} />
                    <stop offset="1" stopColor={getColor(color, 9, '#537FB9')} />
                </linearGradient>
                <linearGradient
                    id="paint2_linear_1_17922"
                    x1="10.8598"
                    y1="3.54675"
                    x2="16.1622"
                    y2="13.0038"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 10, '#C5D6ED')} />
                    <stop offset="1" stopColor={getColor(color, 11, '#537FB9')} />
                </linearGradient>
                <linearGradient
                    id="paint3_linear_1_17922"
                    x1="6.02675"
                    y1="16.2403"
                    x2="10.0684"
                    y2="22.7839"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 12, '#C5D6ED')} />
                    <stop offset="1" stopColor={getColor(color, 13, '#537FB9')} />
                </linearGradient>
                <linearGradient
                    id="paint4_linear_1_17922"
                    x1="5.7"
                    y1="3.61585"
                    x2="16.8384"
                    y2="12.5442"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 14, '#C5D6ED')} />
                    <stop offset="1" stopColor={getColor(color, 15, '#537FB9')} />
                </linearGradient>
            </defs>
        </svg>
    );
};
