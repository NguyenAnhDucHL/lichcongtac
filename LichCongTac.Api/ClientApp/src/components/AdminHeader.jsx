import React, { useState } from 'react'

export default function AdminHeader() {
  const [openDropdown, setOpenDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_name')
    localStorage.removeItem('user_role')
    window.location.href = '/campha/manager/login'
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

  return (
    <>
      {/* Header */}
      <div className="max-w-[1000px] mx-auto bg-white flex justify-start pt-2">
        <img
          src="/assets/header-banner.png"
          alt="Lịch Công Tác"
          className="h-auto max-h-[90px] object-contain"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.nextElementSibling.style.display = 'block'
          }}
        />
        <div style={{ display: 'none' }} className="py-4">
          <h1 className="text-xl font-bold text-[#1d5792]">PHẦN MỀM QUẢN LÝ</h1>
          <h1 className="text-2xl font-bold text-[#c8102e]">LỊCH CÔNG TÁC</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-[#5bc0de] relative z-50">
        <div className="max-w-[1000px] mx-auto flex flex-wrap justify-center sm:justify-start">
          {navItems.map((item, idx) => {
            if (item.subItems) {
              return (
                <div
                  key={idx}
                  className="relative group"
                >
                  <button className="px-6 py-2.5 text-white text-[13px] font-bold uppercase hover:bg-[#46b8da] transition-colors bg-transparent border-none cursor-pointer h-full">
                    {item.label}
                  </button>
                  <div className="hidden group-hover:block absolute left-0 top-full bg-white shadow-lg border border-gray-200 min-w-[200px] py-1 z-50">
                    {item.subItems.map((sub, sidx) => (
                      <a
                        key={sidx}
                        href={sub.href}
                        className="block px-4 py-2 text-gray-800 hover:bg-[#5bc0de] hover:text-white transition-colors"
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
                className="px-6 py-2.5 text-white text-[13px] font-bold uppercase hover:bg-[#46b8da] transition-colors bg-transparent border-none cursor-pointer h-full"
              >
                {item.label}
              </button>
            ) : (
              <a
                key={idx}
                href={item.href}
                className="px-6 py-2.5 text-white text-[13px] font-bold uppercase hover:bg-[#46b8da] transition-colors h-full flex items-center"
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
