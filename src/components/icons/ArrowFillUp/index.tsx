import type { FC } from 'react';
import { getColor } from '../utils/helper';
import type { SVGIconProps } from '../utils/types';

export const ArrowFillUp: FC<SVGIconProps> = ({ color = ['currentColor'], ...props }) => {
    return (
        <svg viewBox="0 0 12 6" fill="none" xmlns="http://www.w3.org/2000/svg" width="1em" {...props}>
            <path
                d="M0 5.37868H12L7.06066 0.439342C6.47487 -0.146445 5.52513 -0.146445 4.93934 0.439341L0 5.37868Z"
                fill={getColor(color, 1, 'white')}
            />
        </svg>
    );
};
