import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { HorizontalDots } from "../Icons/HorizontalDots";
import { ToolbarButton } from "../ToolbarButton";
import * as Menu from "../DropdownMenu";

interface ActionsToolbarButtonProps {
  disabled?: boolean;
}

export const ActionsToolbarButton = ({
  disabled,
}: ActionsToolbarButtonProps) => {
  return (
    <DropdownMenu.Root>
      <ToolbarButton asChild aria-disabled={disabled}>
        <DropdownMenu.Trigger disabled={disabled}>
          <HorizontalDots />
        </DropdownMenu.Trigger>
      </ToolbarButton>
      <Menu.Content>
        <Menu.Item>Delete</Menu.Item>
        <Menu.Separator />
        <Menu.Item>Get Info</Menu.Item>
      </Menu.Content>
    </DropdownMenu.Root>
  );
};
