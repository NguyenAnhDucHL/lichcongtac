/* global CustomEvent */
export async function apiClient(url, options = {}) {
  // Ensure credentials are sent (for HttpOnly cookies)
  const fetchOptions = {
    ...options,
    credentials: options.credentials || 'include',
  }

  let response = await fetch(url, fetchOptions)

  // Xử lý 401: Thử refresh token
  if (response.status === 401) {
    if (url.includes('/api/auth/refresh')) {
      document.dispatchEvent(new CustomEvent('auth:unauthorized'))
      throw new Error('Unauthorized')
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
      console.error('[Auth] Silent refresh failed', err)
      document.dispatchEvent(new CustomEvent('auth:unauthorized'))
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
