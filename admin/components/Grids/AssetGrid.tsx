import * as React from 'react';

import { VirtuosoGrid } from 'react-virtuoso';
import styled from 'styled-components';

import type { MediaFile } from '../../data/fileApi';
import { useCallbackRef } from '../../hooks/useCallbackRef';
import type { UploadItem } from '../../modules/upload';
import { CardAsset, type CardAssetProps } from '../Cards/CardAsset';
import { CardUpload } from '../Cards/CardUpload';

export interface AssetGridProps {
  cards: Array<MediaFile | UploadItem>;
  onCancelClick: (name: string) => void;
  onCardSelect: CardAssetProps['onClick'];
  onCardDoubleClick: CardAssetProps['onDoubleClick'];
  onContainerClick: React.MouseEventHandler<HTMLDivElement>;
}

export const AssetGrid = ({
  cards,
  onCancelClick,
  onCardSelect,
  onContainerClick,
  onCardDoubleClick,
}: AssetGridProps) => {
  const handleCancelClick = useCallbackRef(onCancelClick);
  const handleCardSelect = useCallbackRef(onCardSelect);
  const handleDoubleClick = useCallbackRef(onCardDoubleClick);

  return (
    <Container onClick={onContainerClick}>
      <VirtuosoGrid
        computeItemKey={(index) => {
          const item = cards[index];
          return 'uuid' in item ? item.uuid : item.hash;
        }}
        components={{
          Item: ItemContainer,
          List: ListContainer,
        }}
        itemContent={(index) => {
          const item = cards[index];
          return (
            <VirtualCell
              item={item}
              onCancelClick={handleCancelClick}
              onCardSelect={handleCardSelect}
              onCardDoubleClick={handleDoubleClick}
            />
          );
        }}
        // TODO: implement load more so change the fetch call to return pagination...
        //   overscan={48}
        style={{ overflowX: 'hidden' }}
        totalCount={cards.length}
      />
    </Container>
  );
};

interface VirtualCellProps
  extends Pick<AssetGridProps, 'onCancelClick' | 'onCardSelect' | 'onCardDoubleClick'> {
  item: MediaFile | UploadItem;
}

const VirtualCell = React.memo(
  ({ item, onCancelClick, onCardSelect, onCardDoubleClick }: VirtualCellProps) => {
    if ('id' in item) {
      /**
       * It's a file from the DB
       */
      return <CardAsset {...item} onClick={onCardSelect} onDoubleClick={onCardDoubleClick} />;
    }

    if ('status' in item) {
      /**
       * It's being uploaded
       */
      return <CardUpload {...item} onCancelClick={onCancelClick} />;
    }

    return null;
  }
);

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const ListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  column-gap: 15px;
  row-gap: 15px;
  margin: 15px;
`;

const ItemContainer = styled.div`
  display: flex;
  flex: none;
  align-content: stretch;
  box-sizing: border-box;
  width: 100%;
  aspect-ratio: ${240 / 280};

  @media (min-width: 768px) {
    width: 33%;
  }

  @media (min-width: 1080px) {
    width: 25%;
  }

  @media (min-width: 1440px) {
    width: 20%;
  }

  @media (min-width: 1600px) {
    width: 16.66%;
  }

  @media (min-width: 1920px) {
    width: 10%;
  }
`;
