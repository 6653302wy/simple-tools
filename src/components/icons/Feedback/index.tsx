import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Feedback: FC<SVGIconProps> = ({ color = ['currentColor', 'currentColor', 'currentColor'], ...props }) => {
    return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <path
                d="M17.9998 14.4L19.7998 16.2L15.5998 20.4H13.7998V18.6L17.9998 14.4Z"
                stroke={getColor(color, 1, '#1D2129')}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M14.4004 3.6V8.4H19.2004"
                stroke={getColor(color, 2, '#1D2129')}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M19.1998 11.4V8.89706C19.1998 8.5788 19.0734 8.27357 18.8483 8.04853L14.7513 3.95147C14.5262 3.72643 14.221 3.6 13.9027 3.6H5.9998C5.33706 3.6 4.7998 4.13726 4.7998 4.8V19.2C4.7998 19.8627 5.33706 20.4 5.99981 20.4H10.1998"
                stroke={getColor(color, 3, '#1D2129')}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
