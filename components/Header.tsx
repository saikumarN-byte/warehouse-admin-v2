'use client'

import Link from 'next/link'

export default function Header() {
  return (
    <header style={{
      width: '100%',
      padding: '14px 24px',
      background: '#0f172a',
      color: '#fff',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ fontWeight: 700 }}>
        Sydney Warehouse Admin
      </div>

      <nav style={{ display: 'flex', gap: '12px' }}>
        <Link href="/" style={nav}>Dashboard</Link>
        <Link href="/inventory" style={nav}>Inventory</Link>
        <Link href="/orders" style={nav}>Orders</Link>
        <Link href="/products" style={nav}>Products</Link>
      </nav>

      <button style={{
        background: 'red',
        color: '#fff',
        border: 'none',
        padding: '6px 10px',
        borderRadius: '5px'
      }}>
        Logout
      </button>
    </header>
  )
}

const nav = {
  color: '#fff',
  textDecoration: 'none'
}