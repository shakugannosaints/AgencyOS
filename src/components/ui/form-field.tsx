import { cn } from '@/lib/utils'
import type { FieldError } from 'react-hook-form'

interface FormFieldErrorProps {
  error?: FieldError
  className?: string
}

/**
 * 表单字段错误提示组件
 * 在输入框下方显示验证错误信息
 */
export function FormFieldError({ error, className }: FormFieldErrorProps) {
  if (!error?.message) return null

  return (
    <p
      className={cn(
        'mt-1 text-xs text-agency-magenta animate-fade-in',
        className
      )}
      role="alert"
    >
      {error.message}
    </p>
  )
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError
  label?: string
  hint?: string
}

/**
 * 带错误状态的表单输入框
 */
export function FormInput({
  error,
  label,
  hint,
  className,
  ...props
}: FormInputProps) {
  return (
    <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
      {label && <span>{label}</span>}
      <input
        className={cn(
          'w-full border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none',
          'focus:outline-none focus:ring-1 focus:ring-agency-cyan/50',
          error
            ? 'border-agency-magenta focus:ring-agency-magenta/50'
            : 'border-agency-border',
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p className="text-[0.65rem] text-agency-muted/70 normal-case">{hint}</p>
      )}
      <FormFieldError error={error} />
    </label>
  )
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: FieldError
  label?: string
  options: { value: string; label: string }[]
}

/**
 * 带错误状态的表单选择框
 */
export function FormSelect({
  error,
  label,
  options,
  className,
  ...props
}: FormSelectProps) {
  return (
    <label className="space-y-1 text-xs uppercase tracking-[0.3em] text-agency-muted">
      {label && <span>{label}</span>}
      <select
        className={cn(
          'w-full border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none',
          'focus:outline-none focus:ring-1 focus:ring-agency-cyan/50',
          error
            ? 'border-agency-magenta focus:ring-agency-magenta/50'
            : 'border-agency-border',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <FormFieldError error={error} />
    </label>
  )
}
