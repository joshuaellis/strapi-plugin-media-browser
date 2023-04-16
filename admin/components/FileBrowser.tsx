import * as React from 'react';

import type { CardAssetProps } from './Cards/CardAsset';
import { AssetGrid } from './Grids/AssetGrid';
import { UploadDropzone } from './Upload/UploadDropzone';
import type { MediaFile } from '../data/fileApi';
import { addSelectedItem, replaceSelectedItems, showFileDetails } from '../modules/finder';
import { uploadAssetThunk, deleteUploadItems } from '../modules/upload';
import { useTypedDispatch, useTypedSelector } from '../store/hooks';
import { selectUploadsBasedOnRoute } from '../store/selectors';

interface FileBrowserProps {
  files: MediaFile[];
}

export const FileBrowser = ({ files }: FileBrowserProps) => {
  const uploads = useTypedSelector(selectUploadsBasedOnRoute);
  const folder = useTypedSelector((state) => state.finder.currentPlace);
  const dispatch = useTypedDispatch();
  const abortRefs = React.useRef<Map<string, () => void>>(new Map());

  const handleFileDrop = (files: File[]) => {
    files.map((file) => {
      const promise = dispatch(uploadAssetThunk({ file, folder }));

      /**
       * Add the abort function to the map so we can call it later
       */
      abortRefs.current.set(file.name, promise.abort);

      /**
       * Remove the abort function from the map once the upload thunk
       * has completed regardless of the outcome.
       */
      promise.finally(() => {
        abortRefs.current.delete(file.name);
      });
    });
  };

  const handleAbortUpload = (name: string) => {
    abortRefs.current.get(name)?.();
  };

  const handleCardSelect: CardAssetProps['onClick'] = (uuid, event) => {
    if (event.shiftKey) {
      dispatch(addSelectedItem(uuid));
    } else {
      dispatch(replaceSelectedItems(uuid));
    }
  };

  const handleCardDoubleClick: CardAssetProps['onDoubleClick'] = (uuid) => {
    const selectedCard = files.find((file) => file.uuid === uuid);

    if (selectedCard) {
      dispatch(showFileDetails(selectedCard));
    }
  };

  const handleContainerClick = () => {
    dispatch(replaceSelectedItems());
  };

  React.useLayoutEffect(() => {
    /**
     * Find any items that are in both uploads and files
     */
    const itemsToRemove = uploads.filter((upload) =>
      files.some((file) => file.hash === upload.hash)
    );

    if (itemsToRemove.length > 0) {
      dispatch(deleteUploadItems(itemsToRemove));
    }
  }, [dispatch, files, uploads]);

  const cards = [...uploads, ...files];

  return (
    <UploadDropzone onFileDrop={handleFileDrop}>
      {cards.length === 0 ? (
        'No files found.'
      ) : (
        <AssetGrid
          cards={cards}
          onContainerClick={handleContainerClick}
          onCancelClick={handleAbortUpload}
          onCardSelect={handleCardSelect}
          onCardDoubleClick={handleCardDoubleClick}
        />
      )}
    </UploadDropzone>
  );
};
