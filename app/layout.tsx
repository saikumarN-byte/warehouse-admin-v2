import './globals.css'
import Header from '../components/Header'
import { createClient } from '../lib/supabaseServer'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Sydney Warehouse Admin',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
  redirect('/login')
}

  // ✅ Allow login page without auth
  const isLoginPage =
    typeof window === 'undefined' &&
    (globalThis as any).location?.pathname === '/login'

  if (!user && !isLoginPage) {
    redirect('/login')
  }

  return (
    <html lang="en">
      <body>
        {/* Hide header on login page */}
        {user && <Header />}
        {children}
      </body>
    </html>
  )
}