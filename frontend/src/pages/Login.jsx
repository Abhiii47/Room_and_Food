// src/pages/Login.jsx
import React, { useState } from 'react'
import API from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Login({ setUser }) {
  const [mode, setMode] = useState('login') // or 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const navigate = useNavigate()

  const handleAuth = async () => {
    // Validation
    if (!email || !password) {
      alert('Email and password are required');
      return;
    }
    if (mode === 'register' && !name) {
      alert('Name is required for registration');
      return;
    }
    if (!email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      if (mode === 'register') {
        const res = await API.post('/auth/register', { name, email, password, role })
        const data = res.data
        if (data.token && data.user) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          setUser && setUser(data.user)
          navigate('/')
        } else {
          alert('Registration failed: Invalid response from server')
        }
      } else {
        const res = await API.post('/auth/login', { email, password })
        const data = res.data
        if (data.token && data.user) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          setUser && setUser(data.user)
          navigate('/')
        } else {
          alert('Login failed: Invalid response from server')
        }
      }
    } catch (e) { 
      const errorMsg = e.response?.data?.message || e.message || 'An error occurred'
      alert(errorMsg)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{mode === 'register' ? 'Create account' : 'Sign in'}</h2>
          <div className="text-sm text-slate-500">
            <button onClick={()=>setMode(mode==='login' ? 'register' : 'login')} className="text-sm underline">{mode==='login' ? 'Register' : 'Login'}</button>
          </div>
        </div>

        <div className="grid gap-3">
          {mode === 'register' && <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="input" />}
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="input" />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="input" />
          {mode === 'register' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-500">Role</label>
              <select value={role} onChange={e=>setRole(e.target.value)} className="input" style={{ maxWidth: 200 }}>
                <option value="user">User</option>
                <option value="provider">Provider</option>
              </select>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleAuth} className="brand-btn">{mode === 'register' ? 'Create account' : 'Sign in'}</button>
            <button onClick={()=>{ setEmail(''); setPassword(''); setName('') }} className="px-3 py-1 rounded-md border">Clear</button>
          </div>
        </div>
      </div>
    </div>
  )
}
