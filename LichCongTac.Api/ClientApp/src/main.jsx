/* eslint-disable */
/* global Response */
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { AlertTriangle, RefreshCw } from 'lucide-react'

import WorkSchedule from './pages/WorkSchedule.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import AdminAccounts from './pages/AdminAccounts.jsx'
import AdminSchedules from './pages/AdminSchedules.jsx'
import AdminChangePassword from './pages/AdminChangePassword.jsx'
import AdminDepartments from './pages/AdminDepartments.jsx'
import AdminEmployees from './pages/AdminEmployees.jsx'
import AdminNotifications from './pages/AdminNotifications.jsx'
import AdminHolidays from './pages/AdminHolidays.jsx'
import SearchSchedule from './pages/SearchSchedule.jsx'
import './styles/globals.css'

// ─── Global Fetch Interceptor for standardized ApiResponse ────────────────
const originalFetch = window.fetch
window.fetch = async function () {
  var args = Array.prototype.slice.call(arguments)

  var url = args[0]
  var options = args[1] || {}

  // Cache busting for GET API requests (Fix iOS Safari aggressive caching)
  if (
    typeof url === 'string' &&
    url.startsWith('/api/') &&
    (!options.method || options.method.toUpperCase() === 'GET')
  ) {
    var separator = url.includes('?') ? '&' : '?'
    args[0] = url + separator + '_t=' + new Date().getTime()
  }

  // Prevent ngrok browser warning from blocking API requests
  options.headers = options.headers || {}
  options.headers['ngrok-skip-browser-warning'] = 'true'
  args[1] = options

  var response = await originalFetch.apply(window, args)
  var contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    var clone = response.clone()
    try {
      var json = await clone.json()
      if (
        json &&
        typeof json === 'object' &&
        'success' in json &&
        ('data' in json || 'errors' in json)
      ) {
        var unwrappedData
        if (json.success) {
          unwrappedData = json.data !== null ? json.data : { message: json.message }
        } else {
          unwrappedData = {
            message: json.message,
            error: json.message,
            errors: json.errors,
          }
        }

        var newResponse = new Response(JSON.stringify(unwrappedData), {
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

document.addEventListener('auth:unauthorized', function () {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_name')
  localStorage.removeItem('user_role')
  localStorage.removeItem('user_fullname')
  window.location.replace('/campha/manager/login?reason=expired')
})

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
              {this.state.error && this.state.error.message
                ? this.state.error.message
                : 'Lỗi không xác định'}
            </p>
            <p className="text-xs text-gray-400 mb-6">Vui lòng tải lại trang để tiếp tục.</p>
            <button
              onClick={function () {
                window.location.reload()
              }}
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

function RequireAuth({ children }) {
  var token = localStorage.getItem('auth_token')
  if (!token) {
    window.location.replace('/campha/manager/login')
    return null
  }
  return children
}

// Yêu cầu role Admin — non-admin chỉ được đổi mật khẩu
function RequireAdmin({ children }) {
  var token = localStorage.getItem('auth_token')
  var role = localStorage.getItem('user_role')
  if (!token) {
    window.location.replace('/campha/manager/login')
    return null
  }
  if (role !== 'Admin') {
    window.location.replace('/campha/manager/change-password')
    return null
  }
  return children
}

// ─── Root Component ─────────────────────────────────────────────────────────
function Root() {
  var path = window.location.pathname

  if (path === '/campha/manager/login' || path === '/campha/manager/login/') {
    if (localStorage.getItem('auth_token')) {
      window.location.replace('/campha/manager/schedules')
      return null
    }
    return <AdminLogin />
  }

  if (path === '/campha/manager/accounts' || path === '/campha/manager/accounts/') {
    return (
      <RequireAdmin>
        <AdminAccounts />
      </RequireAdmin>
    )
  }

  if (path === '/campha/manager/schedules' || path === '/campha/manager/schedules/') {
    return (
      <RequireAdmin>
        <AdminSchedules />
      </RequireAdmin>
    )
  }

  if (path === '/campha/manager/change-password' || path === '/campha/manager/change-password/') {
    return (
      <RequireAuth>
        <AdminChangePassword />
      </RequireAuth>
    )
  }

  if (path === '/campha/manager/departments' || path === '/campha/manager/departments/') {
    return (
      <RequireAdmin>
        <AdminDepartments />
      </RequireAdmin>
    )
  }

  if (path === '/campha/manager/employees' || path === '/campha/manager/employees/') {
    return (
      <RequireAdmin>
        <AdminEmployees />
      </RequireAdmin>
    )
  }

  if (path === '/campha/manager/notifications' || path === '/campha/manager/notifications/') {
    return (
      <RequireAdmin>
        <AdminNotifications />
      </RequireAdmin>
    )
  }

  if (path === '/campha/manager/holidays' || path === '/campha/manager/holidays/') {
    return (
      <RequireAdmin>
        <AdminHolidays />
      </RequireAdmin>
    )
  }

  if (path === '/campha/search' || path === '/campha/search/') {
    return <SearchSchedule />
  }

  return <WorkSchedule />
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <Root />
    <Toaster position="top-right" richColors />
  </ErrorBoundary>
)
