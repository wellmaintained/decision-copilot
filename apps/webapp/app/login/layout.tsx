import { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: 'light',
}

export const metadata: Metadata = {
  title: 'Login - Decision Copilot',
  description: 'Sign in to Decision Copilot',
  openGraph: {
    title: 'Login - Decision Copilot',
    description: 'Sign in to Decision Copilot',
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <link rel="preconnect" href="https://accounts.google.com" />
      <link rel="preconnect" href="https://login.microsoftonline.com" />
      {children}
    </>
  )
} 