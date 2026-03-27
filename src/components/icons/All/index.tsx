import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const All: FC<SVGIconProps> = ({
    color = ['url(#paint0_linear_3992_101675)', '#D4D6D9', '#BCC4CE', '#8892A8'],
    ...props
}) => {
    return (
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g filter="url(#filter0_i_3992_101675)">
                <path
                    d="M13.5898 10.498C14.0988 9.98955 14.9236 9.98955 15.4326 10.498L18.2744 13.3389C18.7833 13.8478 18.7831 14.6735 18.2744 15.1826L15.4326 18.0234C14.9235 18.5325 14.0989 18.5325 13.5898 18.0234L10.748 15.1826C10.2394 14.6735 10.2391 13.8478 10.748 13.3389L13.5898 10.498ZM7.6543 10.7617C8.40361 10.762 9.01172 11.3698 9.01172 12.1191V16.4043C9.01146 17.1535 8.40345 17.7615 7.6543 17.7617H3.36914C2.61978 17.7617 2.01198 17.1536 2.01172 16.4043V12.1191C2.01172 11.3696 2.61962 10.7617 3.36914 10.7617H7.6543ZM7.03809 1.76172C7.72133 1.76172 8.34126 2.03516 8.78906 2.47754C9.23515 2.91858 9.51159 3.52753 9.51172 4.19922C9.51172 4.56562 9.42897 4.915 9.28125 5.22852C9.12858 5.55098 8.90603 5.83626 8.63379 6.06348L6.13672 8.5127C5.96096 8.67851 5.73426 8.76172 5.50781 8.76172C5.28139 8.76167 5.05451 8.67785 4.87988 8.5127L2.33887 6.01855C2.08124 5.79171 1.87156 5.51315 1.72852 5.2002C1.58895 4.89455 1.51074 4.55516 1.51074 4.19922C1.51087 3.52737 1.78776 2.9186 2.23438 2.47754C2.68209 2.03527 3.30071 1.76185 3.9834 1.76172C4.29408 1.76172 4.59236 1.81838 4.86719 1.92188C5.10071 2.00995 5.31729 2.13229 5.51074 2.28223C5.70422 2.1322 5.92167 2.01 6.15527 1.92188C6.43001 1.81839 6.7279 1.76178 7.03809 1.76172ZM16.6543 1.76074C17.4036 1.76101 18.0117 2.36978 18.0117 3.11914V7.4043C18.0115 8.15345 17.4035 8.76146 16.6543 8.76172H12.3691C11.6198 8.76172 11.012 8.15361 11.0117 7.4043V3.11914C11.0117 2.36962 11.6196 1.76074 12.3691 1.76074H16.6543Z"
                    fill={getColor(color, 1, 'url(#paint0_linear_3992_101675)')}
                />
            </g>
            <defs>
                <filter
                    id="filter0_i_3992_101675"
                    x="-0.822591"
                    y="0.594075"
                    width="19.4786"
                    height="17.8112"
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
                    <feOffset dx="-2.33333" dy="-1.16667" />
                    <feGaussianBlur stdDeviation="1.75" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0.960487 0 0 0 0 0.960487 0 0 0 0 0.960487 0 0 0 0.5 0"
                    />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_3992_101675" />
                </filter>
                <linearGradient
                    id="paint0_linear_3992_101675"
                    x1="2.58324"
                    y1="2.51824"
                    x2="14.4145"
                    y2="17.3623"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0.462622" stopColor={getColor(color, 2, '#D4D6D9')} />
                    <stop offset="0.5329" stopColor={getColor(color, 3, '#BCC4CE')} />
                    <stop offset="1" stopColor={getColor(color, 4, '#8892A8')} />
                </linearGradient>
            </defs>
        </svg>
    );
};
