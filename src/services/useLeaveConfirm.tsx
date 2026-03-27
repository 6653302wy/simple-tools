'use client';

import {
    createContext,
    type FC,
    type PropsWithChildren,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useI18n } from '@/services/i18n';

type LeaveConfirmState = {
    active: boolean;
    title: string;
    description: string;
};

type LeaveConfirmContextValue = {
    guard: LeaveConfirmState;
    setGuard: (nextGuard: LeaveConfirmState) => void;
    confirmLeave: (action: () => void) => void;
};

const defaultGuard: LeaveConfirmState = {
    active: false,
    title: '有未保存内容',
    description: '当前输入内容还未处理完成，离开后将保留在本次页面状态之外。确定继续离开吗？',
};

const LeaveConfirmContext = createContext<LeaveConfirmContextValue>({
    guard: defaultGuard,
    setGuard: () => {},
    confirmLeave: (action) => action(),
});

/** 离开确认 provider */
export const LeaveConfirmProvider: FC<PropsWithChildren> = ({ children }) => {
    const { t } = useI18n();
    const [guard, setGuard] = useState<LeaveConfirmState>(defaultGuard);
    const [dialogOpen, setDialogOpen] = useState(false);
    const pendingActionRef = useRef<(() => void) | null>(null);

    const handleCancel = useCallback(() => {
        setDialogOpen(false);
        pendingActionRef.current = null;
    }, []);

    const handleConfirm = useCallback(() => {
        setDialogOpen(false);
        const nextAction = pendingActionRef.current;
        pendingActionRef.current = null;
        nextAction?.();
    }, []);

    const confirmLeave = useCallback(
        (action: () => void) => {
            if (!guard.active) {
                action();
                return;
            }

            pendingActionRef.current = action;
            setDialogOpen(true);
        },
        [guard.active],
    );

    const value = useMemo(
        () => ({
            guard,
            setGuard,
            confirmLeave,
        }),
        [guard, confirmLeave],
    );

    const resolvedGuard = guard.active
        ? guard
        : {
              active: false,
              title: t('confirmDialog.defaultTitle'),
              description: t('confirmDialog.defaultDescription'),
          };

    return (
        <LeaveConfirmContext value={value}>
            {children}
            <ConfirmDialog
                open={dialogOpen}
                title={resolvedGuard.title}
                description={resolvedGuard.description}
                onCancel={handleCancel}
                onConfirm={handleConfirm}
            />
        </LeaveConfirmContext>
    );
};

/** 离开确认 hook */
export function useLeaveConfirm() {
    return useContext(LeaveConfirmContext);
}
