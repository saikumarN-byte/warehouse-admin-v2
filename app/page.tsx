import Link from 'next/link'
import { supabase } from '../lib/supabase'

export default async function Home() {
  const [
    { count: productsCount },
    { count: storesCount },
    { count: ordersCount },
    { count: pendingOrdersCount },
    { data: inventoryRows },
    { data: palletShipments },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('stores').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase.from('inventory').select('qty_on_hand, reorder_level'),
    supabase.from('pallet_shipments').select('id, status'),
  ])

  const lowStockCount =
    inventoryRows?.filter(
      (item) => Number(item.qty_on_hand) <= Number(item.reorder_level)
    ).length ?? 0

  const inboundInTransitCount =
    palletShipments?.filter(
      (s) => s.status === 'dispatched' || s.status === 'in_transit'
    ).length ?? 0

  const inboundReceivedCount =
    palletShipments?.filter((s) => s.status === 'received').length ?? 0

  return (
    <main
      style={{
        padding: '32px',
        fontFamily: 'Arial, sans-serif',
        background: '#f8fafc',
        minHeight: '100vh',
        color: '#0f172a',
      }}
    >
      <h1
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#0f172a',
        }}
      >
        Sydney Warehouse Dashboard
      </h1>

      <p
        style={{
          color: '#475569',
          marginBottom: '24px',
          fontSize: '15px',
        }}
      >
        Overview of orders, inventory, inbound pallets, and reporting
      </p>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '25px',
        }}
      >
        <Link href="/" style={navLinkStyle}>Dashboard</Link>
        <Link href="/products" style={navLinkStyle}>Products</Link>
        <Link href="/inventory" style={navLinkStyle}>Inventory</Link>
        <Link href="/orders" style={navLinkStyle}>Orders</Link>
        <Link href="/inbound-pallets" style={navLinkStyle}>Inbound Pallets</Link>
        <Link href="/reports/trends" style={navLinkStyle}>Trends</Link>
        <Link href="/ai-restock" style={navLinkStyle}>AI Restock</Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '30px',
        }}
      >
        <div style={cardStyle}>
          <div style={labelStyle}>Products</div>
          <div style={valueStyle}>{productsCount ?? 0}</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Sydney Stores</div>
          <div style={valueStyle}>{storesCount ?? 0}</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Total Orders</div>
          <div style={valueStyle}>{ordersCount ?? 0}</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Pending Orders</div>
          <div style={valueStyle}>{pendingOrdersCount ?? 0}</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Low Stock Items</div>
          <div style={valueStyle}>{lowStockCount}</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Inbound In Transit</div>
          <div style={valueStyle}>{inboundInTransitCount}</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Inbound Received</div>
          <div style={valueStyle}>{inboundReceivedCount}</div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        <div style={panelStyle}>
          <h2 style={{ marginBottom: '10px', color: '#0f172a' }}>Quick Actions</h2>
          <ul style={{ paddingLeft: '18px', margin: 0, lineHeight: 1.8 }}>
            <li><Link href="/products" style={actionLinkStyle}>Manage Products</Link></li>
            <li><Link href="/inventory" style={actionLinkStyle}>View Inventory</Link></li>
            <li><Link href="/orders" style={actionLinkStyle}>Create and Manage Orders</Link></li>
            <li><Link href="/inbound-pallets" style={actionLinkStyle}>Track Inbound Pallets</Link></li>
          </ul>
        </div>

        <div style={panelStyle}>
          <h2 style={{ marginBottom: '10px', color: '#0f172a' }}>Planning & Insights</h2>
          <ul style={{ paddingLeft: '18px', margin: 0, lineHeight: 1.8 }}>
            <li><Link href="/reports/trends" style={actionLinkStyle}>Product / Store Trends</Link></li>
            <li><Link href="/ai-restock" style={actionLinkStyle}>AI Restock Suggestions</Link></li>
          </ul>
        </div>
      </div>
    </main>
  )
}

const navLinkStyle = {
  display: 'inline-block',
  padding: '8px 12px',
  borderRadius: '8px',
  textDecoration: 'none',
  color: '#1e293b',
  background: '#ffffff',
  border: '1px solid #dbe3ee',
  fontWeight: 600,
}

const actionLinkStyle = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: 500,
}

const cardStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  padding: '18px',
  background: '#ffffff',
  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
}

const panelStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  padding: '18px',
  background: '#ffffff',
  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
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