import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Logout: FC<SVGIconProps> = ({ color = ['currentColor', 'currentColor', 'currentColor'], ...props }) => {
    return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <path
                d="M16.3081 8.53873L20.0003 12.2309L16.3081 15.9231"
                stroke={getColor(color, 1, '#1D2129')}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12 12.2305H19.3844"
                stroke={getColor(color, 2, '#1D2129')}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12.3844 4.8457H6.23073C5.55101 4.8457 5 5.39672 5 6.07643V18.3837C5 19.0634 5.55101 19.6144 6.23073 19.6144H12.3844"
                stroke={getColor(color, 3, '#1D2129')}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
