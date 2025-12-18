import { forwardRef } from "react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const Button = forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50"
  
  const variants = {
    default: "bg-basho-earth text-white hover:bg-basho-earth/90 shadow-sm",
    outline: "border border-basho-earth/30 bg-transparent shadow-sm hover:bg-basho-minimal text-basho-earth",
    ghost: "hover:bg-basho-minimal text-basho-earth",
    link: "text-basho-earth underline-offset-4 hover:underline"
  }

  const sizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9"
  }

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }