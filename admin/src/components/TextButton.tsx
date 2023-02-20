import * as React from 'react';
import styled from 'styled-components';

interface TextButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: string;
}

export const TextButton = React.forwardRef<HTMLButtonElement, TextButtonProps>(
  ({ children, ...restProps }, ref) => {
    return (
      <Button {...restProps} ref={ref}>
        {children}
      </Button>
    );
  }
);

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: #0855c9;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 5px;
  transition: filter 200ms ease-out;

  &[aria-disabled='true'] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not([aria-disabled='true']):hover {
    filter: brightness(120%);
  }
`;
