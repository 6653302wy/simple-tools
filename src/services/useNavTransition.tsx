'use client';

import { createContext, type FC, type ReactNode, type TransitionStartFunction, useContext, useTransition } from 'react';

interface TransitionProps {
    /** 是否正在(跳转路由) */
    isPending: boolean;
    /** 开始（跳转路由）过渡 */
    startTransition: TransitionStartFunction;
}

const TransitionContext = createContext<TransitionProps>({
    isPending: false,
    startTransition: () => {},
});

/** 全局TransitionProvider */
export const TransitionProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [isPending, startTransition] = useTransition();

    return <TransitionContext value={{ isPending, startTransition }}>{children}</TransitionContext>;
};

/** 获取全局TransitionContext */
export const useNavTransition = () => {
    return useContext(TransitionContext);
};
