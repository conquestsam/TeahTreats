import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-black leading-none', {
  variants: {
    variant: {
      default: 'border-[#f0c66d]/20 bg-[#f0c66d]/15 text-[#ffd98a]',
      red: 'border-[#e72d47]/30 bg-[#e72d47]/15 text-[#ff9caf]',
      green: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
      dark: 'border-white/10 bg-black/30 text-[#faf7f2]'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, className }))} {...props} />;
}
