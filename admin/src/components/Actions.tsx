import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { HorizontalDots } from "./Icons/HorizontalDots";
import { ToolbarButton } from "./ToolbarButton";

export const ActionsToolbarButton = () => {
  return (
    <DropdownMenu.Root>
      <ToolbarButton asChild>
        <DropdownMenu.Trigger>
          <HorizontalDots />
        </DropdownMenu.Trigger>
      </ToolbarButton>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Delete</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>Get Info</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
