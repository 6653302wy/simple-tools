import { redirect } from 'next/navigation';
import { defaultToolHref } from '@/modules/tool-registry';

export default function ModulesPage() {
    redirect(defaultToolHref);
}
