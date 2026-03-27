import Image from 'next/image';
import type { FunctionComponent } from 'react';
import imageLogo from '@/assets/images/logo.png';

/** Logo */
export const Logo: FunctionComponent = () => {
    return <Image src={imageLogo} alt="logo" height={28} className="w-auto" loading="eager" priority />;
};
