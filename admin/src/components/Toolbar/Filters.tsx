import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

import { Filter } from "../Icons/Filter";
import { ToolbarButton } from "../ToolbarButton";
import * as Menu from "../DropdownMenu";

import { useTypedDispatch, useTypedSelector } from "../../store/hooks";
import { useHistory, useLocation } from "react-router-dom";
import { useQuery } from "../../hooks/useQuery";

interface FiltersToolbarButtonProps {
  disabled?: boolean;
}

export const FILTERS = [
  "none",
  "name",
  "ext",
  "createdAt",
  "updatedAt",
  "size",
  // "tags",
] as const;

const ACTUAL_FILTERS = FILTERS.slice(1);

const FILTER_LABELS = {
  [ACTUAL_FILTERS[0]]: "Name",
  [ACTUAL_FILTERS[1]]: "Kind",
  [ACTUAL_FILTERS[2]]: "Date Added",
  [ACTUAL_FILTERS[3]]: "Date Modified",
  [ACTUAL_FILTERS[4]]: "Size",
  [ACTUAL_FILTERS[5]]: "Tags",
};

export const FiltersToolbarButton = ({
  disabled,
}: FiltersToolbarButtonProps) => {
  const [query, setQuery] = useQuery();

  const handleValueChange: DropdownMenu.MenuRadioGroupProps["onValueChange"] = (
    value: string
  ) => {
    setQuery({ sortBy: value });
  };

  const activeFilter = query.get("sortBy") || "none";

  return (
    <DropdownMenu.Root>
      <ToolbarButton asChild aria-disabled={disabled}>
        <DropdownMenu.Trigger disabled={disabled}>
          <Filter />
        </DropdownMenu.Trigger>
      </ToolbarButton>
      <Menu.Content>
        <DropdownMenu.RadioGroup
          value={activeFilter}
          onValueChange={handleValueChange}
        >
          <Menu.RadioItem value="none">None</Menu.RadioItem>
          <Menu.Separator />
          {ACTUAL_FILTERS.map((filter) => (
            <Menu.RadioItem key={filter} value={filter}>
              {FILTER_LABELS[filter]}
            </Menu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
      </Menu.Content>
    </DropdownMenu.Root>
  );
};
