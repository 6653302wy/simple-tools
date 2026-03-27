import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Setting: FC<SVGIconProps> = ({ color = ['currentColor', 'currentColor'], ...props }) => {
    return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <path
                d="M17.1242 3.12436L22.2485 12L17.1242 20.8756L6.87547 20.8756L1.75111 12L6.87547 3.12436L17.1242 3.12436Z"
                stroke={getColor(color, 1, 'white')}
                strokeWidth="1.76296"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle
                cx="12.0001"
                cy="12.0002"
                r="3.66025"
                stroke={getColor(color, 2, 'white')}
                strokeWidth="1.76296"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};
