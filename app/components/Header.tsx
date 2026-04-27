'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header
      style={{
        width: '100%',
        padding: '14px 24px',
        background: '#0f172a',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '18px' }}>
        Sydney Warehouse Admin
      </div>

      <nav style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <Link href="/" style={navLink}>Dashboard</Link>
        <Link href="/products" style={navLink}>Products</Link>
        <Link href="/inventory" style={navLink}>Inventory</Link>
        <Link href="/orders" style={navLink}>Orders</Link>
        <Link href="/inbound-pallets" style={navLink}>Inbound</Link>
        <Link href="/reports/trends" style={navLink}>Trends</Link>
        <Link href="/ai-restock" style={navLink}>AI Restock</Link>
      </nav>

      <button
        onClick={() => alert('Logout coming soon')}
        style={{
          background: '#dc2626',
          color: '#fff',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        Logout
      </button>
    </header>
  )
}

const navLink = {
  color: '#e2e8f0',
  textDecoration: 'none',
  fontWeight: 500,
}