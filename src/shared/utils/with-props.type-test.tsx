// Compile-time regression cases, checked by npm run typecheck (tsc).
import { createRef, forwardRef, memo } from 'react';
import type { Ref } from 'react';

import type { IWithChild, IWithClassName } from './props';
import { withProps } from './with-props';

interface IExampleProps extends IWithChild, IWithClassName {
  label: string;
  count: number;
  mode?: 'compact' | 'full';
  onChange?: (value: number) => void;
  ref?: Ref<HTMLDivElement>;
}

function Example({ label, count, children, ref }: IExampleProps) {
  return (
    <div ref={ref}>
      {label}
      {count}
      {children}
    </div>
  );
}

type TChoiceProps =
  | { kind: 'link'; href: string; disabled?: never }
  | { kind: 'button'; disabled: boolean; href?: never };

function Choice(props: TChoiceProps) {
  return props.kind === 'link' ? (
    <a href={props.href} />
  ) : (
    <button disabled={props.disabled} />
  );
}

const ForwardedExample = memo(
  forwardRef<HTMLDivElement, IExampleProps>((props, ref) => (
    <Example {...props} ref={ref} />
  )),
);

// This function is deliberately never executed: invalid calls must fail compilation.
export function verifyWithPropsTypes() {
  const Bound = withProps(Example, { label: 'Tasks' });
  const AllBound = withProps(Example, {
    label: 'Tasks',
    count: 1,
    children: 'Open',
  });
  const Composed = withProps(Bound, { count: 1 });
  const Unbound = withProps(Example, {});
  const OptionalBound = withProps(Example, { mode: 'compact' });
  const WithChildren = withProps(Example, { children: <span>Open</span> });
  const WithCallback = withProps(Example, {
    onChange: (value) => value.toFixed(),
  });
  const RefComponent = withProps(ForwardedExample, { label: 'Tasks' });
  const BoundLink = withProps(Choice, { kind: 'link' });
  const CompleteLink = withProps(Choice, { kind: 'link', href: '/' });
  const UnboundChoice = withProps(Choice, {});

  // @ts-expect-error Wrong preset value type.
  withProps(Example, { count: 'one' });
  // @ts-expect-error Unknown preset name.
  withProps(Example, { unknown: true });
  const extraPreset = { label: 'Tasks', unknown: true };
  // @ts-expect-error Unknown keys are rejected even through variables.
  withProps(Example, extraPreset);
  // @ts-expect-error An optional prop does not accept undefined under exactOptionalPropertyTypes.
  withProps(Example, { mode: undefined });
  const uncertainPreset: Partial<IExampleProps> = {};
  // @ts-expect-error A possibly absent preset cannot satisfy a required prop.
  withProps(Example, uncertainPreset);
  // @ts-expect-error Invalid discriminated-union combination.
  withProps(Choice, { kind: 'link', disabled: true });
  // @ts-expect-error Bound props cannot be rebound when composing.
  withProps(Bound, { label: 'Changed' });

  const overridingProps = { label: 'Override', count: 1, children: 'Open' };
  return [
    <Bound
      key="valid"
      count={1}
      className="example"
      mode="full"
      onChange={(value) => value.toFixed()}
    >
      Open
    </Bound>,
    <AllBound key="all" />,
    <Composed key="composed">Open</Composed>,
    <Unbound key="empty" label="Tasks" count={1}>
      Open
    </Unbound>,
    <OptionalBound key="optional" label="Tasks" count={1}>
      Open
    </OptionalBound>,
    <WithChildren key="children" label="Tasks" count={1} />,
    <WithCallback key="callback" label="Tasks" count={1}>
      Open
    </WithCallback>,
    <RefComponent key="ref" count={1} ref={createRef<HTMLDivElement>()}>
      Open
    </RefComponent>,
    <BoundLink key="link" href="/" />,
    <CompleteLink key="complete-link" />,
    <UnboundChoice key="choice" kind="button" disabled={false} />,
    // @ts-expect-error Unbound required count is still required.
    <Bound key="invalid-0">Open</Bound>,
    // @ts-expect-error Unbound required children are still required.
    <Bound key="invalid-1" count={1} />,
    // @ts-expect-error Remaining prop values retain their original types.
    <Bound key="invalid-2" count="one">
      Open
    </Bound>,
    // @ts-expect-error Optional literal props retain their original values.
    <Bound key="invalid-3" count={1} mode="invalid">
      Open
    </Bound>,
    <Bound
      key="invalid-4"
      count={1}
      // @ts-expect-error Callback argument types are preserved.
      onChange={(value: string) => value.toUpperCase()}
    >
      Open
    </Bound>,
    // @ts-expect-error Unknown caller props are rejected.
    <Bound key="invalid-5" count={1} unknown>
      Open
    </Bound>,
    // @ts-expect-error Preset props cannot be overridden explicitly.
    <Bound key="invalid-6" label="Changed" count={1}>
      Open
    </Bound>,
    // @ts-expect-error Preset props cannot be overridden through JSX spreads.
    <Bound key="invalid-7" {...overridingProps} />,
    // @ts-expect-error Preset optional props cannot be overridden either.
    <OptionalBound key="invalid-8" label="Tasks" count={1} mode="full">
      Open
    </OptionalBound>,
    <RefComponent
      key="invalid-9"
      count={1}
      // @ts-expect-error Refs retain their element type.
      ref={createRef<HTMLButtonElement>()}
    >
      Open
    </RefComponent>,
    // @ts-expect-error Narrowing keeps the link variant's required prop.
    <BoundLink key="invalid-10" />,
    // @ts-expect-error Props from the other union variant remain invalid.
    <BoundLink key="invalid-11" disabled href="/" />,
    // @ts-expect-error Empty presets preserve union correlations.
    <UnboundChoice key="invalid-12" kind="link" disabled />,
  ];
}
