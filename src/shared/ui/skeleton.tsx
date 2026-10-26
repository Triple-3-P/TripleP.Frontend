import type * as React from 'react';
import { cn } from '@/shared/lib/cn';

interface ISkeletonProps extends React.ComponentProps<'div'> {}

function Skeleton({ className, ...props }: ISkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-accent', className)}
      {...props}
    />
  );
}

export { Skeleton };
