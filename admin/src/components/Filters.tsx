import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { Filter } from "./Icons/Filter";
import { ToolbarButton } from "./ToolbarButton";

export const FiltersToolbarButton = () => {
  return (
    <DropdownMenu.Root>
      <ToolbarButton asChild>
        <DropdownMenu.Trigger>
          <Filter />
        </DropdownMenu.Trigger>
      </ToolbarButton>
      <DropdownMenu.Content>
        <DropdownMenu.RadioItem value="none">None</DropdownMenu.RadioItem>
        <DropdownMenu.Separator />
        <DropdownMenu.RadioItem value="name">Name</DropdownMenu.RadioItem>
        <DropdownMenu.RadioItem value="kind">Kind</DropdownMenu.RadioItem>
        <DropdownMenu.RadioItem value="date-added">
          Date Added
        </DropdownMenu.RadioItem>
        <DropdownMenu.RadioItem value="date-modified">
          Date Modified
        </DropdownMenu.RadioItem>
        <DropdownMenu.RadioItem value="size">Size</DropdownMenu.RadioItem>
        <DropdownMenu.RadioItem value="tags">Tags</DropdownMenu.RadioItem>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
