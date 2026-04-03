import { TimestampConverter } from '@/modules/timestamp';

export default function TimestampPage() {
    const initialNow = Date.now();
    const initialTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    return <TimestampConverter initialNow={initialNow} initialTimezone={initialTimezone} />;
}
