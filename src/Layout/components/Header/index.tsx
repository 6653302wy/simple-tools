import Link from 'next/link';
import type { FunctionComponent } from 'react';
import { toolModules } from '@/modules/tool-registry';
import { useI18n } from '@/services/i18n';
import { LANGUAGE_OPTIONS } from '@/services/i18n/constant';
import { Logo } from './components/Logo';

/** 头部 */
export const Header: FunctionComponent = () => {
    const { language, setLanguage, t } = useI18n();

    return (
        <section className="sticky top-0 z-40 border-b border-primary-200 bg-fill-a/95 backdrop-blur">
            <section className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-3 text-text-e">
                    <Logo />
                    <div>
                        <p className="text-body-xs uppercase tracking-[0.22em] text-primary-500">
                            {t('common.appTitle')}
                        </p>
                        <h1 className="text-title-md text-primary-700">{t('common.workspaceTitle')}</h1>
                    </div>
                </Link>

                <div className="hidden items-center gap-3 sm:flex">
                    <div className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-fill-b p-1">
                        {LANGUAGE_OPTIONS.map((option) => {
                            const isActive = option.value === language;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        setLanguage(option.value);
                                    }}
                                    className={
                                        isActive
                                            ? 'rounded-full bg-primary-400 px-3 py-1.5 text-body-sm text-text-a'
                                            : 'rounded-full px-3 py-1.5 text-body-sm text-text-d transition hover:bg-primary-100'
                                    }
                                    aria-label={`${t('common.language')} ${option.label}`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="rounded-full border border-primary-200 bg-primary-100 px-4 py-2 sm:flex sm:items-center sm:gap-3">
                        <span
                            className="text-title-sm text-primary-700"
                            style={{ fontFamily: 'var(--font-rajdhani)' }}
                        >{`${toolModules.length}`}</span>
                        <span className="text-body-pc-md text-text-d">
                            {t('common.modulesCount', { count: toolModules.length })}
                        </span>
                    </div>
                </div>
            </section>
        </section>
    );
};
