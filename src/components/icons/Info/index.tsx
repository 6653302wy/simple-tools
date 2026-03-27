import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Info: FC<SVGIconProps> = ({ color = ['#165DFF', 'white'], ...props }) => {
    return (
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <g clipPath="url(#clip0_4327_140162)">
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M1.66666 10.0001C1.66666 5.39771 5.39762 1.66675 9.99999 1.66675C14.6024 1.66675 18.3333 5.39771 18.3333 10.0001C18.3333 14.6025 14.6024 18.3334 9.99999 18.3334C5.39762 18.3334 1.66666 14.6025 1.66666 10.0001ZM10.8333 7.50008V5.83341H9.16666V7.50008H10.8333ZM9.16666 8.33341V14.1667H10.8333V8.33341H9.16666Z"
                    fill={getColor(color, 1, '#165DFF')}
                />
            </g>
            <defs>
                <clipPath id="clip0_4327_140162">
                    <rect width="20" height="20" fill={getColor(color, 2, 'white')} />
                </clipPath>
            </defs>
        </svg>
    );
};
