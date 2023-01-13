import * as React from "react";
import styled from "styled-components";
import {
  useGetAllFoldersQuery,
  usePostNewFolderMutation,
  useDeleteFolderMutation,
  useFolderMutationApi,
} from "../data/finderApi";

import { Folder } from "./Folder/Folder";
import { FolderNew } from "./Folder/FolderNew";

import { IconButton } from "./IconButton";
import { Plus } from "./Icons/Plus";

/**
 * TODO: make the new folder button look the same as the folder items.
 *
 * TODO: don't remove the "new folder" when the form is submit, rather move it to the alphabetically correct position.
 *
 * TODO: handle nested foldering and let the folders change the route so files specific to the folder can be found.
 *
 * TODO: handle deleting / renaming and creating nested folders.
 *
 * TODO: handle dragging the folders around
 *
 * TODO: handle letting assets be dropped in a folder to re-organise where the folders should be.
 */
export const SideBar = () => {
  const { postNewFolder, deleteFolder, updateFolder } = useFolderMutationApi();
  const { data: folderData } = useGetAllFoldersQuery(undefined);

  const [showNewFolder, setShowNewFolder] = React.useState(false);

  const newFolderRef = React.useRef<HTMLInputElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null!);

  const handleNewFolderClick = () => {
    setShowNewFolder(true);
  };

  React.useEffect(() => {
    if (showNewFolder && newFolderRef.current) {
      /**
       * Focus the input in the form when the form is shown.
       */
      newFolderRef.current.focus();
    }
  }, [showNewFolder]);

  const hideNewFolderAndRestoreFocus = (clearInput = false) => {
    /**
     * Restore UI to the state before the new folder form was shown.
     * Therefore focussing the new folder button.
     */
    if (newFolderRef.current && clearInput) {
      newFolderRef.current.value = "";
    }
    setShowNewFolder(false);
    buttonRef.current.focus();
  };

  const handleNewFolderFormSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    const data = new FormData(e.currentTarget);

    const folderNameValue = data.get("folderName");

    if (folderNameValue === "") {
      hideNewFolderAndRestoreFocus();
      return;
    } else if (typeof folderNameValue === "string") {
      const res = await postNewFolder({
        name: folderNameValue,
        parent: null,
      });

      if ("data" in res) {
        /* This assumes success and we therefore reset the form */
        hideNewFolderAndRestoreFocus(true);
      }
    }
  };

  const handleNewFolderBlur: React.FocusEventHandler<HTMLInputElement> = (
    e
  ) => {
    if (e.currentTarget.value === "") {
      hideNewFolderAndRestoreFocus();
    } else {
      // TODO: handle blur but also take into account blur happens when the form is submitted
    }
  };

  const handleDeleteClick = async (id: number) => {
    const res = await deleteFolder(id.toString());

    if ("error" in res) {
      // TODO: handle error
    }
  };

  const handleRename = async (folderId: number, newName: string) => {
    const res = await updateFolder({
      id: folderId.toString(),
      patch: {
        name: newName,
      },
    });

    if ("data" in res) {
      return true;
    } else {
      if ("error" in res) {
        // TODO: handle error
      }
      return false;
    }
  };

  return (
    <Aside>
      <Space />
      <AsideTop>
        <SidePanelTitle>Folders</SidePanelTitle>
        <DimmedIconButton
          ref={buttonRef}
          label="New folder at root"
          onClick={handleNewFolderClick}
        >
          <Plus />
        </DimmedIconButton>
      </AsideTop>
      <FoldersList>
        {showNewFolder ? (
          <FolderNew
            ref={newFolderRef}
            onBlur={handleNewFolderBlur}
            onFormSubmit={handleNewFolderFormSubmit}
          />
        ) : null}
        {folderData ? (
          <ul>
            {folderData.map((folder) => (
              <li key={folder.id}>
                <Folder
                  title={folder.name}
                  id={folder.id}
                  onDeleteClick={handleDeleteClick}
                  onRename={handleRename}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </FoldersList>
    </Aside>
  );
};

const Aside = styled.aside`
  grid-column: 1 / 2;
  grid-row: 1 / 3;
  background-color: rgb(28, 28, 28);
  padding: 12px 20px;
`;

const AsideTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

const SidePanelTitle = styled.h2`
  font-size: 14px;
  opacity: 0.6;
`;

const DimmedIconButton = styled(IconButton)`
  opacity: 0.6;
`;

const Space = styled.div`
  padding: 24px 20px;
`;

const FoldersList = styled.div`
  display: flex;
  flex-direction: column;
`;
