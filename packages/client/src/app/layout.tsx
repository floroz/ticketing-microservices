"use client";

import { Inter } from 'next/font/google'
import './globals.css'
import { UserProvider } from '@/context/user'
import { memo } from 'react'
import Header from '@/components/header/header';

const inter = Inter({ subsets: ['latin'] })

const MemoChildren = memo(function Children({ children }: { children: React.ReactNode }) {
  return <>{children}</>
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          <Header />
          <MemoChildren>{children}</MemoChildren>
        </UserProvider>
      </body>
    </html>
  )
}
