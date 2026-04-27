'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleLogin() {
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    router.replace('/')
  }

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <h1>Login</h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleLogin} style={buttonStyle}>
          Login
        </button>

        {message && <p style={{ color: 'red' }}>{message}</p>}
      </div>
    </main>
  )
}

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: '#f8fafc',
}

const cardStyle = {
  background: '#fff',
  padding: '24px',
  borderRadius: '14px',
  width: '100%',
  maxWidth: '320px',
  display: 'grid',
  gap: '12px',
}

const inputStyle = {
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
}

const buttonStyle = {
  padding: '12px',
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 700,
}