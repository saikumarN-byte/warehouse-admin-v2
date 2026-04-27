import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const { data: warehouses } = await supabase
    .from('warehouses')
    .select('id, name')
    .eq('name', 'Sydney Warehouse')
    .limit(1)

  const warehouse = warehouses?.[0]

  let inventory: any[] = []
  let inventoryError: any = null

  if (warehouse?.id) {
    const result = await supabase
      .from('inventory')
      .select(`
        id,
        qty_on_hand,
        reorder_level,
        products (
          product_name,
          sku,
          category,
          unit
        )
      `)
      .eq('warehouse_id', warehouse.id)
      .order('id', { ascending: true })

    inventory = result.data ?? []
    inventoryError = result.error
  }

  const totalStockUnits = inventory.reduce(
    (sum, row) => sum + Number(row.qty_on_hand || 0),
    0
  )

  const lowStockCount = inventory.filter(
    (row) => Number(row.qty_on_hand || 0) <= Number(row.reorder_level || 0)
  ).length

  return (
    <main style={pageStyle}>
      <Link href="/" style={backLink}>← Back to Dashboard</Link>

      <div style={headerRow}>
        <div>
          <h1 style={titleStyle}>Sydney Inventory</h1>
          <p style={subtitleStyle}>Live stock levels for Sydney warehouse</p>
        </div>

        <Link href="/stock-in" style={stockButton}>
          Stock In QR
        </Link>
      </div>

      {inventoryError && (
        <p style={{ color: 'red' }}>{inventoryError.message}</p>
      )}

      <section style={kpiGrid}>
        <div style={kpiCard}>
          <span style={kpiLabel}>Products</span>
          <strong style={kpiValue}>{inventory.length}</strong>
        </div>

        <div style={kpiCard}>
          <span style={kpiLabel}>Total Units</span>
          <strong style={kpiValue}>{totalStockUnits}</strong>
        </div>

        <div style={kpiCard}>
          <span style={kpiLabel}>Low Stock</span>
          <strong style={kpiValue}>{lowStockCount}</strong>
        </div>
      </section>

      <section style={cardsWrapper}>
        {inventory.length > 0 ? (
          inventory.map((row: any) => {
            const qty = Number(row.qty_on_hand || 0)
            const reorder = Number(row.reorder_level || 0)
            const isLow = qty <= reorder

            return (
              <div key={row.id} style={cardStyle}>
                <div style={cardTop}>
                  <div>
                    <div style={smallLabel}>Product</div>
                    <h2 style={productTitle}>
                      {row.products?.product_name ?? '-'}
                    </h2>
                  </div>

                  <span
                    style={{
                      ...statusBadge,
                      background: isLow ? '#fee2e2' : '#dcfce7',
                      color: isLow ? '#991b1b' : '#166534',
                    }}
                  >
                    {isLow ? 'Low Stock' : 'Healthy'}
                  </span>
                </div>

                <div style={infoGrid}>
                  <div style={infoBox}>
                    <span style={smallLabel}>SKU</span>
                    <strong>{row.products?.sku ?? '-'}</strong>
                  </div>

                  <div style={infoBox}>
                    <span style={smallLabel}>Category</span>
                    <strong>{row.products?.category ?? '-'}</strong>
                  </div>

                  <div style={infoBox}>
                    <span style={smallLabel}>Qty On Hand</span>
                    <strong style={{ fontSize: '24px' }}>{qty}</strong>
                  </div>

                  <div style={infoBox}>
                    <span style={smallLabel}>Reorder Level</span>
                    <strong>{reorder}</strong>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div style={cardStyle}>No Sydney inventory found.</div>
        )}
      </section>
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

const headerRow = {
  display: 'grid',
  gap: '14px',
  marginTop: '24px',
  marginBottom: '20px',
}

const titleStyle = {
  fontSize: '36px',
  margin: 0,
  lineHeight: 1.15,
}

const subtitleStyle = {
  color: '#475569',
  marginTop: '8px',
  marginBottom: 0,
  fontSize: '16px',
}

const stockButton = {
  display: 'block',
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '15px 16px',
  background: '#16a34a',
  color: '#fff',
  borderRadius: '12px',
  textDecoration: 'none',
  fontWeight: 800,
  textAlign: 'center' as const,
}

const kpiGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '10px',
  marginBottom: '20px',
}

const kpiCard = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '14px',
  padding: '14px',
  boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
}

const kpiLabel = {
  display: 'block',
  color: '#64748b',
  fontSize: '12px',
  fontWeight: 700,
  marginBottom: '8px',
}

const kpiValue = {
  fontSize: '24px',
  color: '#0f172a',
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

const cardTop = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'flex-start',
  marginBottom: '14px',
}

const smallLabel = {
  display: 'block',
  color: '#64748b',
  fontSize: '13px',
  fontWeight: 700,
  marginBottom: '4px',
}

const productTitle = {
  margin: 0,
  fontSize: '22px',
  lineHeight: 1.25,
}

const statusBadge = {
  padding: '7px 10px',
  borderRadius: '999px',
  fontWeight: 800,
  fontSize: '13px',
  whiteSpace: 'nowrap' as const,
}

const infoGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '10px',
}

const infoBox = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '12px',
}