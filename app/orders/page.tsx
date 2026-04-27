import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_date,
      delivery_date,
      status,
      stores (store_name),
      warehouses (name)
    `)
    .order('order_date', { ascending: false })

  return (
    <main style={pageStyle}>
      <Link href="/" style={backLink}>← Back to Dashboard</Link>

      <h1 style={titleStyle}>Orders</h1>

      {error && <p style={{ color: 'red' }}>{error.message}</p>}

      <div style={cardsWrapper}>
        {orders && orders.length > 0 ? (
          orders.map((order: any) => (
            <div key={order.id} style={cardStyle}>
              <div style={topLineStyle}>
                <div>
                  <div style={smallLabel}>Store</div>
                  <h2 style={storeTitle}>{order.stores?.store_name ?? '-'}</h2>
                </div>

                <span style={statusBadge}>{order.status}</span>
              </div>

              <div style={infoGrid}>
                <div style={infoBox}>
                  <span style={smallLabel}>Warehouse</span>
                  <strong>{order.warehouses?.name ?? '-'}</strong>
                </div>

                <div style={infoBox}>
                  <span style={smallLabel}>Order Date</span>
                  <strong>{order.order_date}</strong>
                </div>

                <div style={infoBox}>
                  <span style={smallLabel}>Delivery Date</span>
                  <strong>{order.delivery_date}</strong>
                </div>

                <div style={infoBox}>
                  <span style={smallLabel}>Order #</span>
                  <strong>{order.id}</strong>
                </div>
              </div>

              <Link href={`/orders/${order.id}`} style={buttonStyle}>
                View / Pick Order
              </Link>
            </div>
          ))
        ) : (
          <div style={cardStyle}>No orders found.</div>
        )}
      </div>
    </main>
  )
}

const pageStyle = {
  padding: '20px',
  background: '#f8fafc',
  minHeight: '100vh',
  fontFamily: 'Arial, sans-serif',
  color: '#0f172a',
  maxWidth: '900px',
  margin: '0 auto',
}

const backLink = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: 700,
}

const titleStyle = {
  fontSize: '40px',
  marginTop: '28px',
  marginBottom: '20px',
}

const cardsWrapper = {
  display: 'grid',
  gap: '16px',
}

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '18px',
  padding: '18px',
  boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
  width: '100%',
  boxSizing: 'border-box' as const,
}

const topLineStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
  marginBottom: '14px',
}

const smallLabel = {
  display: 'block',
  color: '#64748b',
  fontSize: '13px',
  fontWeight: 700,
  marginBottom: '4px',
}

const storeTitle = {
  margin: 0,
  fontSize: '22px',
  lineHeight: 1.25,
}

const statusBadge = {
  background: '#fef3c7',
  color: '#92400e',
  padding: '7px 10px',
  borderRadius: '999px',
  fontWeight: 800,
  fontSize: '13px',
  whiteSpace: 'nowrap' as const,
}

const infoGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '10px',
  marginBottom: '16px',
}

const infoBox = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '12px',
}

const buttonStyle = {
  display: 'block',
  width: '100%',
  padding: '15px 16px',
  background: '#2563eb',
  color: '#fff',
  borderRadius: '12px',
  textDecoration: 'none',
  fontWeight: 800,
  textAlign: 'center' as const,
  boxSizing: 'border-box' as const,
}