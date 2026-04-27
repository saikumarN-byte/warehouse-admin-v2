'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)

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

      <nav
        style={{
          ...navStyle,
          display: open ? 'grid' : 'none',
        }}
      >
        <Link href="/" style={navLink}>Dashboard</Link>
        <Link href="/products" style={navLink}>Products</Link>
        <Link href="/inventory" style={navLink}>Inventory</Link>
        <Link href="/orders" style={navLink}>Orders</Link>
        <Link href="/inbound-pallets" style={navLink}>Inbound</Link>
        <Link href="/reports/trends" style={navLink}>Trends</Link>
        <Link href="/ai-restock" style={navLink}>AI Restock</Link>
      </nav>
    </header>
  )
}

const headerStyle = {
  background: '#0f172a',
  color: '#fff',
  padding: '14px 16px',
  boxSizing: 'border-box' as const,
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
  fontSize: '17px',
}

const menuButtonStyle = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #334155',
  background: '#1e293b',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
}

const navStyle = {
  gridTemplateColumns: '1fr',
  gap: '10px',
  marginTop: '14px',
}

const navLink = {
  color: '#e2e8f0',
  background: '#1e293b',
  padding: '12px',
  borderRadius: '10px',
  textDecoration: 'none',
  fontWeight: 700,
}