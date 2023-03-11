import * as React from 'react';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTransition, animated } from '@react-spring/web';

import { useQuery } from '../../hooks/useQuery';
import * as Menu from '../DropdownMenu';
import { Filter } from '../Icons/Filter';
import { ToolbarButton } from '../ToolbarButton';


interface FiltersToolbarButtonProps {
  disabled?: boolean;
}

export const FILTERS = [
  'none',
  'name',
  'ext',
  'createdAt',
  'updatedAt',
  'size',
  // "tags",
] as const;

const ACTUAL_FILTERS = FILTERS.slice(1);

const FILTER_LABELS = {
  [ACTUAL_FILTERS[0]]: 'Name',
  [ACTUAL_FILTERS[1]]: 'Kind',
  [ACTUAL_FILTERS[2]]: 'Date Added',
  [ACTUAL_FILTERS[3]]: 'Date Modified',
  [ACTUAL_FILTERS[4]]: 'Size',
  [ACTUAL_FILTERS[5]]: 'Tags',
};

export const FiltersToolbarButton = ({ disabled }: FiltersToolbarButtonProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = useQuery();

  const handleValueChange: DropdownMenu.MenuRadioGroupProps['onValueChange'] = (value: string) => {
    setQuery({ sortBy: value });
  };

  const activeFilter = query.get('sortBy') || 'none';

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const transition = useTransition(isOpen, Menu.animationConfig);

  return (
    <DropdownMenu.Root onOpenChange={handleOpenChange}>
      <ToolbarButton asChild aria-disabled={disabled}>
        <DropdownMenu.Trigger disabled={disabled}>
          <Filter />
        </DropdownMenu.Trigger>
      </ToolbarButton>
      {transition((styles, isOpen) =>
        isOpen ? (
          <Menu.Content forceMount asChild>
            <animated.div style={styles}>
              <DropdownMenu.RadioGroup value={activeFilter} onValueChange={handleValueChange}>
                <Menu.RadioItem value="none">None</Menu.RadioItem>
                <Menu.Separator />
                {ACTUAL_FILTERS.map((filter) => (
                  <Menu.RadioItem key={filter} value={filter}>
                    {FILTER_LABELS[filter]}
                  </Menu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </animated.div>
          </Menu.Content>
        ) : null
      )}
    </DropdownMenu.Root>
  );
};
