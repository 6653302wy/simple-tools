import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const BasketballActive: FC<SVGIconProps> = ({
    color = [
        'url(#paint0_linear_1_17894)',
        'url(#paint1_linear_1_17894)',
        'url(#paint2_linear_1_17894)',
        'url(#paint3_linear_1_17894)',
        'url(#paint4_linear_1_17894)',
        'url(#paint5_linear_1_17894)',
        'url(#paint6_linear_1_17894)',
        'url(#paint7_linear_1_17894)',
        '#FF8800',
        '#660C0C',
        '#FF8800',
        '#660C0C',
        '#FF8800',
        '#660C0C',
        '#FF8800',
        '#660C0C',
        '#FF8800',
        '#660C0C',
        '#FF8800',
        '#660C0C',
        '#FF8800',
        '#660C0C',
        '#FF8800',
        '#660C0C',
    ],
    ...props
}) => {
    return (
        <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g filter="url(#filter0_d_1_17894)">
                <path
                    d="M13.3799 21.1818C13.3799 21.5916 13.0351 21.9198 12.6288 21.8668C11.1002 21.6672 9.68079 21.1221 8.44948 20.3135C8.11186 20.0918 8.0618 19.6281 8.29964 19.3016C9.64164 17.4596 10.4213 15.34 10.636 13.1746C10.6737 12.7943 10.986 12.4931 11.3681 12.4931H12.6656C13.0601 12.4931 13.3799 12.8129 13.3799 13.2074V21.1818Z"
                    fill={getColor(color, 1, 'url(#paint0_linear_1_17894)')}
                />
                <path
                    d="M16.5044 12.4931C16.8866 12.4931 17.1989 12.7943 17.2366 13.1746C17.4512 15.3408 18.2311 17.4613 19.5738 19.3037C19.8117 19.6302 19.7617 20.094 19.4239 20.3156C18.1925 21.1237 16.7724 21.6676 15.2438 21.8668C14.8374 21.9198 14.4927 21.5916 14.4927 21.1818V13.2074C14.4927 12.8129 14.8125 12.4931 15.207 12.4931H16.5044Z"
                    fill={getColor(color, 2, 'url(#paint1_linear_1_17894)')}
                />
                <path
                    d="M8.81997 12.4931C9.22808 12.4931 9.55539 12.8349 9.50886 13.2404C9.29391 15.1135 8.61372 16.943 7.47022 18.5479C7.22844 18.8873 6.74188 18.9166 6.4643 18.6058C5.15604 17.1412 4.27234 15.2898 4.00566 13.2443C3.95268 12.8379 4.28092 12.4931 4.69075 12.4931H8.81997Z"
                    fill={getColor(color, 3, 'url(#paint2_linear_1_17894)')}
                />
                <path
                    d="M23.1818 12.4931C23.5916 12.4931 23.9199 12.8379 23.8669 13.2443C23.5999 15.2898 22.715 17.1403 21.4062 18.6047C21.1286 18.9155 20.642 18.8861 20.4003 18.5467C19.2577 16.9421 18.5784 15.1129 18.3637 13.2404C18.3172 12.8349 18.6445 12.4931 19.0526 12.4931H23.1818Z"
                    fill={getColor(color, 4, 'url(#paint3_linear_1_17894)')}
                />
                <path
                    d="M6.46532 5.26767C6.74294 4.95695 7.2295 4.98628 7.47124 5.32566C8.61439 6.93054 9.29409 8.76016 9.5089 10.6332C9.5554 11.0386 9.2281 11.3804 8.81999 11.3804H4.69075C4.28092 11.3804 3.95268 11.0356 4.00568 10.6292C4.27247 8.5835 5.1567 6.73227 6.46532 5.26767Z"
                    fill={getColor(color, 5, 'url(#paint4_linear_1_17894)')}
                />
                <path
                    d="M13.3799 10.6661C13.3799 11.0606 13.0601 11.3804 12.6656 11.3804H11.3682C10.986 11.3804 10.6737 11.0792 10.636 10.6988C10.4215 8.53268 9.64157 6.41227 8.29877 4.56982C8.06083 4.24334 8.11087 3.77954 8.4486 3.55786C9.68005 2.74955 11.1001 2.20507 12.6287 2.00563C13.0351 1.95261 13.3799 2.28085 13.3799 2.69068V10.6661Z"
                    fill={getColor(color, 6, 'url(#paint5_linear_1_17894)')}
                />
                <path
                    d="M20.4014 5.32446C20.6431 4.98512 21.1296 4.9558 21.4072 5.26647C22.716 6.73127 23.6002 8.58312 23.8669 10.6292C23.9199 11.0356 23.5916 11.3804 23.1818 11.3804H19.0526C18.6445 11.3804 18.3172 11.0386 18.3636 10.6332C18.5784 8.75978 19.2579 6.92959 20.4014 5.32446Z"
                    fill={getColor(color, 7, 'url(#paint6_linear_1_17894)')}
                />
                <path
                    d="M14.4927 2.69068C14.4927 2.28085 14.8374 1.95261 15.2438 2.00568C16.7717 2.20521 18.1907 2.74995 19.4217 3.55789C19.7595 3.77957 19.8096 4.24339 19.5717 4.56993C18.2296 6.41226 17.4508 8.53298 17.2365 10.6988C17.1989 11.0792 16.8866 11.3804 16.5044 11.3804H15.207C14.8125 11.3804 14.4927 11.0606 14.4927 10.6661V2.69068Z"
                    fill={getColor(color, 8, 'url(#paint7_linear_1_17894)')}
                />
            </g>
            <defs>
                <filter
                    id="filter0_d_1_17894"
                    x="0"
                    y="0"
                    width="27.8726"
                    height="27.8725"
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
                    <feColorMatrix type="matrix" values="0 0 0 0 0.4 0 0 0 0 0.0470588 0 0 0 0 0.0470588 0 0 0 0.3 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1_17894" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1_17894" result="shape" />
                </filter>
                <linearGradient
                    id="paint0_linear_1_17894"
                    x1="6.93628"
                    y1="3.93622"
                    x2="20.9363"
                    y2="19.9362"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 9, '#FF8800')} />
                    <stop offset="1" stopColor={getColor(color, 10, '#660C0C')} />
                </linearGradient>
                <linearGradient
                    id="paint1_linear_1_17894"
                    x1="6.93628"
                    y1="3.93622"
                    x2="20.9363"
                    y2="19.9362"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 11, '#FF8800')} />
                    <stop offset="1" stopColor={getColor(color, 12, '#660C0C')} />
                </linearGradient>
                <linearGradient
                    id="paint2_linear_1_17894"
                    x1="6.93628"
                    y1="3.93622"
                    x2="20.9363"
                    y2="19.9362"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 13, '#FF8800')} />
                    <stop offset="1" stopColor={getColor(color, 14, '#660C0C')} />
                </linearGradient>
                <linearGradient
                    id="paint3_linear_1_17894"
                    x1="6.93628"
                    y1="3.93622"
                    x2="20.9363"
                    y2="19.9362"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 15, '#FF8800')} />
                    <stop offset="1" stopColor={getColor(color, 16, '#660C0C')} />
                </linearGradient>
                <linearGradient
                    id="paint4_linear_1_17894"
                    x1="6.93628"
                    y1="3.93622"
                    x2="20.9363"
                    y2="19.9362"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 17, '#FF8800')} />
                    <stop offset="1" stopColor={getColor(color, 18, '#660C0C')} />
                </linearGradient>
                <linearGradient
                    id="paint5_linear_1_17894"
                    x1="6.93628"
                    y1="3.93622"
                    x2="20.9363"
                    y2="19.9362"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 19, '#FF8800')} />
                    <stop offset="1" stopColor={getColor(color, 20, '#660C0C')} />
                </linearGradient>
                <linearGradient
                    id="paint6_linear_1_17894"
                    x1="6.93628"
                    y1="3.93622"
                    x2="20.9363"
                    y2="19.9362"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 21, '#FF8800')} />
                    <stop offset="1" stopColor={getColor(color, 22, '#660C0C')} />
                </linearGradient>
                <linearGradient
                    id="paint7_linear_1_17894"
                    x1="6.93628"
                    y1="3.93622"
                    x2="20.9363"
                    y2="19.9362"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop stopColor={getColor(color, 23, '#FF8800')} />
                    <stop offset="1" stopColor={getColor(color, 24, '#660C0C')} />
                </linearGradient>
            </defs>
        </svg>
    );
};
