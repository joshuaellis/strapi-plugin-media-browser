import * as React from 'react';
import styled from 'styled-components';

import { VisuallyHidden } from '../VisuallyHidden';

import * as FolderBase from './FolderBase';

interface FolderNewProps {
  intialValue?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFormSubmit?: React.FormEventHandler<HTMLFormElement>;
}

export const FolderNew = React.forwardRef<HTMLInputElement, FolderNewProps>(
  ({ intialValue, onBlur, onFormSubmit }, ref) => {
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
      <FolderBase.Base>
        <FolderBase.Left>
          <form onSubmit={handleSubmit}>
            <InputLabel>
              <VisuallyHidden>Folder Name</VisuallyHidden>
              <Input
                ref={ref}
                defaultValue={intialValue}
                type="text"
                name="folderName"
                onBlur={handleBlur}
              />
            </InputLabel>
          </form>
        </FolderBase.Left>
      </FolderBase.Base>
    );
  }
);

const InputLabel = styled.label`
  position: relative;

  &::after {
    content: '';
    display: block;
    width: 100%;
    height: 1px;
    background-color: #fafafa;
    position: absolute;
    bottom: -2px;
    left: 0;
  }
`;

const Input = styled.input`
  background: transparent;
  border: none;
  color: #fafafa;
  padding: 0;

  &:focus-within {
    outline: none;
  }
`;
