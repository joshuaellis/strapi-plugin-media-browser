import * as React from 'react';
import styled from 'styled-components';
import { useDropzone, DropEvent } from 'react-dropzone';

import { filterFilesFromDropzone } from '../../helpers/files';

interface UploadDropzoneProps {
  children: React.ReactNode;
  onFileDrop?: (files: File[]) => void;
}

export const UploadDropzone = ({ children, onFileDrop }: UploadDropzoneProps) => {
  const handleDrop = (acceptedFiles: File[]) => {
    if (onFileDrop) {
      onFileDrop(acceptedFiles);
    }
  };

  const handleFileGetter = async (event: DropEvent): Promise<(File | DataTransferItem)[]> => {
    let fileList: FileList | undefined;
    if (event.type === 'drop' && 'dataTransfer' in event) {
      fileList = event.dataTransfer?.files;
    }
    if (event.type === 'change') {
      const target = event.target as HTMLInputElement;

      if (target?.files) {
        fileList = target.files;
      }
    }

    if (!fileList) {
      return [];
    }

    const files = await filterFilesFromDropzone(fileList);

    if (files.length !== fileList.length) {
      // TODO: show error message that something has gone wrong.
    }

    return files;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    // TODO: this should be a setting from the plugin.
    accept: {
      'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
      'video/*': ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.mkv'],
    },
    getFilesFromEvent: handleFileGetter,
    noClick: true,
    onDrop: handleDrop,
  });

  return (
    <Dropzone {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive && (
        <DropOverlay>
          <p>Drop files to upload</p>
        </DropOverlay>
      )}
      {children}
    </Dropzone>
  );
};

const Dropzone = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DropOverlay = styled.div`
  align-items: center;
  background: #171717e6;
  display: flex;
  height: 100%;
  justify-content: center;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
  z-index: 3;
  color: #fafafa;
`;
