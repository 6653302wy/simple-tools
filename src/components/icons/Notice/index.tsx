import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const Notice: FC<SVGIconProps> = ({
    color = ['currentColor', 'currentColor', 'currentColor', 'currentColor'],
    ...props
}) => {
    return (
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <path
                d="M13 16C13 17.6569 11.6569 19 10 19C8.34315 19 7 17.6569 7 16"
                stroke={getColor(color, 1, '#3C4851')}
                strokeWidth="1.4"
            />
            <path
                d="M9.5 3.7002H10.5C13.4271 3.7002 15.7998 6.07289 15.7998 9V14.0713C15.7998 14.8908 16.0833 15.6747 16.5859 16.2998H3.37207C3.90016 15.6681 4.20013 14.8649 4.2002 14.0225V9C4.2002 6.07289 6.57289 3.7002 9.5 3.7002Z"
                stroke={getColor(color, 2, '#3C4851')}
                strokeWidth="1.4"
            />
            <path
                d="M9 1.5C9 0.947715 9.44772 0.5 10 0.5C10.5523 0.5 11 0.947715 11 1.5V3C11 3.55228 10.5523 4 10 4C9.44772 4 9 3.55228 9 3V1.5Z"
                fill={getColor(color, 3, '#3C4851')}
            />
            <path
                d="M11 6L11.0485 6.00971C12.474 6.29479 13.5 7.54636 13.5 9"
                stroke={getColor(color, 4, '#3C4851')}
                strokeWidth="1.4"
                strokeLinecap="round"
            />
        </svg>
    );
};
