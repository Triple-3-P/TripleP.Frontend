'use client';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from './input-group';

interface IPasswordInputProps extends Omit<
  ComponentProps<typeof InputGroupInput>,
  'type'
> {
  showLabel: string;
  hideLabel: string;
}
export function PasswordInput({
  showLabel,
  hideLabel,
  disabled,
  ...props
}: IPasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <InputGroup data-disabled={disabled}>
      <InputGroupInput
        {...props}
        disabled={disabled}
        type={visible ? 'text' : 'password'}
      />
      <InputGroupAddon align="inline-end" className="has-[>button]:mr-0">
        <InputGroupButton
          disabled={disabled}
          size="icon-sm"
          aria-label={visible ? hideLabel : showLabel}
          aria-controls={props.id}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
