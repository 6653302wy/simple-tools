export function ToolRouteFallback() {
    return (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="rounded-3xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]">
                <div className="h-7 w-40 rounded-full bg-fill-b" />
                <div className="mt-3 h-4 w-72 max-w-full rounded-full bg-fill-b" />
                <div className="mt-6 h-12 rounded-2xl bg-fill-b" />
                <div className="mt-4 h-48 rounded-[1.5rem] bg-fill-b" />
            </div>

            <div className="rounded-3xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]">
                <div className="h-7 w-36 rounded-full bg-fill-b" />
                <div className="mt-3 h-4 w-60 max-w-full rounded-full bg-fill-b" />
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="h-20 rounded-[1.25rem] bg-fill-b" />
                    <div className="h-20 rounded-[1.25rem] bg-fill-b" />
                    <div className="h-20 rounded-[1.25rem] bg-fill-b" />
                </div>
                <div className="mt-4 h-[24rem] rounded-[1.5rem] bg-fill-b" />
            </div>
        </section>
    );
}
