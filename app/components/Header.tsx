'use client'

import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();

  return (
    <header className="border-b border-black/[.1] dark:border-white/[.1] px-6 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-8 h-8 relative">
            <Image
              src="/github-mark.svg"
              alt="Review Bot Logo"
              fill
              className="dark:invert"
            />
          </div>
          <span className="font-semibold text-lg">Review Bot</span>
        </div>
        
        <div className="flex items-center gap-4">
          {status === 'loading' ? (
            <div className="h-10 w-32 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg" />
          ) : session ? (
            <>
              <button
                onClick={() => router.push('/')}
                className="text-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Dashboard
              </button>
              <div className="flex items-center gap-2">
                <Image
                  src={session.user?.image ?? '/github-mark.svg'}
                  alt={session.user?.name ?? 'User'}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span>{session.user?.name}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="text-sm px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('github')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#24292F] dark:bg-white text-white dark:text-[#24292F] hover:opacity-90 transition-opacity"
            >
              <Image
                src="/github-mark-white.svg"
                alt="GitHub"
                width={20}
                height={20}
                className="dark:invert"
              />
              <span>Connect GitHub</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
} 