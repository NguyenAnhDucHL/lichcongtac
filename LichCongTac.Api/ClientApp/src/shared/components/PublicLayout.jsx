/* Shared public-facing Header + Nav used by WorkSchedule and SearchSchedule */
import { useState } from 'react'
import { Menu } from 'lucide-react'

const PUBLIC_NAV = [
  { label: 'TRANG CHỦ', href: '/campha/' },
  {
    label: 'QUẢN LÝ VĂN BẢN ĐIỀU HÀNH',
    href: 'https://congchuc.quangninh.gov.vn/sso/Login.aspx',
    target: '_blank',
  },
  {
    label: 'CỔNG THÔNG TIN',
    href: 'https://quangninh.gov.vn/Trang/Default.aspx',
    target: '_blank',
  },
  {
    label: 'THƯ ĐIỆN TỬ',
    href: 'https://mail.quangninh.gov.vn/owa/auth/logon.aspx?replaceCurrent=1&url=https%3a%2f%2fmail.quangninh.gov.vn%2fowa%2f',
    target: '_blank',
  },
  { label: 'TÌM KIẾM', href: '/campha/search' },
  { label: 'QUẢN TRỊ', href: '/campha/manager/login' },
]

export function PublicLayout({ children, activeHref, todayHoliday }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans text-sm text-gray-800">
      {/* Header Image */}
      <div className="max-w-6xl mx-auto bg-white relative flex flex-col justify-center min-h-[86px] overflow-hidden">
        <div className="absolute inset-0 z-0 flex justify-start">
          <img
            src="/assets/header-banner.jpg"
            alt="Lịch Công Tác UBND Phường Cẩm Phả"
            className="h-full w-auto max-h-[86px] object-contain"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </div>
        <div className="relative z-10 pl-[90px] md:pl-[130px] py-2 pr-2">
          <h1 className="text-[18px] sm:text-[20px] md:text-[24px] font-bold text-[#1d5792] uppercase m-0 leading-tight tracking-wide">
            LỊCH CÔNG TÁC
          </h1>
          <h1 className="text-[13px] sm:text-[15px] md:text-[18px] font-bold text-[#c8102e] uppercase m-0 leading-tight tracking-wide mt-1">
            UBND PHƯỜNG CẨM PHẢ
          </h1>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-6xl mx-auto">
        <nav className="bg-[#1d5792] shadow-md relative z-20">
          <div className="flex flex-col md:flex-row md:items-center">
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
              {PUBLIC_NAV.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target={item.target || '_self'}
                  rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                  className={`px-6 py-3 border-t border-[#154374] md:border-none text-white text-[15px] font-bold uppercase hover:bg-[#154374] transition-colors ${activeHref === item.href ? 'bg-[#154374]' : ''}`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>
      </div>

      {/* Holiday Marquee */}
      {todayHoliday && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#fcf8e3] text-[#c8102e] py-1.5 border-b border-[#faebcc] overflow-hidden whitespace-nowrap relative">
            <marquee scrollamount="6" className="text-[13px] font-semibold tracking-wide">
              ⚛ {todayHoliday.content} ⚛
            </marquee>
          </div>
        </div>
      )}

      {children}

      {/* Footer */}
      <div className="max-w-6xl mx-auto">
        <footer className="bg-[#1d8fe8] text-white text-center py-2 text-xs mt-8">
          Bản quyền thuộc về UBND phường Cẩm Phả
        </footer>
      </div>
    </div>
  )
}
