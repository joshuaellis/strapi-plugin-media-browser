import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { Tag } from "./Icons/Tag";
import { ToolbarButton } from "./ToolbarButton";

export const TagsToolbarButton = () => {
  return (
    <Dialog.Root>
      <ToolbarButton asChild>
        <Dialog.Trigger>
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
