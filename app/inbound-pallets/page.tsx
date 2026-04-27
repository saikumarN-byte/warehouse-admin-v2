import Link from 'next/link'
import { supabase } from '../../lib/supabase'
export const dynamic = 'force-dynamic'

export default async function InboundPalletsPage() {
  const { data: shipments, error } = await supabase
    .from('pallet_shipments')
    .select(`
      id,
      shipment_number,
      dispatch_date,
      expected_arrival_date,
      received_date,
      status,
      logistics_partner,
      origin_warehouse_id,
      destination_warehouse_id
    `)
    .order('dispatch_date', { ascending: false })

  const { data: warehouses } = await supabase
    .from('warehouses')
    .select('id, name')

  const getWarehouseName = (id: number | null) => {
    return warehouses?.find((w) => Number(w.id) === Number(id))?.name ?? '-'
  }

  return (
    <main style={{
      padding: '32px',
      background: '#f8fafc',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      color: '#0f172a'
    }}>
      <Link href="/" style={{ color: '#2563eb' }}>← Back to Dashboard</Link>

      <h1 style={{ fontSize: '32px', marginTop: '20px' }}>Inbound Pallets</h1>

      <p style={{ color: '#475569' }}>
        Track pallets dispatched from Melbourne and received into Sydney
      </p>

      {error && <p style={{ color: 'red' }}>{error.message}</p>}

      <table style={{
        width: '100%',
        marginTop: '20px',
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        <thead style={{ background: '#f1f5f9' }}>
          <tr>
            <th style={th}>Shipment #</th>
            <th style={th}>From</th>
            <th style={th}>To</th>
            <th style={th}>Dispatch Date</th>
            <th style={th}>Expected Arrival</th>
            <th style={th}>Received Date</th>
            <th style={th}>Logistics Partner</th>
            <th style={th}>Status</th>
          </tr>
        </thead>

        <tbody>
          {shipments && shipments.length > 0 ? (
            shipments.map((s: any) => (
              <tr key={s.id}>
                <td style={td}>{s.shipment_number}</td>
                <td style={td}>{getWarehouseName(s.origin_warehouse_id)}</td>
                <td style={td}>{getWarehouseName(s.destination_warehouse_id)}</td>
                <td style={td}>{s.dispatch_date ?? '-'}</td>
                <td style={td}>{s.expected_arrival_date ?? '-'}</td>
                <td style={td}>{s.received_date ?? '-'}</td>
                <td style={td}>{s.logistics_partner ?? '-'}</td>
                <td
                  style={{
                    ...td,
                    fontWeight: 700,
                    color:
                      s.status === 'Received'
                        ? '#15803d'
                        : s.status === 'In Transit'
                        ? '#c2410c'
                        : '#475569',
                  }}
                >
                  {s.status}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} style={{ padding: '16px', color: '#64748b' }}>
                No inbound pallet shipments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  )
}

const th = {
  padding: '14px 12px',
  textAlign: 'left' as const,
  color: '#0f172a',
}

const td = {
  padding: '14px 12px',
  borderTop: '1px solid #e2e8f0',
}