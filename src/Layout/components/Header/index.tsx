import Link from 'next/link';
import type { FunctionComponent } from 'react';
import { toolModules } from '@/modules/tool-registry';
import { Logo } from './components/Logo';

/** 头部 */
export const Header: FunctionComponent = () => {
    return (
        <section className="sticky top-0 z-40 border-b border-primary-200 bg-fill-a/95 backdrop-blur">
            <section className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-3 text-text-e">
                    <Logo />
                    <div>
                        <p className="text-body-xs uppercase tracking-[0.22em] text-primary-500">{`Simple Tools`}</p>
                        <h1 className="text-title-md text-primary-700">轻量工具工作台</h1>
                    </div>
                </Link>

                <div className="hidden rounded-full border border-primary-200 bg-primary-100 px-4 py-2 sm:flex sm:items-center sm:gap-3">
                    <span
                        className="text-title-sm text-primary-700"
                        style={{ fontFamily: 'var(--font-rajdhani)' }}
                    >{`${toolModules.length}`}</span>
                    <span className="text-body-pc-md text-text-d">个常用模块已接入</span>
                </div>
            </section>
        </section>
    );
};
