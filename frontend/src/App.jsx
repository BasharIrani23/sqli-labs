import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import SchemaModal from './components/SchemaModal'
import Home from './pages/Home'
import ErrorBased from './pages/ErrorBased'
import UnionBased from './pages/UnionBased'
import BlindBoolean from './pages/BlindBoolean'
import BlindTime from './pages/BlindTime'

export default function App() {
  const [mode, setMode] = useState('vulnerable')
  const [isSchemaOpen, setIsSchemaOpen] = useState(false)

  return (
    <div className="app-layout">
      {/* Top Navbar */}
      <Navbar onOpenSchema={() => setIsSchemaOpen(true)} />

      {/* Main Content Area */}
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={<Home onOpenSchema={() => setIsSchemaOpen(true)} />}
          />
          <Route
            path="/error-based"
            element={<ErrorBased mode={mode} setMode={setMode} />}
          />
          <Route
            path="/union-based"
            element={<UnionBased mode={mode} setMode={setMode} />}
          />
          <Route
            path="/blind-boolean"
            element={<BlindBoolean mode={mode} setMode={setMode} />}
          />
          <Route
            path="/blind-time"
            element={<BlindTime mode={mode} setMode={setMode} />}
          />
        </Routes>
      </main>

      {/* Database Schema Explorer & Reset Modal */}
      <SchemaModal
        isOpen={isSchemaOpen}
        onClose={() => setIsSchemaOpen(false)}
      />
    </div>
  )
}
