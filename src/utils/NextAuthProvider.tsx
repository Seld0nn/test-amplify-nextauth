'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

interface PropType {
  children: ReactNode;
}

const NextAuthProvider: React.FC<PropType> = ({ children }: PropType) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default NextAuthProvider;