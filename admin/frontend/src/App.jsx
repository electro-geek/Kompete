import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login.jsx'
import Layout from './components/Layout.jsx'
import Dashboard from './components/Dashboard.jsx'
import UsersPage from './components/UsersPage.jsx'
import ReportsPage from './components/ReportsPage.jsx'

const SECRET_KEY = 'kompete_admin_secret'

export default function App() {
  const [secret, setSecret] = useState(() => sessionStorage.getItem(SECRET_KEY) || '')
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    if (secret) setAuthed(true)
  }, [secret])

  function handleLogin(s) {
    sessionStorage.setItem(SECRET_KEY, s)
    setSecret(s)
    setAuthed(true)
  }

  function handleLogout() {
    sessionStorage.removeItem(SECRET_KEY)
    setSecret('')
    setAuthed(false)
  }

  if (!authed) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Layout secret={secret} onLogout={handleLogout}>
      <Routes>
        <Route path="/"        element={<Dashboard secret={secret} />} />
        <Route path="/users"   element={<UsersPage  secret={secret} />} />
        <Route path="/reports" element={<ReportsPage secret={secret} />} />
        <Route path="*"        element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
