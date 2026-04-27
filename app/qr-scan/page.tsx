'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { Html5Qrcode } from 'html5-qrcode'

export default function QRScanPage() {
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const [scannerOn, setScannerOn] = useState(false)
  const [scannedValue, setScannedValue] = useState('')
  const [message, setMessage] = useState('')
  const [product, setProduct] = useState<any>(null)

  const scannerRegionId = 'qr-reader'

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  async function startScanner() {
    setMessage('')
    setProduct(null)

    try {
      const scanner = new Html5Qrcode(scannerRegionId)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          setScannedValue(decodedText)
          await findProduct(decodedText)
        },
        () => {}
      )

      setScannerOn(true)
    } catch (err: any) {
      setMessage(err?.message || 'Unable to start camera scanner.')
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

  async function findProduct(value: string) {
    const cleanValue = value.trim()

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`sku.eq.${cleanValue},qr_code_value.eq.${cleanValue}`)
      .limit(1)

    if (error) {
      setMessage(error.message)
      setProduct(null)
      return
    }

    if (!data || data.length === 0) {
      setMessage(`No product found for QR: ${cleanValue}`)
      setProduct(null)
      return
    }

    setProduct(data[0])
    setMessage('Product found')
  }

  async function manualSearch() {
    if (!scannedValue.trim()) return
    await findProduct(scannedValue)
  }

  return (
    <main
      style={{
        padding: '32px',
        background: '#f8fafc',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        color: '#0f172a',
      }}
    >
      <Link href="/" style={{ color: '#2563eb' }}>
        ← Back to Dashboard
      </Link>

      <h1 style={{ fontSize: '32px', marginTop: '20px' }}>
        QR Product Scanner
      </h1>

      <p style={{ color: '#475569', marginBottom: '20px' }}>
        Scan a product QR code to identify stock items quickly.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Camera Scanner</h2>

          <div
            id={scannerRegionId}
            style={{
              width: '100%',
              minHeight: '280px',
              border: '1px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '8px',
              background: '#fff',
              marginBottom: '16px',
            }}
          />

          {!scannerOn ? (
            <button onClick={startScanner} style={primaryButtonStyle}>
              Start Scanner
            </button>
          ) : (
            <button onClick={stopScanner} style={dangerButtonStyle}>
              Stop Scanner
            </button>
          )}
        </section>

        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Scan Result</h2>

          <label style={{ fontWeight: 600 }}>QR / SKU Value</label>
          <input
            value={scannedValue}
            onChange={(e) => setScannedValue(e.target.value)}
            placeholder="Scan or type SKU e.g. BBT001"
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '8px',
              marginBottom: '12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
            }}
          />

          <button onClick={manualSearch} style={primaryButtonStyle}>
            Find Product
          </button>

          {message && (
            <p
              style={{
                marginTop: '16px',
                color: product ? '#15803d' : '#dc2626',
                fontWeight: 600,
              }}
            >
              {message}
            </p>
          )}

          {product && (
            <div
              style={{
                marginTop: '16px',
                padding: '16px',
                borderRadius: '12px',
                background: '#ecfdf5',
                border: '1px solid #bbf7d0',
              }}
            >
              <h3 style={{ marginTop: 0 }}>{product.product_name}</h3>
              <p><strong>SKU:</strong> {product.sku}</p>
              <p><strong>Category:</strong> {product.category}</p>
              <p><strong>Unit:</strong> {product.unit}</p>
              <p><strong>QR Value:</strong> {product.qr_code_value || product.sku}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

const cardStyle = {
  background: '#ffffff',
  padding: '18px',
  borderRadius: '14px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
}

const primaryButtonStyle = {
  padding: '10px 16px',
  background: '#2563eb',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600,
}

const dangerButtonStyle = {
  padding: '10px 16px',
  background: '#dc2626',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 600,
}