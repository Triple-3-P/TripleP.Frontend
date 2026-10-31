import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

interface IInputProps extends ComponentProps<'input'> {}
export function Input({ className, ...props }: IInputProps) {
  return (
    <input
      className={cn(
        'flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  );
}
