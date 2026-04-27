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
        {orders?.map((order: any) => (
          <div key={order.id} style={cardStyle}>
            <div style={rowStyle}>
              <span style={labelStyle}>Store</span>
              <strong>{order.stores?.store_name ?? '-'}</strong>
            </div>

            <div style={rowStyle}>
              <span style={labelStyle}>Warehouse</span>
              <span>{order.warehouses?.name ?? '-'}</span>
            </div>

            <div style={rowStyle}>
              <span style={labelStyle}>Order Date</span>
              <span>{order.order_date}</span>
            </div>

            <div style={rowStyle}>
              <span style={labelStyle}>Delivery Date</span>
              <span>{order.delivery_date}</span>
            </div>

            <div style={rowStyle}>
              <span style={labelStyle}>Status</span>
              <strong>{order.status}</strong>
            </div>

            <Link href={`/orders/${order.id}`} style={buttonStyle}>
              View / Pick Order
            </Link>
          </div>
        ))}
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
}

const backLink = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: 700,
}

const titleStyle = {
  fontSize: '34px',
  marginTop: '24px',
  marginBottom: '20px',
}

const cardsWrapper = {
  display: 'grid',
  gap: '16px',
}

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '16px',
  padding: '18px',
  boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
}

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '14px',
  padding: '10px 0',
  borderBottom: '1px solid #eef2f7',
  fontSize: '16px',
}

const labelStyle = {
  color: '#64748b',
  fontWeight: 700,
}

const buttonStyle = {
  display: 'block',
  marginTop: '16px',
  padding: '14px 16px',
  background: '#2563eb',
  color: '#fff',
  borderRadius: '12px',
  textDecoration: 'none',
  fontWeight: 800,
  textAlign: 'center' as const,
}