'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadRole() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user) {
        setRole(null)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      setRole(profile?.role ?? 'picker')
    }

    loadRole()
  }, [])

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header style={headerStyle}>
      <div style={topRowStyle}>
        <Link href="/" style={brandStyle}>
          Sydney Warehouse Admin
        </Link>

        <button onClick={() => setOpen(!open)} style={menuButtonStyle}>
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open && (
        <nav style={navStyle}>
          <Link href="/" style={navLink}>Dashboard</Link>
          <Link href="/inventory" style={navLink}>Inventory</Link>
          <Link href="/orders" style={navLink}>Orders</Link>

          {role === 'admin' && (
            <>
              <Link href="/products" style={navLink}>Products</Link>
              <Link href="/inbound-pallets" style={navLink}>Inbound Pallets</Link>
              <Link href="/reports/trends" style={navLink}>Trends</Link>
              <Link href="/ai-restock" style={navLink}>AI Restock</Link>
            </>
          )}

          <button onClick={logout} style={logoutButton}>
            Logout
          </button>
        </nav>
      )}
    </header>
  )
}

const headerStyle = {
  background: '#0f172a',
  padding: '14px 16px',
}

const topRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
}

const brandStyle = {
  color: '#fff',
  textDecoration: 'none',
  fontWeight: 800,
  fontSize: '18px',
  lineHeight: 1.2,
}

const menuButtonStyle = {
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  padding: '10px 14px',
  fontWeight: 800,
  fontSize: '15px',
}

const navStyle = {
  display: 'grid',
  gap: '10px',
  marginTop: '14px',
}

const navLink = {
  color: '#fff',
  background: '#1e293b',
  padding: '13px',
  borderRadius: '10px',
  textDecoration: 'none',
  fontWeight: 700,
}

const logoutButton = {
  color: '#fff',
  background: '#dc2626',
  padding: '13px',
  borderRadius: '10px',
  border: 'none',
  fontWeight: 800,
  fontSize: '15px',
}