'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-extrabold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f0c66d]/60',
  {
    variants: {
      variant: {
        default: 'bg-[#e72d47] text-white shadow-[0_18px_36px_rgba(231,45,71,0.24)] hover:bg-[#f13a53]',
        gold: 'bg-[#f0c66d] text-[#241404] hover:bg-[#ffd98a]',
        secondary: 'bg-[#2a272f] text-[#faf7f2] hover:bg-[#34313a]',
        ghost: 'bg-transparent text-[#f0c66d] hover:bg-[#f0c66d]/10',
        danger: 'bg-[#5d111c] text-[#ffd0d6] hover:bg-[#771927]'
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-5'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { buttonVariants };
