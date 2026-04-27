'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { QRCodeCanvas } from 'qrcode.react'
import { supabase } from '../../../lib/supabase'

export default function QRLabelsPage() {
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('id, product_name, sku, qr_code_value')
      .order('product_name')

    setProducts(data || [])
  }

  return (
    <main style={{
      padding: '32px',
      background: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'Arial',
      color: '#0f172a'
    }}>
      <Link href="/products" style={{ color: '#2563eb' }}>
        ← Back to Products
      </Link>

      <h1 style={{ fontSize: '32px', marginTop: '20px' }}>
        Product QR Labels
      </h1>

      <p style={{ color: '#475569', marginBottom: '20px' }}>
        Print these QR codes and attach to products for scanning
      </p>

      <button
        onClick={() => window.print()}
        style={{
          padding: '10px 16px',
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          marginBottom: '20px',
          cursor: 'pointer'
        }}
      >
        Print Labels
      </button>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '16px'
      }}>
        {products.map((p) => (
          <div key={p.id} style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <QRCodeCanvas value={p.qr_code_value || p.sku} size={120} />

            <h3 style={{ fontSize: '14px', marginTop: '10px' }}>
              {p.product_name}
            </h3>

            <p style={{ color: '#64748b', fontSize: '12px' }}>
              {p.sku}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}