import * as React from 'react';

import * as FolderBase from './FolderBase';
import { TextInput, type TextInputProps } from '../TextInput';

interface FolderNewProps extends Pick<TextInputProps, 'onBlur' | 'initialValue'> {
  onFormSubmit?: React.FormEventHandler<HTMLFormElement>;
}

export const FolderNew = React.forwardRef<HTMLInputElement, FolderNewProps>(
  ({ initialValue, onBlur, onFormSubmit }, ref) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (onFormSubmit) {
        onFormSubmit(e);
      }
    };

    return (
      <FolderBase.Base>
        <FolderBase.Left>
          <form onSubmit={handleSubmit}>
            <TextInput
              ref={ref}
              label="Folder Name"
              initialValue={initialValue}
              onBlur={onBlur}
              name="folderName"
            />
          </form>
        </FolderBase.Left>
      </FolderBase.Base>
    );
  }
);
