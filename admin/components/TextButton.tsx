import * as React from 'react';

import styled, { css } from 'styled-components';

type Variants = 'primary' | 'secondary' | 'danger';
type Sizes = 'S' | 'R';

interface TextButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  children: string;
  variant?: Variants;
  size?: Sizes;
}

export const TextButton = React.forwardRef<HTMLButtonElement, TextButtonProps>(
  ({ children, variant = 'primary', size = 'R', ...restProps }, ref) => {
    return (
      <Button {...restProps} $variant={variant} $size={size} ref={ref}>
        {children}
      </Button>
    );
  }
);

const Button = styled.button<{ $variant: Variants; $size: Sizes }>`
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 5px;
  transition: filter 200ms ease-out, border-color 200ms ease-out;

  ${({ $size }) => {
    switch ($size) {
      case 'S':
        return css`
          padding: 10px 15px;
          font-size: 12px;
          line-height: 12px;
        `;
      case 'R':
        return css`
          padding: 10px 20px;
          font-size: 14px;
          line-height: 14px;
        `;
      default:
        return '';
    }
  }}

  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return css`
          background-color: #0855c9;
          color: #fafafa;
        `;
      case 'danger':
        return css`
          background-color: #c90808;
          color: #fafafa;
        `;
      case 'secondary':
        return css`
          border: 1px solid rgba(255, 255, 255, 0.2);
        `;
      default:
        return '';
    }
  }}

  &[aria-disabled='true'],
  &[aria-busy='true'] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not([aria-disabled='true']):not([aria-busy='true']):hover {
    ${({ $variant }) => {
      switch ($variant) {
        case 'secondary':
          return css`
            border-color: #0855c9;
          `;
        default:
          return css`
            filter: brightness(120%);
          `;
      }
    }}
  }
`;
