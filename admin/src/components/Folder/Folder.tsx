import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { BASE_URL } from '../../constants';

import { IconButton } from '../IconButton';

import { Cross } from '../Icons/Cross';
import { Pencil } from '../Icons/Pencil';

import * as FolderBase from './FolderBase';
import { FolderNew } from './FolderNew';

interface FolderProps {
  title: string;
  id: number;
  onDeleteClick?: (id: number) => void;
  onRename?: (id: number, newName: string) => Promise<boolean>;
}

export const Folder = ({ title, id, onDeleteClick, onRename }: FolderProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isRenaming, setIsRenaming] = React.useState(false);

  const handleDeleteClick = () => {
    if (onDeleteClick) {
      onDeleteClick(id);
    }
  };

  const handleRename = () => {
    setIsRenaming(true);
  };

  React.useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isRenaming]);

  /**
   * TODO: After renamimg the folder there's a flash where the old name is shown
   * this shouldn't be visible.
   */

  const handleRenameInputBlur: React.FocusEventHandler<HTMLInputElement> = async (e) => {
    if (e.currentTarget.value !== '' && onRename) {
      const updatedFolder = await onRename(id, e.currentTarget.value);

      if (!updatedFolder) {
        return;
      }
    }

    setIsRenaming(false);
  };

  const handleRenameInputSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    const data = new FormData(e.currentTarget);

    const folderNameValue = data.get('folderName');

    if (typeof folderNameValue === 'string' && folderNameValue !== '' && onRename) {
      const updatedFolder = await onRename(id, folderNameValue);

      if (!updatedFolder) {
        return;
      }
    }

    setIsRenaming(false);
  };

  if (isRenaming) {
    return (
      <FolderNew
        ref={inputRef}
        initialValue={title}
        onBlur={handleRenameInputBlur}
        onFormSubmit={handleRenameInputSubmit}
      />
    );
  }

  return (
    <FolderBase.Base>
      <FolderBase.Left>
        <FolderLink to={`${BASE_URL}/${title}`}>{title}</FolderLink>
      </FolderBase.Left>
      <FolderBase.Right>
        {/* <DimmedIconButton
          label={`New folder in ${title}`}
          onClick={handleNewFolderClick}
        >
          <Plus />
        </DimmedIconButton> */}
        <DimmedIconButton label={`Rename folder – ${title}`} onClick={handleRename}>
          <Pencil />
        </DimmedIconButton>
        <DimmedIconButton label={`Delete folder – ${title}`} onClick={handleDeleteClick}>
          <Cross />
        </DimmedIconButton>
      </FolderBase.Right>
    </FolderBase.Base>
  );
};

const FolderLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  padding: 5px 0;
  border-radius: 5px;

  &:visited {
    color: inherit;
  }
`;

const DimmedIconButton = styled(IconButton)`
  opacity: 0.6;

  & > svg {
    width: 15px;
  }
`;
