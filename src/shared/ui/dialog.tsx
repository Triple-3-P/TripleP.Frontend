'use client';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { X } from 'lucide-react';
import type { IWithChild } from '@/shared/utils/props';

interface IDialogContentProps extends IWithChild {
  title: string;
  description: string;
  closeLabel: string;
  onCloseAutoFocus?: (event: Event) => void;
}
export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export function DialogContent({
  children,
  title,
  description,
  closeLabel,
  onCloseAutoFocus,
}: IDialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <DialogPrimitive.Content
        onCloseAutoFocus={onCloseAutoFocus}
        className="fixed top-1/2 left-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border bg-background p-6 text-foreground shadow-xl"
      >
        <DialogPrimitive.Title className="pr-8 text-2xl font-semibold">
          {title}
        </DialogPrimitive.Title>
        <DialogPrimitive.Description className="mt-2 mb-6 text-sm text-muted-foreground">
          {description}
        </DialogPrimitive.Description>
        {children}
        <DialogPrimitive.Close
          className="absolute top-4 right-4 rounded-sm p-1 focus-visible:outline-2 focus-visible:outline-ring"
          aria-label={closeLabel}
        >
          <X className="size-5" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
