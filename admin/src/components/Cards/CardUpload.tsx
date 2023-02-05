import * as React from 'react';

import { UploadItem } from '../../modules/upload';

import * as CardBase from './CardBase';

interface CardUploadProps extends UploadItem {
  onCancelClick: (name: string) => void;
}

export const CardUpload = ({ name, onCancelClick, url, status }: CardUploadProps) => {
  const handleCancel = () => {
    onCancelClick(name);
  };

  const isNotComplete = status !== 'complete';

  return (
    <CardBase.Root $isUploading>
      {isNotComplete ? <CardBase.Cancel onClick={handleCancel} /> : null}
      {isNotComplete ? <CardBase.Loader /> : null}
      <CardBase.Container>
        {/* TODO: how to handle video previews? */}
        <CardBase.Media type={'image'} src={url} isUploading={isNotComplete} />
        <CardBase.Label>{name}</CardBase.Label>
      </CardBase.Container>
    </CardBase.Root>
  );
};
