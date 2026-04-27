'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../../../../lib/supabase'

export default function PickOrderPage() {
  const params = useParams()
  const orderId = params.id as string

  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerRegionId = 'order-pick-reader'

  const [scannerOn, setScannerOn] = useState(false)
  const [qrValue, setQrValue] = useState('')
  const [pickQty, setPickQty] = useState('')
  const [product, setProduct] = useState<any>(null)
  const [orderItem, setOrderItem] = useState<any>(null)
  const [message, setMessage] = useState('')

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
          await findOrderItem(decodedText)
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

  async function findOrderItem(value = qrValue) {
    setMessage('')
    setProduct(null)
    setOrderItem(null)

    const cleanValue = value.trim()

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .or(`sku.eq.${cleanValue},qr_code_value.eq.${cleanValue}`)
      .limit(1)

    if (!products || products.length === 0) {
      setMessage('Product not found')
      return
    }

    const foundProduct = products[0]
    setProduct(foundProduct)

    const { data: items, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .eq('product_id', foundProduct.id)
      .limit(1)

    if (error) {
      setMessage(error.message)
      return
    }

    if (!items || items.length === 0) {
      setMessage('This product is NOT in this order')
      return
    }

    setOrderItem(items[0])
    setMessage('Product found in order. Enter picked quantity.')
  }

  async function confirmPick() {
  if (!orderItem || Number(pickQty) <= 0) {
    setMessage('Enter picked quantity')
    return
  }

  const qtyPicking = Number(pickQty)
  const orderedQty = Number(orderItem.quantity || 0)
  const currentPicked = Number(orderItem.picked_quantity || 0)
  const newPicked = currentPicked + qtyPicking

  if (newPicked > orderedQty) {
    setMessage(`Cannot pick more than ordered qty`)
    return
  }

  // 1️⃣ Update picked quantity
  const { error: pickError } = await supabase
    .from('order_items')
    .update({ picked_quantity: newPicked })
    .eq('id', orderItem.id)

  if (pickError) {
    setMessage(pickError.message)
    return
  }

  // 2️⃣ Get warehouse (Sydney)
  const { data: warehouse } = await supabase
    .from('warehouses')
    .select('id')
    .eq('name', 'Sydney Warehouse')
    .limit(1)

  const warehouseId = warehouse?.[0]?.id

  // 3️⃣ Get inventory row
  const { data: inventory } = await supabase
    .from('inventory')
    .select('*')
    .eq('product_id', product.id)
    .eq('warehouse_id', warehouseId)
    .limit(1)

  if (!inventory || inventory.length === 0) {
    setMessage('Inventory not found')
    return
  }

  const currentStock = Number(inventory[0].qty_on_hand)

  if (qtyPicking > currentStock) {
    setMessage(`Not enough stock. Available: ${currentStock}`)
    return
  }

  const newStock = currentStock - qtyPicking

  // 4️⃣ Update inventory
  const { error: stockError } = await supabase
    .from('inventory')
    .update({ qty_on_hand: newStock })
    .eq('id', inventory[0].id)

  if (stockError) {
    setMessage(stockError.message)
    return
  }

  setMessage(`✅ Picked successfully. Stock left: ${newStock}`)

  setPickQty('')
  setOrderItem({ ...orderItem, picked_quantity: newPicked })
}

  return (
    <main style={pageStyle}>
      <Link href={`/orders/${orderId}`} style={backLink}>
        ← Back to Order
      </Link>

      <h1 style={titleStyle}>Pick Order #{orderId}</h1>
      <p style={subtitleStyle}>Scan product QR, then enter the quantity picked.</p>

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

          <label style={labelStyle}>QR / SKU</label>
          <input
            value={qrValue}
            onChange={(e) => setQrValue(e.target.value)}
            placeholder="Scan or type BBT001"
            style={inputStyle}
          />

          <button onClick={() => findOrderItem()} style={secondaryButton}>
            Find Product in Order
          </button>

          {product && (
            <div style={resultBox}>
              <h3>{product.product_name}</h3>
              <p><strong>SKU:</strong> {product.sku}</p>

              {orderItem && (
                <>
                  <p><strong>Ordered Qty:</strong> {orderItem.quantity}</p>
                  <p><strong>Picked Qty:</strong> {orderItem.picked_quantity || 0}</p>

                  <label style={labelStyle}>Quantity Picking Now</label>
                  <input
                    type="number"
                    value={pickQty}
                    onChange={(e) => setPickQty(e.target.value)}
                    placeholder="Enter quantity"
                    style={inputStyle}
                  />

                  <button onClick={confirmPick} style={primaryButton}>
                    Confirm Pick
                  </button>
                </>
              )}
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
const secondaryButton = { padding: '10px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }
const dangerButton = { padding: '10px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }
const resultBox = { marginTop: '16px', padding: '16px', borderRadius: '12px', background: '#ecfdf5', border: '1px solid #bbf7d0' }