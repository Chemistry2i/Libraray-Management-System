import { useState } from 'react'

export function PasswordStrengthMeter({ password }) {
  const evaluateStrength = (pass) => {
    let score = 0
    if (!pass) return { score: 0, label: '', color: 'bg-gray-200' }
    if (pass.length > 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++

    switch (score) {
      case 0:
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-red-400' }
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-orange-400' }
      case 3:
        return { score: 3, label: 'Good', color: 'bg-blue-400' }
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-green-400' }
      default:
        return { score: 0, label: '', color: 'bg-gray-200' }
    }
  }

  const { score, label, color } = evaluateStrength(password)

  return (
    <div className="mt-2 text-sm">
      <div className="flex gap-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 transition-colors duration-500 ${i < score ? color : 'bg-transparent'}`}
          />
        ))}
      </div>
      {password && (
        <p className="mt-1 text-xs text-gray-500 text-right font-medium">
          {label}
        </p>
      )}
    </div>
  )
}