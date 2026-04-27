import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id,
      order_date,
      delivery_date,
      status,
      stores (store_name),
      warehouses (name)
    `)
    .eq('id', id)
    .limit(1)

  const { data: items, error } = await supabase
    .from('order_items')
    .select(`
      id,
      quantity,
      picked_quantity,
      products (
        product_name,
        sku
      )
    `)
    .eq('order_id', id)

  const orderData = order?.[0]

  return (
    <main style={pageStyle}>
      <Link href="/orders" style={backLink}>← Back to Orders</Link>

      <div style={headerStyle}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
            Order #{id}
          </h1>
          <p style={{ color: '#475569' }}>
            {(orderData as any)?.stores?.store_name} → {(orderData as any)?.warehouses?.name}
          </p>
        </div>

        <Link href={`/orders/${id}/pick`} style={buttonStyle}>
          Pick Order
        </Link>
      </div>

      {error && <p style={{ color: 'red' }}>{error.message}</p>}

      <div style={tableStyle}>
        <div style={headerRow}>
          <div style={cell}>Product</div>
          <div style={cell}>SKU</div>
          <div style={cell}>Ordered Qty</div>
          <div style={cell}>Picked Qty</div>
          <div style={cell}>Status</div>
        </div>

        {items?.map((item: any) => {
          const ordered = Number(item.quantity || 0)
          const picked = Number(item.picked_quantity || 0)
          const complete = picked >= ordered

          return (
            <div key={item.id} style={rowStyle}>
              <div style={cell}>{item.products?.product_name}</div>
              <div style={cell}>{item.products?.sku}</div>
              <div style={cell}>{ordered}</div>
              <div style={cell}>{picked}</div>
              <div style={{ ...cell, color: complete ? '#15803d' : '#c2410c', fontWeight: 700 }}>
                {complete ? 'Picked' : 'Pending'}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}

const pageStyle = { padding: '32px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial, sans-serif', color: '#0f172a' }
const backLink = { color: '#2563eb', textDecoration: 'none', fontWeight: 600 }
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', marginBottom: '24px' }
const buttonStyle = { padding: '10px 16px', background: '#2563eb', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }
const tableStyle = { background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }
const headerRow = { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', background: '#f1f5f9', fontWeight: 700 }
const rowStyle = { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', borderTop: '1px solid #e2e8f0' }
const cell = { padding: '14px 12px' }