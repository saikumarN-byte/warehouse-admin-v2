'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../../lib/supabase'

export default function PickOrderPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerRegionId = 'pick-order-reader'

  const [scannerOn, setScannerOn] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [qrValue, setQrValue] = useState('')
  const [message, setMessage] = useState('')
  const [product, setProduct] = useState<any>(null)

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  async function startScanner() {
    try {
      const scanner = new Html5Qrcode(scannerRegionId)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          setQrValue(decodedText)
          await pickItem(decodedText)
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

  async function pickItem(value = qrValue) {
    if (!orderId.trim()) {
      setMessage('Please enter Order ID first')
      return
    }

    const cleanValue = value.trim()

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .or(`sku.eq.${cleanValue},qr_code_value.eq.${cleanValue}`)
      .limit(1)

    if (!products || products.length === 0) {
      setProduct(null)
      setMessage('Product not found')
      return
    }

    const scannedProduct = products[0]
    setProduct(scannedProduct)

    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .eq('product_id', scannedProduct.id)
      .limit(1)

    if (error) {
      setMessage(error.message)
      return
    }

    if (!orderItems || orderItems.length === 0) {
      setMessage('Item is NOT in this order')
      return
    }

    const item = orderItems[0]
    const newPickedQty = Number(item.picked_quantity || 0) + 1

    await supabase
      .from('order_items')
      .update({ picked_quantity: newPickedQty })
      .eq('id', item.id)

    setMessage(`Picked ${scannedProduct.product_name}. Picked qty: ${newPickedQty}`)
  }

  return (
    <main style={pageStyle}>
      <Link href="/" style={backLink}>← Back to Dashboard</Link>

      <h1 style={titleStyle}>Order Picking QR</h1>
      <p style={subtitleStyle}>Enter order ID, scan product QR, and update picked quantity.</p>

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
          <h2>Picking Details</h2>

          <label style={labelStyle}>Order ID</label>
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Example: 1"
            style={inputStyle}
          />

          <label style={labelStyle}>QR / SKU</label>
          <input
            value={qrValue}
            onChange={(e) => setQrValue(e.target.value)}
            placeholder="Scan or type BBT001"
            style={inputStyle}
          />

          <button onClick={() => pickItem()} style={primaryButton}>Pick Item</button>

          {product && (
            <div style={resultBox}>
              <h3>{product.product_name}</h3>
              <p><strong>SKU:</strong> {product.sku}</p>
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
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }
const cardStyle = { background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 6px 18px rgba(0,0,0,0.05)' }
const scannerBoxStyle = { minHeight: '280px', border: '1px dashed #cbd5e1', borderRadius: '12px', marginBottom: '16px', padding: '8px' }
const labelStyle = { display: 'block', fontWeight: 700, marginTop: '12px', marginBottom: '6px' }
const inputStyle = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px' }
const primaryButton = { padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }
const dangerButton = { padding: '10px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }
const resultBox = { marginTop: '16px', padding: '16px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #bbf7d0' }