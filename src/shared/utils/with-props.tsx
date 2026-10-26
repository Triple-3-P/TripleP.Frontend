import { createElement } from 'react';
import type { ComponentType } from 'react';

type TComponentProps<TComponent> = TComponent extends (
  props: infer TProps,
) => unknown
  ? TProps
  : TComponent extends new (props: infer TProps) => unknown
    ? TProps
    : never;
type TKeysOfUnion<TProps> = TProps extends unknown ? keyof TProps : never;

type TWithProps<TProps, TPresets> = TProps extends unknown
  ? [TPresets] extends [Partial<TProps>]
    ? Omit<TProps, keyof TPresets> & { [TKey in keyof TPresets]?: never }
    : never
  : never;

// Validate after inference so callback props keep their contextual parameter types.
type TValidatePresets<TProps, TPresets> =
  Exclude<keyof TPresets, TKeysOfUnion<TProps>> extends never
    ? [TPresets] extends [Required<TPresets>]
      ? []
      : [invalidPresets: never]
    : [invalidPresets: never];

/** Bind fixed props once, at module scope. Remaining props keep their original types. */
export function withProps<
  TComponent extends ComponentType<never>,
  const TPresets extends object,
>(
  Component: TComponent,
  presetProps: TPresets & Partial<TComponentProps<TComponent>>,
  ..._validation: TValidatePresets<
    TComponentProps<TComponent>,
    NoInfer<TPresets>
  >
) {
  const presets = { ...presetProps };

  return function WithProps(
    props: TWithProps<TComponentProps<TComponent>, TPresets>,
  ) {
    // React accepts the original component's complete props, but TypeScript cannot
    // reconstruct that generic type from Omit + its keys. The public signature
    // checks presets and remaining required props; presets win at runtime too.
    return createElement(Component, { ...props, ...presets } as never);
  };
}
