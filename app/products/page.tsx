import Link from 'next/link'
import { supabase } from '../../lib/supabase'
export const dynamic = 'force-dynamic'

export default async function ProductsPage() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('product_name')

  return (
    <main
      style={{
        padding: '32px',
        background: '#f8fafc',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        color: '#0f172a',
      }}
    >
      <Link href="/" style={{ color: '#2563eb' }}>
        ← Back to Dashboard
      </Link>

      {/* Title */}
      <h1
        style={{
          fontSize: '32px',
          marginTop: '20px',
          marginBottom: '8px',
          fontWeight: 'bold',
          color: '#0f172a',
        }}
      >
        Products
      </h1>

      {/* ✅ QR BUTTON */}
      <div style={{ marginTop: '10px', marginBottom: '16px' }}>
        <a
          href="/products/qr-labels"
          style={{
            padding: '10px 16px',
            background: '#16a34a',
            color: '#fff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            display: 'inline-block',
          }}
        >
          Generate QR Labels
        </a>
      </div>

      {/* Subtitle */}
      <p
        style={{
          color: '#475569',
          marginBottom: '24px',
          fontSize: '15px',
        }}
      >
        Manage your product catalog
      </p>

      {error && <p style={{ color: 'red' }}>{error.message}</p>}

      {/* Table */}
      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#fff',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            background: '#f1f5f9',
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          <div style={th}>Product</div>
          <div style={th}>SKU</div>
          <div style={th}>Category</div>
          <div style={th}>Unit</div>
        </div>

        {/* Rows */}
        {products && products.length > 0 ? (
          products.map((p: any) => (
            <div
              key={p.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <div style={td}>{p.product_name}</div>
              <div style={td}>{p.sku}</div>
              <div style={td}>{p.category}</div>
              <div style={td}>{p.unit}</div>
            </div>
          ))
        ) : (
          <div style={{ padding: '16px', color: '#64748b' }}>
            No products found.
          </div>
        )}
      </div>
    </main>
  )
}

const th = {
  padding: '14px 12px',
}

const td = {
  padding: '14px 12px',
}