import type { Metadata } from 'next';
import '@/assets/css/globals.css';
import '@/assets/css/tailwind.css';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import timezonePlugin from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import localFont from 'next/font/local';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Layout } from '@/Layout';
import { DomIdEnum, StorageEnum } from '@/services/types';

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezonePlugin);

// 全局字体
const roboto = localFont({
    src: '../assets/fonts/Roboto-VariableFont.ttf',
    variable: '--font-roboto',
    weight: '400 500 600 700',
});

const inter = localFont({
    src: '../assets/fonts/Inter-Medium-8.otf',
    variable: '--font-inter',
    weight: '500',
});

const rajdhani = localFont({
    src: '../assets/fonts/Rajdhani-SemiBold.ttf',
    variable: '--font-rajdhani',
    weight: '600',
});

export const metadata: Metadata = {
    title: 'SIMPLE TOOLS',
    description: '简易工具合集',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const lang = 'en';
    const locale = 'en';
    const serverTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    return (
        <html
            lang={lang}
            suppressHydrationWarning
            className={`${roboto.variable} ${inter.variable} ${rajdhani.variable}`}
            style={{ fontSize: '16px' }}
            data-server-language={lang}
            data-server-locale={locale}
            data-server-timezone={serverTimezone}
        >
            <head>
                <script
                    // 刷新页面时无感知设置主题模式
                    dangerouslySetInnerHTML={{
                        __html: `
(function() {
    const storageKey = '${StorageEnum.Theme}';
    const doc = document.documentElement;
    const apply = (mode) => {
        const theme = mode === 'dark' ? 'dark' : 'light';
        const isDark = theme === 'dark';
        // doc.classList.toggle('dark', isDark);
        // doc.dataset.theme = theme;
        // doc.style.setProperty('color-scheme', theme);
    };

    try {
        const stored = localStorage.getItem(storageKey);
        if (stored === 'dark' || stored === 'light') {
            apply(stored);
            return;
        }
    } catch (error) {
        // Ignore access issues (e.g. private mode)
    }

    const media = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    const prefersDark = media ? media.matches : false;
    apply(prefersDark ? 'dark' : 'light');
})();
                        `.trim(),
                    }}
                />
            </head>
            <body suppressHydrationWarning>
                {/** 业务路由容器 */}
                <section className="relative z-10 min-h-screen" id={DomIdEnum.AppContainer}>
                    <ThemeProvider>
                        <Layout>{children}</Layout>
                    </ThemeProvider>
                </section>
            </body>
        </html>
    );
}
