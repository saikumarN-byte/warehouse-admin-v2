import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

export default async function TrendsPage() {
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      quantity,
      products (
        product_name,
        sku
      ),
      orders (
        stores (
          store_name
        )
      )
    `)

  const productTotals: any = {}
  const storeTotals: any = {}
  const matrix: any = {}

  data?.forEach((row: any) => {
    const product = row.products?.product_name ?? 'Unknown Product'
    const sku = row.products?.sku ?? '-'
    const store = row.orders?.stores?.store_name ?? 'Unknown Store'
    const qty = Number(row.quantity) || 0

    if (!productTotals[product]) {
      productTotals[product] = { product, sku, total: 0 }
    }

    productTotals[product].total += qty

    if (!storeTotals[store]) {
      storeTotals[store] = { store, total: 0 }
    }

    storeTotals[store].total += qty

    const key = `${store}-${product}`

    if (!matrix[key]) {
      matrix[key] = { store, product, sku, total: 0 }
    }

    matrix[key].total += qty
  })

  const topProducts = Object.values(productTotals).sort(
    (a: any, b: any) => b.total - a.total
  )

  const topStores = Object.values(storeTotals).sort(
    (a: any, b: any) => b.total - a.total
  )

  const storeProductRows = Object.values(matrix).sort(
    (a: any, b: any) => b.total - a.total
  )

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
      <Link href="/" style={backLinkStyle}>
        ← Back to Dashboard
      </Link>

      <h1 style={{ fontSize: '32px', marginTop: '24px', marginBottom: '8px' }}>
        Product / Store Trends
      </h1>

      <p style={{ color: '#475569', marginBottom: '24px' }}>
        Analyse which products are ordered more and which stores create the most demand
      </p>

      {error && <p style={{ color: 'red' }}>{error.message}</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={cardStyle}>
          <div style={labelStyle}>Products Analysed</div>
          <div style={valueStyle}>{topProducts.length}</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Stores Analysed</div>
          <div style={valueStyle}>{topStores.length}</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Top Product</div>
          <div style={{ ...valueStyle, fontSize: '20px' }}>
            {(topProducts[0] as any)?.product ?? '-'}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Top Store</div>
          <div style={{ ...valueStyle, fontSize: '20px' }}>
            {(topStores[0] as any)?.store ?? '-'}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <section style={panelStyle}>
          <h2 style={sectionTitleStyle}>Top Ordered Products</h2>

          {topProducts.length > 0 ? (
            topProducts.map((item: any) => (
              <div key={item.product} style={rankRowStyle}>
                <div>
                  <strong>{item.product}</strong>
                  <div style={{ color: '#64748b', fontSize: '13px' }}>
                    SKU: {item.sku}
                  </div>
                </div>
                <strong>{item.total} units</strong>
              </div>
            ))
          ) : (
            <p style={{ color: '#64748b' }}>No product trend data available.</p>
          )}
        </section>

        <section style={panelStyle}>
          <h2 style={sectionTitleStyle}>Top Ordering Stores</h2>

          {topStores.length > 0 ? (
            topStores.map((item: any) => (
              <div key={item.store} style={rankRowStyle}>
                <strong>{item.store}</strong>
                <strong>{item.total} units</strong>
              </div>
            ))
          ) : (
            <p style={{ color: '#64748b' }}>No store trend data available.</p>
          )}
        </section>
      </div>

      <section style={panelStyle}>
        <h2 style={sectionTitleStyle}>Store-wise Product Demand</h2>

        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1fr 1fr',
              background: '#f1f5f9',
              fontWeight: 700,
              color: '#0f172a',
            }}
          >
            <div style={th}>Store</div>
            <div style={th}>Product</div>
            <div style={th}>SKU</div>
            <div style={th}>Qty Ordered</div>
          </div>

          {storeProductRows.length > 0 ? (
            storeProductRows.map((row: any) => (
              <div
                key={`${row.store}-${row.product}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1fr 1fr',
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                <div style={td}>{row.store}</div>
                <div style={td}>{row.product}</div>
                <div style={td}>{row.sku}</div>
                <div style={td}>{row.total}</div>
              </div>
            ))
          ) : (
            <div style={{ padding: '16px', color: '#64748b' }}>
              No store-wise product demand available.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

const backLinkStyle = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: 600,
}

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  padding: '18px',
  boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
}

const panelStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  padding: '18px',
  boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
}

const labelStyle = {
  color: '#64748b',
  fontSize: '13px',
  marginBottom: '8px',
}

const valueStyle = {
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#0f172a',
}

const sectionTitleStyle = {
  marginTop: 0,
  marginBottom: '14px',
  fontSize: '20px',
  color: '#0f172a',
}

const rankRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px',
  borderRadius: '10px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  marginBottom: '10px',
}

const th = {
  padding: '14px 12px',
  textAlign: 'left' as const,
}

const td = {
  padding: '14px 12px',
}