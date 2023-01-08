import * as React from "react";

import { VisuallyHidden } from "../VisuallyHidden";

interface FolderNewProps {
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFormSubmit?: React.FormEventHandler<HTMLFormElement>;
}

export const FolderNew = React.forwardRef<HTMLInputElement, FolderNewProps>(
  ({ onBlur, onFormSubmit }, ref) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (onFormSubmit) {
        onFormSubmit(e);
      }
    };

    const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
      if (onBlur) {
        onBlur(e);
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <label>
          <VisuallyHidden>Folder Name</VisuallyHidden>
          <input ref={ref} type="text" name="folderName" onBlur={handleBlur} />
        </label>
      </form>
    );
  }
);
