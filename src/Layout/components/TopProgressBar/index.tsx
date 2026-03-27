'use client';

import { type FC, useEffect, useRef, useState } from 'react';
import { useNavTransition } from '@/services/useNavTransition';

/** 延迟显示时间（毫秒），如果 loading 时长小于此值则不显示进度条 */
const LOADING_DELAY = 500;

/** 全局顶部进度条 用于切换路由时用 */
export const TopProgressBar: FC = () => {
    const { isPending } = useNavTransition();
    const [progress, setProgress] = useState(0);
    const [shouldShow, setShouldShow] = useState(false);
    const timerRef = useRef<number | null>(null);
    const delayTimerRef = useRef<number | null>(null);
    const isStartedRef = useRef(false);

    useEffect(() => {
        if (isPending) {
            // 路由开始跳转，启动延迟定时器
            delayTimerRef.current = window.setTimeout(() => {
                // 延迟时间后如果还在 pending，才显示进度条
                setShouldShow(true);

                // 设置随机初始进度（0-50%）
                const initialProgress = Math.random() * 50;
                setProgress(initialProgress);
                isStartedRef.current = true;

                // 模拟进度增长，增长到 90%
                timerRef.current = window.setInterval(() => {
                    setProgress((prev) => {
                        if (prev >= 90) return prev;
                        return prev + Math.random() * 10;
                    });
                }, 200);
            }, LOADING_DELAY);
        } else {
            // 路由跳转完成

            // 清除延迟定时器
            if (delayTimerRef.current) {
                clearTimeout(delayTimerRef.current);
                delayTimerRef.current = null;
            }

            // 如果进度条还没开始显示，直接重置
            if (!isStartedRef.current) {
                setShouldShow(false);
                return;
            }

            // 清除进度增长定时器
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }

            // 快速完成到 100%
            setProgress(100);

            // 完成后淡出
            const timeout = window.setTimeout(() => {
                setProgress(0);
                setShouldShow(false);
                isStartedRef.current = false; // 重置标记
            }, 300);

            return () => clearTimeout(timeout);
        }

        return () => {
            if (delayTimerRef.current) {
                clearTimeout(delayTimerRef.current);
                delayTimerRef.current = null;
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isPending]);

    if (!shouldShow || progress === 0) return null;

    return (
        <div className="pointer-events-none fixed top-14 z-50 h-1.5 w-full bg-fill-c/70">
            <div
                style={{
                    width: `${progress}%`,
                    transition: 'width 0.2s ease-out',
                }}
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--auxiliary-green)_0%,var(--primary-400)_100%)]"
            />
        </div>
    );
};
