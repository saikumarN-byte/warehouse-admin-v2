import Link from 'next/link'
import { supabase } from '../../lib/supabase'
export const dynamic = 'force-dynamic'

export default async function AIRestockPage() {
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      quantity,
      products (product_name),
      orders (
        stores (store_name)
      )
    `)

  const summary: any = {}

  data?.forEach((row: any) => {
    const product = row.products?.product_name ?? 'Unknown Product'
    const store = row.orders?.stores?.store_name ?? 'Unknown Store'
    const qty = Number(row.quantity) || 0

    if (!summary[product]) {
      summary[product] = {}
    }

    if (!summary[product][store]) {
      summary[product][store] = 0
    }

    summary[product][store] += qty
  })

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
      <Link href="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>
        ← Back to Dashboard
      </Link>

      <h1 style={{ fontSize: '32px', marginTop: '24px', marginBottom: '8px' }}>
        AI Restock Suggestions
      </h1>

      <p style={{ color: '#475569', marginBottom: '24px' }}>
        Demand-based restock suggestions using store ordering behaviour
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
        <div style={statCardStyle}>
          <div style={labelStyle}>Products Analysed</div>
          <div style={valueStyle}>{Object.keys(summary).length}</div>
        </div>

        <div style={statCardStyle}>
          <div style={labelStyle}>Planning Window</div>
          <div style={{ ...valueStyle, fontSize: '22px' }}>10 Weeks</div>
        </div>

        <div style={statCardStyle}>
          <div style={labelStyle}>Recommendation Type</div>
          <div style={{ ...valueStyle, fontSize: '22px' }}>Demand Trend</div>
        </div>
      </div>

      <div>
        {Object.keys(summary).length > 0 ? (
          Object.entries(summary).map(([product, stores]: any) => {
            const totalQty = Object.values(stores).reduce(
              (sum: number, qty: any) => sum + Number(qty),
              0
            )

            return (
              <div key={product} style={cardStyle}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                    marginBottom: '12px',
                  }}
                >
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>
                      {product}
                    </h2>
                    <p style={{ margin: '6px 0 0', color: '#64748b' }}>
                      Total ordered: <strong>{totalQty}</strong> units
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '999px',
                      background: totalQty >= 15 ? '#fee2e2' : '#e0f2fe',
                      color: totalQty >= 15 ? '#b91c1c' : '#0369a1',
                      fontWeight: 700,
                      height: 'fit-content',
                    }}
                  >
                    {totalQty >= 15 ? 'High Priority' : 'Monitor'}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  {Object.entries(stores).map(([store, qty]: any) => (
                    <div
                      key={store}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>{store}</span>
                      <span>: {qty} units ordered → </span>
                      <span style={{ color: '#c2410c', fontWeight: 700 }}>
                        Increase stock
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <div style={cardStyle}>
            No order trend data available yet.
          </div>
        )}
      </div>
    </main>
  )
}

const statCardStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  padding: '18px',
  boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
}

const cardStyle = {
  background: '#ffffff',
  padding: '18px',
  marginBottom: '16px',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
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