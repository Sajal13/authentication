import { PropsWithChildren } from 'react';

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-lime-400 to-cyan-400">
      {children}
    </div>
  );
}
