import type { ReactNode } from 'react';

export interface IWithClassName {
  className?: string | undefined;
}

export interface IWithChild {
  children: ReactNode;
}
