'use client';

import type * as React from 'react';
import { cn } from '@/shared/lib/cn';
import { XIcon } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';

interface IDialogProps extends React.ComponentProps<
  typeof DialogPrimitive.Root
> {}

function Dialog({ ...props }: IDialogProps) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

interface IDialogTriggerProps extends React.ComponentProps<
  typeof DialogPrimitive.Trigger
> {}

function DialogTrigger({ ...props }: IDialogTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

interface IDialogPortalProps extends React.ComponentProps<
  typeof DialogPrimitive.Portal
> {}

function DialogPortal({ ...props }: IDialogPortalProps) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

interface IDialogCloseProps extends React.ComponentProps<
  typeof DialogPrimitive.Close
> {}

function DialogClose({ ...props }: IDialogCloseProps) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

interface IDialogOverlayProps extends React.ComponentProps<
  typeof DialogPrimitive.Overlay
> {}

function DialogOverlay({ className, ...props }: IDialogOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none',
        className,
      )}
      {...props}
    />
  );
}

interface IDialogContentProps extends React.ComponentProps<
  typeof DialogPrimitive.Content
> {
  showCloseButton?: boolean;
  closeLabel: string;
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  closeLabel,
  ...props
}: IDialogContentProps) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg max-h-[90dvh] overflow-y-auto text-foreground motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">{closeLabel}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

interface IDialogHeaderProps extends React.ComponentProps<'div'> {}

function DialogHeader({ className, ...props }: IDialogHeaderProps) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

interface IDialogTitleProps extends React.ComponentProps<
  typeof DialogPrimitive.Title
> {}

function DialogTitle({ className, ...props }: IDialogTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  );
}

interface IDialogDescriptionProps extends React.ComponentProps<
  typeof DialogPrimitive.Description
> {}

function DialogDescription({ className, ...props }: IDialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
