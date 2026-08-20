import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold tracking-[0.01em] ring-offset-background transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "border border-primary/40 bg-primary text-primary-foreground shadow-[0_12px_28px_hsl(var(--primary)/0.22)] hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_16px_34px_hsl(var(--primary)/0.30)]",
        destructive:
          "border border-destructive/40 bg-destructive text-destructive-foreground shadow-[0_10px_24px_hsl(var(--destructive)/0.18)] hover:-translate-y-0.5 hover:bg-destructive/90",
        outline:
          "border border-border bg-card/60 text-foreground shadow-[inset_0_1px_0_hsl(var(--foreground)/0.035)] backdrop-blur-sm hover:-translate-y-0.5 hover:border-primary/55 hover:bg-primary/10 hover:text-foreground",
        secondary:
          "border border-border/80 bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:bg-secondary/80",
        ghost: "text-muted-foreground hover:bg-primary/10 hover:text-primary",
        link: "h-auto p-0 text-primary underline-offset-4 hover:text-primary/80 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-11 px-7 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
