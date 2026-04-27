import Link from 'next/link'
import { supabase } from '../../lib/supabase'
export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const { data: warehouses, error: warehouseError } = await supabase
    .from('warehouses')
    .select('id, name, city')
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
        product_id,
        warehouse_id,
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

  const lowStockCount = inventory.filter(
    (row) => Number(row.qty_on_hand) <= Number(row.reorder_level)
  ).length

  const totalStockUnits = inventory.reduce(
    (sum, row) => sum + Number(row.qty_on_hand),
    0
  )

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
      <div style={{ marginBottom: '20px' }}>
        <Link href="/" style={backLinkStyle}>← Back to Dashboard</Link>
      </div>

      <h1
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '8px',
          color: '#0f172a',
        }}
      >
        Sydney Inventory
      </h1>

      <p
        style={{
          color: '#475569',
          marginBottom: '24px',
          fontSize: '15px',
        }}
      >
        Live stock levels for Sydney warehouse
      </p>
      <div style={{ marginBottom: '20px' }}>
  <Link
    href="/stock-in"
    style={{
      padding: '10px 16px',
      background: '#16a34a',
      color: '#fff',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: 700,
      display: 'inline-block',
    }}
  >
    Stock In QR
  </Link>
</div>

      {warehouseError && (
        <p style={{ color: 'red', marginBottom: '16px' }}>
          Warehouse error: {warehouseError.message}
        </p>
      )}

      {inventoryError && (
        <p style={{ color: 'red', marginBottom: '16px' }}>
          Inventory error: {inventoryError.message}
        </p>
      )}

      {!warehouse && !warehouseError && (
        <p style={{ color: 'red', marginBottom: '16px' }}>
          Sydney Warehouse was not found in the database.
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div style={cardStyle}>
          <div style={labelStyle}>Products in Inventory</div>
          <div style={valueStyle}>{inventory.length}</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Total Stock Units</div>
          <div style={valueStyle}>{totalStockUnits}</div>
        </div>

        <div style={cardStyle}>
          <div style={labelStyle}>Low Stock Items</div>
          <div style={valueStyle}>{lowStockCount}</div>
        </div>
      </div>

      <div
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          overflow: 'hidden',
          background: '#ffffff',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.06)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            background: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0',
            fontWeight: 700,
            color: '#0f172a',
          }}
        >
          <div style={th}>Product</div>
          <div style={th}>SKU</div>
          <div style={th}>Qty On Hand</div>
          <div style={th}>Reorder Level</div>
          <div style={th}>Status</div>
        </div>

        {inventory.length > 0 ? (
          inventory.map((row) => {
            const isLowStock =
              Number(row.qty_on_hand) <= Number(row.reorder_level)

            return (
              <div
                key={row.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                  borderBottom: '1px solid #eef2f7',
                  color: '#1e293b',
                  background: isLowStock ? '#fff7ed' : '#ffffff',
                }}
              >
                <div style={td}>{row.products?.product_name ?? '-'}</div>
                <div style={td}>{row.products?.sku ?? '-'}</div>
                <div style={td}>{row.qty_on_hand ?? 0}</div>
                <div style={td}>{row.reorder_level ?? 0}</div>
                <div
                  style={{
                    ...td,
                    fontWeight: 600,
                    color: isLowStock ? '#c2410c' : '#15803d',
                  }}
                >
                  {isLowStock ? 'Low Stock' : 'Healthy'}
                </div>
              </div>
            )
          })
        ) : (
          <div style={{ padding: '16px', color: '#475569' }}>
            No Sydney inventory found.
          </div>
        )}
      </div>
    </main>
  )
}

const backLinkStyle = {
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

const th = {
  padding: '14px 12px',
  textAlign: 'left' as const,
}

const td = {
  padding: '14px 12px',
}