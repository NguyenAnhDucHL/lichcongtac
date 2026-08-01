import React from 'react'

export default function AdminHeader() {
  const currentPath = window.location.pathname

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_role')
    window.location.href = '/campha/manager/login'
  }

  const isActive = (href) => {
    if (!href || href === '#' || href === null) return false
    return currentPath === href || currentPath === href + '/'
  }

  const isAdminActive = () => {
    return ['/campha/manager/accounts', '/campha/manager/departments', '/campha/manager/employees'].some(
      (p) => currentPath === p || currentPath === p + '/'
    )
  }

  const navItems = [
    {
      label: 'QUẢN TRỊ',
      subItems: [
        { label: 'Quản trị tài khoản', href: '/campha/manager/accounts' },
        { label: 'Quản trị phòng ban', href: '/campha/manager/departments' },
        { label: 'Quản trị nhân viên', href: '/campha/manager/employees' }
      ]
    },
    { label: 'LỊCH CÔNG TÁC', href: '/campha/' },
    { label: 'QUẢN TRỊ LỊCH', href: '/campha/manager/schedules' },
    { label: 'THÔNG BÁO', href: '#' },
    { label: 'NGÀY LỄ', href: '#' },
    { label: 'ĐỔI MẬT KHẨU', href: '/campha/manager/change-password' },
    { label: 'ĐĂNG XUẤT', href: null, onClick: handleLogout },
  ]

  const activeClass = 'bg-[#1d5792] border-b-2 border-white text-white'
  const baseClass = 'px-6 py-2.5 text-white text-[13px] font-bold uppercase hover:bg-[#46b8da] transition-colors'

  return (
    <>
      {/* Header */}
      <div className="max-w-[1000px] mx-auto bg-white relative flex flex-col justify-center min-h-[90px] overflow-hidden">
        <div className="absolute inset-0 z-0 flex justify-start">
          <img
            src="/assets/header-banner.jpg"
            alt="Lịch Công Tác"
            className="h-full w-auto max-h-[90px] object-contain"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>
        <div className="relative z-10 pl-[130px] py-2">
          <h1 className="text-[24px] font-bold text-[#1d5792] uppercase m-0 leading-tight">LỊCH CÔNG TÁC</h1>
          <h1 className="text-[18px] font-bold text-[#c8102e] uppercase m-0 leading-tight mt-1">UBND PHƯỜNG CẨM PHẢ</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-[#5bc0de] relative z-50">
        <div className="max-w-[1000px] mx-auto flex flex-wrap justify-center sm:justify-start">
          {navItems.map((item, idx) => {
            if (item.subItems) {
              const active = isAdminActive()
              return (
                <div key={idx} className="relative group">
                  <button className={`${baseClass} bg-transparent border-none cursor-pointer h-full ${active ? activeClass : ''}`}>
                    {item.label}
                  </button>
                  <div className="hidden group-hover:block absolute left-0 top-full bg-white shadow-lg border border-gray-200 min-w-[200px] py-1 z-50">
                    {item.subItems.map((sub, sidx) => (
                      <a
                        key={sidx}
                        href={sub.href}
                        className={`block px-4 py-2 hover:bg-[#5bc0de] hover:text-white transition-colors ${isActive(sub.href) ? 'bg-[#5bc0de] text-white font-bold' : 'text-gray-800'}`}
                      >
                        {sub.label}
                      </a>
                    ))}
                  </div>
                </div>
              )
            }

            return item.onClick ? (
              <button
                key={idx}
                onClick={item.onClick}
                className={`${baseClass} bg-transparent border-none cursor-pointer h-full`}
              >
                {item.label}
              </button>
            ) : (
              <a
                key={idx}
                href={item.href}
                className={`${baseClass} h-full flex items-center ${isActive(item.href) ? activeClass : ''}`}
              >
                {item.label}
              </a>
            )
          })}
        </div>
      </nav>
    </>
  )
}
