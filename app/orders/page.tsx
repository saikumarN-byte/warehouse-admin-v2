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

      <h1 style={{ fontSize: '32px', marginTop: '20px' }}>Orders</h1>

      {error && <p style={{ color: 'red' }}>{error.message}</p>}

      <div style={tableStyle}>
        <div style={headerRow}>
          <div style={cell}>Store</div>
          <div style={cell}>Warehouse</div>
          <div style={cell}>Order Date</div>
          <div style={cell}>Delivery Date</div>
          <div style={cell}>Status</div>
          <div style={cell}>Action</div>
        </div>

        {orders?.map((order: any) => (
          <div key={order.id} style={rowStyle}>
            <div style={cell}>{order.stores?.store_name ?? '-'}</div>
            <div style={cell}>{order.warehouses?.name ?? '-'}</div>
            <div style={cell}>{order.order_date}</div>
            <div style={cell}>{order.delivery_date}</div>
            <div style={{ ...cell, fontWeight: 700 }}>{order.status}</div>
            <div style={cell}>
              <Link href={`/orders/${order.id}`} style={buttonStyle}>
                View / Pick
              </Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

const pageStyle = { padding: '32px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial, sans-serif', color: '#0f172a' }
const backLink = { color: '#2563eb', textDecoration: 'none', fontWeight: 600 }
const tableStyle = { marginTop: '20px', background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }
const headerRow = { display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', background: '#f1f5f9', fontWeight: 700 }
const rowStyle = { display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr', borderTop: '1px solid #e2e8f0' }
const cell = { padding: '14px 12px' }
const buttonStyle = { padding: '8px 12px', background: '#2563eb', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }