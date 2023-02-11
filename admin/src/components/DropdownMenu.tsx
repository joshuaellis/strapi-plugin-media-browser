import * as React from 'react';
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';

import { Check } from './Icons/Check';

export type MenuItemProps = RadixDropdown.MenuItemProps;

export const Content = (props: RadixDropdown.MenuContentProps) => (
  <StyledContent align="start" sideOffset={5} {...props} />
);

const StyledContent = styled(RadixDropdown.Content)`
  padding: 5px;
  z-index: 1;
  background-color: rgba(28, 28, 28, 0.2);
  backdrop-filter: blur(20px);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);

  @supports not (backdrop-filter: blur(10px)) {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const GenericItemStyles = css`
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 5px;
  cursor: pointer;
  background-color: transparent;
  transition: background-color 200ms ease-out;

  &:focus-visible:not([data-disabled]),
  &:hover:not([data-disabled]) {
    outline: none !important;
    background-color: #0855c9;
  }

  &[data-disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Item = styled(RadixDropdown.Item)`
  ${GenericItemStyles}
`;

type RadioItemProps = RadixDropdown.DropdownMenuRadioItemProps;

export const RadioItem = ({ children, ...restProps }: RadioItemProps) => (
  <StyledRadioItem {...restProps}>
    <RadioItemIndicator>
      <Check />
    </RadioItemIndicator>
    {children}
  </StyledRadioItem>
);

const RadioItemIndicator = styled(RadixDropdown.ItemIndicator)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  position: absolute;
  left: 5px;
  bottom: 3px;
`;

const StyledRadioItem = styled(RadixDropdown.RadioItem)`
  ${GenericItemStyles}
  padding-left: 25px;
  position: relative;
`;

export const Separator = styled(RadixDropdown.Separator)`
  height: 1px;
  margin: 5px;
  background-color: rgba(255, 255, 255, 0.2);
`;

export const animationConfig = {
  from: { opacity: 0, y: 5 },
  enter: { opacity: 1, y: 0 },
  leave: { opacity: 0, y: 5 },
  config: {
    tension: 320,
  },
};
