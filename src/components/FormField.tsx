type FormFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
  hint?: string
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  hint,
}: FormFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-ink/60">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        disabled={disabled}
        className="rounded-md border border-ink/10 bg-white px-3 py-2 text-base text-ink shadow-inner focus:border-ink/40 focus:outline-none disabled:bg-sand/20 sm:text-sm"
      />
      {hint ? <span className="text-xs text-ink/50">{hint}</span> : null}
    </label>
  )
}

export default FormField
