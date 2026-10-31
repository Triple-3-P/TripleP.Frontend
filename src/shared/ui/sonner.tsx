'use client';

import type { CSSProperties } from 'react';
import { useTranslate } from '@tolgee/react';
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

interface IToasterProps extends ToasterProps {}
interface IToasterStyle extends CSSProperties {
  '--normal-bg': string;
  '--normal-text': string;
  '--normal-border': string;
  '--border-radius': string;
}
const toasterStyle: IToasterStyle = {
  '--normal-bg': 'var(--popover)',
  '--normal-text': 'var(--popover-foreground)',
  '--normal-border': 'var(--border)',
  '--border-radius': 'var(--radius)',
};

export function Toaster(props: IToasterProps) {
  const { t } = useTranslate();
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      closeButton
      containerAriaLabel={t('notifications.label')}
      toastOptions={{ closeButtonAriaLabel: t('notifications.dismiss') }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: (
          <Loader2Icon className="size-4 animate-spin motion-reduce:animate-none" />
        ),
      }}
      style={toasterStyle}
      {...props}
    />
  );
}
