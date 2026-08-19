/* global CustomEvent */
export async function apiClient(url, options = {}) {
  // Tự động thêm Content-Type: application/json khi body là JSON string
  const headers = { ...(options.headers || {}) }
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  // Tự động đính JWT token từ localStorage vào header Authorization
  const token = localStorage.getItem('auth_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Ensure credentials are sent (for HttpOnly cookies)
  // AbortController timeout 15s — ngăn request treo vô hạn trên mạng 2G/Captive Portal
  const timeoutMs = options.timeoutMs ?? 15000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const fetchOptions = {
    ...options,
    headers,
    credentials: options.credentials || 'include',
    cache: options.cache || 'no-store',
    // Nếu caller đã truyền signal riêng thì dùng của caller, không override
    signal: options.signal ?? controller.signal,
  }

  let response
  try {
    response = await fetch(url, fetchOptions)
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Yêu cầu quá thời gian chờ (timeout). Vui lòng kiểm tra kết nối mạng.')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }

  // Xử lý 401: Thử refresh token (chỉ cho các API thông thường, không phải auth endpoints)
  if (response.status === 401) {
    // Auth endpoints: 401 là sai mật khẩu / hết hạn thông thường, không refresh
    if (url.includes('/api/auth/')) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || 'Sai tài khoản hoặc mật khẩu')
    }

    try {
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      })

      if (refreshResponse.ok) {
        // Gắn lại token nếu dùng header (dự phòng)
        const refreshData = await refreshResponse.json()
        if (refreshData.data && refreshData.data.token) {
          localStorage.setItem('auth_token', refreshData.data.token)

          if (!fetchOptions.headers) fetchOptions.headers = {}
          fetchOptions.headers['Authorization'] = `Bearer ${refreshData.data.token}`
        }

        // Gọi lại request ban đầu
        response = await fetch(url, fetchOptions)
      } else {
        document.dispatchEvent(new CustomEvent('auth:unauthorized'))
        throw new Error('Session expired')
      }
    } catch (err) {
      // Chỉ bắn unauthorized nếu chưa bắn ở trên (tránh duplicate)
      if (err.message !== 'Session expired') {
        console.error('[Auth] Silent refresh failed', err)
        document.dispatchEvent(new CustomEvent('auth:unauthorized'))
      }
      throw err
    }
  }

  // Nếu vẫn lỗi sau khi xử lý 401 hoặc lỗi khác (403, 500)
  if (!response.ok) {
    // Thử parse json nếu có
    let errorData = {}
    try {
      errorData = await response.json()
    } catch (e) {
      errorData = { message: response.statusText }
    }

    // Ném lỗi với message chuẩn
    const errorMessage = errorData.message || errorData.error || response.statusText
    throw new Error(errorMessage)
  }

  // Parse thành công (200-299)
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    const json = await response.json()

    // Unwrap ApiResponse<T>
    if (json && typeof json === 'object' && 'success' in json) {
      if (json.success) {
        // Trả về data (nếu null thì trả message)
        return json.data !== null ? json.data : { message: json.message }
      } else {
        // Nếu backend trả 200 OK nhưng success = false (một số logic cũ)
        const errorMsg = json.message || 'Lỗi hệ thống'
        throw new Error(errorMsg)
      }
    }
    return json
  }

  // Đối với các kiểu trả về khác (blob, text)
  return response
}
