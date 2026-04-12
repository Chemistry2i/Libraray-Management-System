export default function Badge({ children, variant = 'primary', size = 'md' }) {
  const variantClasses = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    danger: 'bg-danger text-white',
    light: 'bg-light text-dark border border-gray-300'
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  return (
    <span className={`inline-block rounded-full font-semibold ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  )
}
