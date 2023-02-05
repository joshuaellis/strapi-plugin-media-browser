import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';

import { Tag } from '../Icons/Tag';
import { ToolbarButton } from '../ToolbarButton';

interface TagsToolbarButtonProps {
  disabled?: boolean;
}

export const TagsToolbarButton = ({ disabled }: TagsToolbarButtonProps) => {
  return (
    <Dialog.Root>
      <ToolbarButton asChild aria-disabled={disabled}>
        <Dialog.Trigger disabled={disabled}>
          <Tag />
        </Dialog.Trigger>
      </ToolbarButton>
      <Dialog.Portal>
        <Dialog.Content>
          <Dialog.Title>Tags</Dialog.Title>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
