import type * as React from 'react';
import { cn } from '@/shared/lib/cn';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { Slot } from 'radix-ui';

interface IBreadcrumbProps extends React.ComponentProps<'nav'> {}

function Breadcrumb({ ...props }: IBreadcrumbProps) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

interface IBreadcrumbListProps extends React.ComponentProps<'ol'> {}

function BreadcrumbList({ className, ...props }: IBreadcrumbListProps) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        'flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2.5',
        className,
      )}
      {...props}
    />
  );
}

interface IBreadcrumbItemProps extends React.ComponentProps<'li'> {}

function BreadcrumbItem({ className, ...props }: IBreadcrumbItemProps) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  );
}

interface IBreadcrumbLinkProps extends React.ComponentProps<'a'> {
  asChild?: boolean;
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: IBreadcrumbLinkProps) {
  const Comp = asChild ? Slot.Root : 'a';

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn('transition-colors hover:text-foreground', className)}
      {...props}
    />
  );
}

interface IBreadcrumbPageProps extends React.ComponentProps<'span'> {}

function BreadcrumbPage({ className, ...props }: IBreadcrumbPageProps) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn('font-normal text-foreground', className)}
      {...props}
    />
  );
}

interface IBreadcrumbSeparatorProps extends React.ComponentProps<'li'> {}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: IBreadcrumbSeparatorProps) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn('[&>svg]:size-3.5', className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}

interface IBreadcrumbEllipsisProps extends React.ComponentProps<'span'> {}

function BreadcrumbEllipsis({ className, ...props }: IBreadcrumbEllipsisProps) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn('flex size-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
