/* eslint-disable */
/* global Response */
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

// ─── Global Fetch Interceptor for standardized ApiResponse ────────────────
const originalFetch = window.fetch
window.fetch = async (...args) => {
  const response = await originalFetch(...args)
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    const clone = response.clone()
    try {
      const json = await clone.json()
      if (
        json &&
        typeof json === 'object' &&
        'success' in json &&
        ('data' in json || 'errors' in json)
      ) {
        let unwrappedData
        if (json.success) {
          unwrappedData = json.data !== null ? json.data : { message: json.message }
        } else {
          unwrappedData = {
            message: json.message,
            error: json.message,
            errors: json.errors,
          }
        }

        const newResponse = new Response(JSON.stringify(unwrappedData), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        })

        Object.defineProperty(newResponse, 'url', { value: response.url })
        return newResponse
      }
    } catch (e) {
      // Ignore parsing error
    }
  }
  if (response.status === 401) {
    document.dispatchEvent(new CustomEvent('auth:unauthorized'))
  }
  return response
}

import WorkSchedule from './pages/WorkSchedule.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import './styles/globals.css'

import { AlertTriangle, RefreshCw } from 'lucide-react'

// ─── Error Boundary ─────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Caught crash:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-[#c8102e]" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Có lỗi xảy ra</h2>
            <p className="text-sm text-gray-500 mb-1">
              {this.state.error?.message || 'Lỗi không xác định'}
            </p>
            <p className="text-xs text-gray-400 mb-6">Vui lòng tải lại trang để tiếp tục.</p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 mx-auto px-6 py-2.5 bg-[#c8102e] hover:bg-[#a50e27] text-white rounded-lg text-sm font-semibold transition"
            >
              <RefreshCw size={14} />
              Tải lại trang
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Root Component ─────────────────────────────────────────────────────────
function Root() {
  const path = window.location.pathname

  if (path === '/campha/manager/login' || path === '/campha/manager/login/') {
    return <AdminLogin />
  }

  // Default to Work Schedule for now
  return <WorkSchedule />
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <Root />
  </ErrorBoundary>
)
