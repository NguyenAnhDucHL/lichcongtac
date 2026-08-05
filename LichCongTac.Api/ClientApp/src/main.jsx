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
import { SignalRProvider } from './contexts/SignalRContext.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom'
import './styles/globals.css'

// ─── Global Request Queue for Inline Login Modal ────────────────────────────
let isLoginModalOpen = false
let failedRequestQueue = []

const processRequestQueue = (error, token = null) => {
  failedRequestQueue.forEach((prom) => {
    if (error) {
      prom.resolve(prom.originalResponse)
    } else {
      prom.resolve(token)
    }
  })
  failedRequestQueue = []
}

document.addEventListener('auth:login_success', (e) => {
  isLoginModalOpen = false
  processRequestQueue(null, e.detail.token)
})

document.addEventListener('auth:login_cancel', () => {
  isLoginModalOpen = false
  processRequestQueue(new Error('Canceled'))
})

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
  if (response.status === 401 && !url.includes('/api/auth/refresh')) {
    const token = localStorage.getItem('auth_token')
    const refreshToken = localStorage.getItem('refresh_token')
    if (token && refreshToken) {
      try {
        const refreshRes = await originalFetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, refreshToken }),
        })
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json()
          if (refreshData.success && refreshData.data?.token) {
            localStorage.setItem('auth_token', refreshData.data.token)
            if (refreshData.data.refreshToken) {
              localStorage.setItem('refresh_token', refreshData.data.refreshToken)
            }
            // Retry the original request using window.fetch to ensure it gets unwrapped
            options.headers = options.headers || {}
            options.headers['Authorization'] = 'Bearer ' + refreshData.data.token
            args[1] = options
            return await window.fetch.apply(window, args)
          }
        }
      } catch (err) {
        console.error('Lỗi khi làm mới token:', err)
      }
    }
    
    // Nếu cả Refresh Token cũng hết hạn -> Hiện Modal Login và đưa Request vào Hàng Đợi (Queue)
    if (!isLoginModalOpen) {
      isLoginModalOpen = true
      document.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    return new Promise((resolve) => {
      failedRequestQueue.push({ resolve, originalResponse: response })
    }).then((newToken) => {
      if (newToken && typeof newToken === 'string') {
        options.headers = options.headers || {}
        options.headers['Authorization'] = 'Bearer ' + newToken
        args[1] = options
        return window.fetch.apply(window, args)
      }
      return response // Bị hủy đăng nhập thì trả về lỗi 401 gốc
    })
  }
  return response
}

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
  const { token, loading } = useAuth()
  if (loading) return null
  if (!token) {
    return <Navigate to="/campha/manager/login" replace />
  }
  return children
}

function RequireAdmin({ children }) {
  const { token, user, loading } = useAuth()
  if (loading) return null
  if (!token) {
    return <Navigate to="/campha/manager/login" replace />
  }
  if (user?.role !== 'Admin') {
    return <Navigate to="/campha/manager/change-password" replace />
  }
  return children
}

const router = createBrowserRouter([
  {
    path: '/campha/',
    element: <WorkSchedule />,
  },
  {
    path: '/campha/search',
    element: <SearchSchedule />,
  },
  {
    path: '/campha/manager/login',
    element: <AdminLogin />,
  },
  {
    path: '/campha/manager',
    element: (
      <RequireAuth>
        <Outlet />
      </RequireAuth>
    ),
    children: [
      {
        path: 'change-password',
        element: <AdminChangePassword />,
      },
      {
        path: 'schedules',
        element: (
          <RequireAdmin>
            <AdminSchedules />
          </RequireAdmin>
        ),
      },
      {
        path: 'accounts',
        element: (
          <RequireAdmin>
            <AdminAccounts />
          </RequireAdmin>
        ),
      },
      {
        path: 'departments',
        element: (
          <RequireAdmin>
            <AdminDepartments />
          </RequireAdmin>
        ),
      },
      {
        path: 'employees',
        element: (
          <RequireAdmin>
            <AdminEmployees />
          </RequireAdmin>
        ),
      },
      {
        path: 'notifications',
        element: (
          <RequireAdmin>
            <AdminNotifications />
          </RequireAdmin>
        ),
      },
      {
        path: 'holidays',
        element: (
          <RequireAdmin>
            <AdminHolidays />
          </RequireAdmin>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/campha/manager/schedules" replace />,
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/campha/" replace />
  }
])

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <AuthProvider>
      <SignalRProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </SignalRProvider>
    </AuthProvider>
  </ErrorBoundary>
)
