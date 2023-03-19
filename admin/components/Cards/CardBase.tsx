import * as React from 'react';

import { prefixFileUrlWithBackendUrl } from '@strapi/helper-plugin';
import styled from 'styled-components';

import type { MediaFile } from '../../data/fileApi';
import { IconButton, type IconButtonProps } from '../IconButton';
import { Cross } from '../Icons/Cross';
import { Loader as AnimatedLoader } from '../Loader';
import { Image } from '../Media/Image';

export const Root = styled.div<{
  $isChecked?: boolean;
  $isUploading?: boolean;
}>`
  position: relative;
  z-index: 0;
  width: 100%;
  border-radius: 10px;
  transition: background-color 200ms ease-out;
  cursor: ${(props) => (props.$isUploading ? 'default' : 'pointer')};
  pointer-events: ${(props) => (props.$isUploading ? 'none' : 'default')};

  background-color: ${(props) => (props.$isChecked ? '#fafafa33' : 'transparent')};

  &:focus-within {
    background-color: #fafafa33;
  }
`;

export const Container = styled.label`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
  padding: 20px;
  padding-bottom: 12px;
`;

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  type: 'image';
}

type MediaProps<TType extends Pick<MediaFile, 'assetType'>['assetType']> = TType extends 'image'
  ? ImageProps
  : never;

interface FlexProps {
  isUploading?: boolean;
}

export const Media = <TType extends Pick<MediaFile, 'assetType'>['assetType']>({
  isUploading,
  type,
  src,
  ...restProps
}: MediaProps<TType> & FlexProps) => (
  <Flex $isUploading={isUploading}>
    {type === 'image' ? (
      <Image draggable={false} src={prefixFileUrlWithBackendUrl(src)} {...restProps} />
    ) : null}
  </Flex>
);

const Flex = styled.div<{ $isUploading?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;
  opacity: ${(props) => (props.$isUploading ? 0.5 : 1)};
`;

export const Label = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 10px;
  color: #fafafa;
`;

const CancelPosition = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  z-index: 2;
`;

export const Cancel = (props: Pick<IconButtonProps, 'onClick'>) => (
  <CancelPosition>
    <IconButton label="Cancel upload" {...props}>
      <Cross color="hsla(353, 90%, 65%, 1)" />
    </IconButton>
  </CancelPosition>
);

const LoaderContainer = styled.div`
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
`;

export const Loader = () => (
  <LoaderContainer>
    <AnimatedLoader />
  </LoaderContainer>
);
