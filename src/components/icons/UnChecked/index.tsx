import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const UnChecked: FC<SVGIconProps> = ({ color = ['currentColor'], ...props }) => {
    return (
        <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <path
                d="M4 0.5H8C9.933 0.5 11.5 2.067 11.5 4V8C11.5 9.933 9.933 11.5 8 11.5H4C2.067 11.5 0.5 9.933 0.5 8V4C0.5 2.067 2.067 0.5 4 0.5Z"
                stroke={getColor(color, 1, '#2E2E2E')}
            />
        </svg>
    );
};
