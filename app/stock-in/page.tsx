'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../../lib/supabase'

export default function StockInPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerRegionId = 'stock-in-reader'

  const [scannerOn, setScannerOn] = useState(false)
  const [qrValue, setQrValue] = useState('')
  const [product, setProduct] = useState<any>(null)
  const [qty, setQty] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  async function startScanner() {
    setMessage('')

    try {
      const scanner = new Html5Qrcode(scannerRegionId)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          setQrValue(decodedText)
          await findProduct(decodedText)
        },
        () => {}
      )

      setScannerOn(true)
    } catch (err: any) {
      setMessage(err?.message || 'Unable to start scanner')
    }
  }

  async function stopScanner() {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop()
        await scannerRef.current.clear()
        scannerRef.current = null
      }
    } catch {}

    setScannerOn(false)
  }

  async function findProduct(value = qrValue) {
    const cleanValue = value.trim()

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`sku.eq.${cleanValue},qr_code_value.eq.${cleanValue}`)
      .limit(1)

    if (error) {
      setMessage(error.message)
      return
    }

    if (!data || data.length === 0) {
      setProduct(null)
      setMessage('Product not found')
      return
    }

    setProduct(data[0])
    setMessage('Product found')
  }

  async function addStock() {
    if (!product || Number(qty) <= 0) {
      setMessage('Please scan product and enter quantity')
      return
    }

    const { data: warehouse } = await supabase
      .from('warehouses')
      .select('id')
      .eq('name', 'Sydney Warehouse')
      .limit(1)

    const warehouseId = warehouse?.[0]?.id

    const { data: inventory } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', product.id)
      .eq('warehouse_id', warehouseId)
      .limit(1)

    if (!inventory || inventory.length === 0) {
      setMessage('Inventory row not found')
      return
    }

    const newQty = Number(inventory[0].qty_on_hand) + Number(qty)

    const { error } = await supabase
      .from('inventory')
      .update({ qty_on_hand: newQty })
      .eq('id', inventory[0].id)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage(`Stock updated. New quantity: ${newQty}`)
    setQty('')
  }

  return (
    <main style={pageStyle}>
      <Link href="/" style={backLink}>← Back to Dashboard</Link>

      <h1 style={titleStyle}>Stock In QR</h1>
      <p style={subtitleStyle}>Scan product QR and add quantity into Sydney inventory.</p>

      <div style={gridStyle}>
        <section style={cardStyle}>
          <h2>Camera Scanner</h2>

          <div id={scannerRegionId} style={scannerBoxStyle} />

          {!scannerOn ? (
            <button onClick={startScanner} style={primaryButton}>Start Scanner</button>
          ) : (
            <button onClick={stopScanner} style={dangerButton}>Stop Scanner</button>
          )}
        </section>

        <section style={cardStyle}>
          <h2>Stock Details</h2>

          <label style={labelStyle}>QR / SKU</label>
          <input
            value={qrValue}
            onChange={(e) => setQrValue(e.target.value)}
            placeholder="Scan or type BBT001"
            style={inputStyle}
          />

          <button onClick={() => findProduct()} style={secondaryButton}>Find Product</button>

          {product && (
            <div style={resultBox}>
              <h3>{product.product_name}</h3>
              <p><strong>SKU:</strong> {product.sku}</p>

              <label style={labelStyle}>Quantity to Add</label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="Enter quantity"
                style={inputStyle}
              />

              <button onClick={addStock} style={primaryButton}>Add Stock</button>
            </div>
          )}

          {message && <p style={{ marginTop: '16px', fontWeight: 700 }}>{message}</p>}
        </section>
      </div>
    </main>
  )
}

const pageStyle = { padding: '32px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial, sans-serif', color: '#0f172a' }
const backLink = { color: '#2563eb', textDecoration: 'none', fontWeight: 600 }
const titleStyle = { fontSize: '32px', marginTop: '24px', marginBottom: '8px' }
const subtitleStyle = { color: '#475569', marginBottom: '24px' }
const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
}
const cardStyle = { background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }
const scannerBoxStyle = { minHeight: '280px', border: '1px dashed #cbd5e1', borderRadius: '12px', marginBottom: '16px', padding: '8px', fontSize: '16px' }
const labelStyle = { display: 'block', fontWeight: 700, marginTop: '12px', marginBottom: '6px' }
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px' }
const primaryButton = {
  width: '100%',            // 👈 full width
  padding: '14px 16px',     // 👈 bigger height
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 800,
  cursor: 'pointer',
  fontSize: '16px',         // 👈 readable on mobile
}
const secondaryButton = {
  width: '100%',
  padding: '14px 16px',
  background: '#0f172a',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 800,
  cursor: 'pointer',
  fontSize: '16px',
}
const dangerButton = {
  width: '100%',
  padding: '14px 16px',
  background: '#dc2626',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 800,
  cursor: 'pointer',
  fontSize: '16px',
}
const resultBox = { marginTop: '16px', padding: '16px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #bbf7d0' }