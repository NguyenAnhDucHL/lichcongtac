import React, { useState } from 'react'
import { Menu, ChevronDown, ChevronUp } from 'lucide-react'

export default function AdminHeader() {
  const currentPath = window.location.pathname
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState(null)

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
    return [
      '/campha/manager/accounts',
      '/campha/manager/departments',
      '/campha/manager/employees',
    ].some((p) => currentPath === p || currentPath === p + '/')
  }

  const navItems = [
    {
      label: 'QUẢN TRỊ',
      subItems: [
        { label: 'Quản trị tài khoản', href: '/campha/manager/accounts' },
        { label: 'Quản trị phòng ban', href: '/campha/manager/departments' },
        { label: 'Quản trị nhân viên', href: '/campha/manager/employees' },
      ],
    },
    { label: 'LỊCH CÔNG TÁC', href: '/campha/' },
    { label: 'QUẢN TRỊ LỊCH', href: '/campha/manager/schedules' },
    { label: 'THÔNG BÁO', href: '/campha/manager/notifications' },
    { label: 'NGÀY LỄ', href: '/campha/manager/holidays' },
    { label: 'ĐỔI MẬT KHẨU', href: '/campha/manager/change-password' },
    { label: 'ĐĂNG XUẤT', href: null, onClick: handleLogout },
  ]

  const activeClass = 'bg-[#1d5792] md:border-b-2 border-white text-white'
  const baseClass =
    'px-6 py-3 border-t border-[#46b8da] md:border-none text-white text-[13px] md:text-xs font-bold uppercase hover:bg-[#46b8da] transition-colors w-full md:w-auto text-left md:text-center block md:inline-block'

  return (
    <>
      {/* Header */}
      <div className="max-w-[1000px] mx-auto bg-white relative flex flex-col justify-center min-h-[90px] overflow-hidden">
        <div className="absolute inset-0 z-0 flex justify-start">
          <img
            src="/assets/header-banner.jpg"
            alt="Lịch Công Tác"
            className="h-full w-auto max-h-[90px] object-contain"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </div>
        <div className="relative z-10 pl-[90px] md:pl-[130px] py-2 pr-2">
          <h1 className="text-[18px] sm:text-[20px] md:text-[24px] font-bold text-[#1d5792] uppercase m-0 leading-tight">
            LỊCH CÔNG TÁC
          </h1>
          <h1 className="text-[13px] sm:text-[15px] md:text-[18px] font-bold text-[#c8102e] uppercase m-0 leading-tight mt-1">
            UBND PHƯỜNG CẨM PHẢ
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-[#5bc0de] relative z-50">
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row md:items-center">
          {/* Mobile Menu Toggle */}
          <div
            className="md:hidden flex justify-between items-center px-4 py-3 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="text-white font-serif font-bold uppercase text-base tracking-wide">
              MENU
            </span>
            <Menu className="text-white w-7 h-7" />
          </div>

          <div
            className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row w-full`}
          >
            {navItems.map((item, idx) => {
              if (item.subItems) {
                const active = isAdminActive()
                const isOpen = openDropdown === idx
                return (
                  <div key={idx} className="relative group w-full md:w-auto">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        if (window.innerWidth < 768) {
                          setOpenDropdown(isOpen ? null : idx)
                        }
                      }}
                      className={`${baseClass} bg-transparent border-none cursor-pointer h-full ${active ? activeClass : ''} w-full flex items-center justify-between md:block`}
                    >
                      {item.label}
                      <span className="md:hidden">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </button>
                    <div
                      className={`${isOpen ? 'block' : 'hidden'} md:group-hover:block md:absolute left-0 top-full bg-[#31b0d5] md:bg-white md:shadow-lg border-t border-[#2a9bba] md:border-gray-200 min-w-[200px] md:py-1 z-50 w-full md:w-auto`}
                    >
                      {item.subItems.map((sub, sidx) => (
                        <a
                          key={sidx}
                          href={sub.href}
                          className={`block px-8 py-3 md:px-4 md:py-2 border-b border-[#2a9bba] md:border-none md:border-t md:border-gray-100 hover:bg-[#2a9bba] md:hover:bg-[#5bc0de] hover:text-white transition-colors ${isActive(sub.href) ? 'bg-[#2a9bba] md:bg-[#5bc0de] text-white font-bold' : 'text-white md:text-gray-800'}`}
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
        </div>
      </nav>
    </>
  )
}
