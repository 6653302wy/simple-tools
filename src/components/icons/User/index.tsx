import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const User: FC<SVGIconProps> = ({
    color = ['currentColor', 'currentColor', 'currentColor', 'currentColor'],
    ...props
}) => {
    return (
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <path
                d="M14.0898 1C14.5924 1 15 1.40762 15 1.91016V6C15 8.76142 12.7614 11 10 11C7.23858 11 5 8.76142 5 6C5 3.23858 7.23858 1 10 1H14.0898ZM10 2.40039C8.01178 2.40039 6.40039 4.01178 6.40039 6C6.40039 7.98822 8.01178 9.59961 10 9.59961C11.9882 9.59961 13.5996 7.98822 13.5996 6V2.40039H10Z"
                fill={getColor(color, 1, '#3C4851')}
            />
            <path d="M8 5V6" stroke={getColor(color, 2, '#3C4851')} strokeLinecap="round" />
            <path d="M10 5V6" stroke={getColor(color, 3, '#3C4851')} strokeLinecap="round" />
            <rect
                x="1.7"
                y="12.7"
                width="16.6"
                height="6.6"
                rx="3.3"
                stroke={getColor(color, 4, '#3C4851')}
                strokeWidth="1.4"
            />
        </svg>
    );
};
