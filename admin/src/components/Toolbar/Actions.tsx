import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { HorizontalDots } from '../Icons/HorizontalDots';
import { ToolbarButton } from '../ToolbarButton';
import * as Menu from '../DropdownMenu';

export interface ActionItem {
  label: string;
  onClick: Pick<Menu.MenuItemProps, 'onSelect'>['onSelect'];
  disabled?: boolean;
  type: 'item';
}

interface ActionSeparator {
  type: 'separator';
}

export interface ActionsToolbarButtonProps {
  disabled?: boolean;
  items?: Array<ActionItem | ActionSeparator>;
}

export const ActionsToolbarButton = ({
  disabled = false,
  items = [],
}: ActionsToolbarButtonProps) => {
  return (
    <DropdownMenu.Root>
      <ToolbarButton asChild aria-disabled={disabled}>
        <DropdownMenu.Trigger disabled={disabled}>
          <HorizontalDots />
        </DropdownMenu.Trigger>
      </ToolbarButton>
      <Menu.Content>
        {items.map((item, index) => {
          if (item.type === 'separator') {
            return <Menu.Separator key={index} />;
          }

          return (
            <Menu.Item key={item.label} disabled={item.disabled} onSelect={item.onClick}>
              {item.label}
            </Menu.Item>
          );
        })}
      </Menu.Content>
    </DropdownMenu.Root>
  );
};
