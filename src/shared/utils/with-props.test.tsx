import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, forwardRef, memo, useState } from 'react';
import type { Ref } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { IWithChild } from './props';
import { withProps } from './with-props';

interface ICounterProps extends IWithChild {
  label: string;
  onClick?: () => void;
  ref?: Ref<HTMLButtonElement>;
}

function Counter({ label, children, onClick, ref }: ICounterProps) {
  const [count, setCount] = useState(0);
  return (
    <button
      ref={ref}
      onClick={() => {
        setCount(count + 1);
        onClick?.();
      }}
    >
      {label}: {children} {count}
    </button>
  );
}

describe('withProps', () => {
  it('binds presets, passes children and callbacks, and preserves state on rerender', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const BoundCounter = withProps(Counter, { label: 'Tasks' });
    const { rerender } = render(
      <BoundCounter onClick={onClick}>Open</BoundCounter>,
    );
    await user.click(screen.getByRole('button', { name: 'Tasks: Open 0' }));
    expect(onClick).toHaveBeenCalledOnce();
    rerender(<BoundCounter onClick={onClick}>Done</BoundCounter>);
    expect(screen.getByRole('button')).toHaveTextContent('Tasks: Done 1');
  });

  it('supports composition and fully bound props', () => {
    const LabeledCounter = withProps(Counter, { label: 'Tasks' });
    const BoundCounter = withProps(LabeledCounter, { children: 'Open' });
    render(<BoundCounter />);
    expect(screen.getByRole('button')).toHaveTextContent('Tasks: Open 0');
  });

  it('preserves refs through memo and forwardRef components', () => {
    const ForwardedCounter = memo(
      forwardRef<HTMLButtonElement, ICounterProps>((props, ref) => (
        <Counter {...props} ref={ref} />
      )),
    );
    const BoundCounter = withProps(ForwardedCounter, { label: 'Tasks' });
    const ref = createRef<HTMLButtonElement>();
    render(<BoundCounter ref={ref}>Open</BoundCounter>);
    expect(ref.current).toBe(screen.getByRole('button'));
    ref.current?.focus();
    expect(screen.getByRole('button')).toHaveFocus();
  });

  it('keeps fixed props when untyped callers attempt to override them', () => {
    const BoundCounter = withProps(Counter, { label: 'Tasks' });
    // @ts-expect-error Fixed props are also protected from JavaScript callers at runtime.
    render(<BoundCounter label="Override">Open</BoundCounter>);
    expect(screen.getByRole('button')).toHaveTextContent('Tasks: Open 0');
  });

  it('snapshots the preset object when creating the component', () => {
    const presets = { label: 'Tasks' };
    const BoundCounter = withProps(Counter, presets);
    presets.label = 'Changed';
    render(<BoundCounter>Open</BoundCounter>);
    expect(screen.getByRole('button')).toHaveTextContent('Tasks: Open 0');
  });
});
