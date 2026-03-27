import type { FC } from 'react';
import type { SVGIconProps } from '@/components/icons/utils/types';
import { cn } from '@/libs/utils';

export type LoadingVariant = 'primary' | 'secondary';

const gradientLiner = (variant: LoadingVariant | undefined): [string, string] => {
    switch (variant) {
        case 'primary':
            return ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)'];
        case 'secondary':
            return ['rgba(134, 144, 156, 1)', 'rgba(134, 144, 156, 0)'];
        default:
            return ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)'];
    }
};

interface LoadingIconProps extends SVGIconProps {
    /** 图标颜色 使用颜色对应variant */
    variant?: LoadingVariant;
    /** 渐变开始与结束颜色 */
    gradientColors?: [string, string];
}

/**
 * 加载图标 此组件直接写svg，因需要使用渐变色，所有不使用icon:build命令生成
 * @param variant - 图标颜色 使用颜色对应variant
 * @param gradientColors - 渐变开始与结束颜色
 * @returns
 */
export const Loading: FC<LoadingIconProps> = ({ color = ['currentColor'], gradientColors, variant, ...props }) => {
    const [gradientStart, gradientEnd] = gradientColors ?? gradientLiner(variant);

    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            {...props}
            className={cn('animate-spin', props.className)}
        >
            <g data-figma-skip-parse="true" clipPath="url(#paint0_angular_428_17721_clip_path)">
                <g transform="matrix(0.01 0 0 0.01 10 10)">
                    <foreignObject x="-1100" y="-1100" width="2200" height="2200">
                        <div
                            style={{
                                background: `conic-gradient(from 90deg,${gradientStart} 0deg,${gradientEnd} 360deg)`,
                                height: '100%',
                                width: '100%',
                                opacity: 1,
                            }}
                        />
                    </foreignObject>
                </g>
            </g>
            <path
                data-figma-gradient-fill='{"type":"GRADIENT_ANGULAR","stops":[{"color":{"r":1.0,"g":1.0,"b":1.0,"a":0.0},"position":0.0},{"color":{"r":0.54509806632995605,"g":0.54509806632995605,"b":0.54509806632995605,"a":1.0},"position":1.0}],"stopsVar":[{"color":{"r":1.0,"g":1.0,"b":1.0,"a":0.0},"position":0.0},{"color":{"r":0.54509806632995605,"g":0.54509806632995605,"b":0.54509806632995605,"a":1.0},"position":1.0}],"transform":{"m00":20.0,"m01":1.3445140996642263e-13,"m02":-1.3322676295501878e-13,"m10":8.3152302860108052e-14,"m11":20.0,"m12":-8.6597395920762210e-14},"opacity":1.0,"blendMode":"NORMAL","visible":true}'
                d="M20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10ZM3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10Z"
            />
            <path
                d="M20 10C20 10.3978 19.842 10.7794 19.5607 11.0607C19.2794 11.342 18.8978 11.5 18.5 11.5C18.1022 11.5 17.7206 11.342 17.4393 11.0607C17.158 10.7794 17 10.3978 17 10L18.5 10H20Z"
                // fill={getColor(color, 1, '#8B8B8B')}
            />
            <defs>
                <clipPath id="paint0_angular_428_17721_clip_path">
                    <path d="M20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10ZM3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10Z" />
                </clipPath>
            </defs>
        </svg>
    );
};
