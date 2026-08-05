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
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/campha/" replace />,
  },
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
