import * as React from 'react';

import styled, { css } from 'styled-components';

import { VisuallyHidden } from './VisuallyHidden';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  initialValue?: string;
  hasUnderline?: boolean;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, initialValue, hasUnderline = true, ...restProps }, ref) => {
    return (
      <InputLabel $hasUnderline={hasUnderline}>
        <VisuallyHidden>{label}</VisuallyHidden>
        <Input ref={ref} defaultValue={initialValue} type="text" name="folderName" {...restProps} />
      </InputLabel>
    );
  }
);

const InputLabel = styled.label<{ $hasUnderline?: boolean }>`
  position: relative;
  width: 100%;
  display: block;

  ${(props) =>
    props.$hasUnderline
      ? css`
          &::after {
            content: '';
            display: block;
            width: 100%;
            height: 1px;
            background-color: #fafafa;
            position: absolute;
            bottom: -2px;
            left: 0;
          }
        `
      : ''}
`;

const Input = styled.input`
  background: transparent;
  border: none;
  color: #fafafa;
  padding: 0;

  &:focus-within,
  &:focus {
    outline: none !important;
  }
`;
