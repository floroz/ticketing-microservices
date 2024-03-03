"use client";

import { Inter } from 'next/font/google'
import './globals.css'
import { UserProvider } from '@/context/user'
import { memo } from 'react'

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
          <MemoChildren>{children}</MemoChildren>
        </UserProvider>
      </body>
    </html>
  )
}
