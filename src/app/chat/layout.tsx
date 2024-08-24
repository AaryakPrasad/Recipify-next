import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import '@/public/styles/globals.css'
import { AuthProvider } from '../../contexts/AuthContext';
import { AuthWrapper } from '@/components/AuthWrapper';

const nunito = Nunito({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Recipify',
  description: 'Your mindful AI companion for recipe ideas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={nunito.className}>
        <AuthProvider>
          <AuthWrapper>{children}</AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  )
}