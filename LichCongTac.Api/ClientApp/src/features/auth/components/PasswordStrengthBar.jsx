import { CheckCircle2, XCircle } from 'lucide-react'

const CHECKS = [
  { label: 'Ít nhất 8 ký tự', test: (p) => p.length >= 8 },
  { label: '1 chữ HOA (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: '1 chữ thường (a-z)', test: (p) => /[a-z]/.test(p) },
  { label: '1 chữ số (0-9)', test: (p) => /[0-9]/.test(p) },
  { label: '1 ký tự đặc biệt (!@#$...)', test: (p) => /[!@#$%^&*()_+\-=[\]{}|;':",./|<>?]/.test(p) },
]
const COLORS = ['#ef4444', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']
const LABELS = ['', 'Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh']

export function PasswordStrengthBar({ password }) {
  const checks = CHECKS.map((c) => ({ label: c.label, ok: c.test(password) }))
  const score = checks.filter((c) => c.ok).length

  if (!password) return null

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? COLORS[score] : '#e5e7eb' }} />
        ))}
      </div>
      {score > 0 && (
        <p className="text-xs font-medium" style={{ color: COLORS[score] }}>{LABELS[score]}</p>
      )}
      <ul className="space-y-1 mt-2">
        {checks.map((c) => (
          <li key={c.label} className="flex items-center gap-1.5 text-xs">
            {c.ok
              ? <CheckCircle2 size={13} className="text-green-500 shrink-0" />
              : <XCircle size={13} className="text-gray-300 shrink-0" />}
            <span className={c.ok ? 'text-green-700' : 'text-gray-400'}>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
