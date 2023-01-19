import * as React from "react";
import { VirtuosoGrid } from "react-virtuoso";
import styled from "styled-components";

import type { MediaFile } from "../../data/finderApi";
import { UploadItem } from "../../modules/upload";
import { CardAsset } from "../Cards/CardAsset";

interface AssetGridProps {
  cards: Array<MediaFile | UploadItem>;
}

export const AssetGrid = ({ cards }: AssetGridProps) => {
  return (
    <Container>
      <VirtuosoGrid
        computeItemKey={(index) => {
          const item = cards[index];
          return "uuid" in item ? item.uuid : item.hash;
        }}
        components={{
          Item: ItemContainer,
          List: ListContainer,
        }}
        itemContent={(index) => {
          const item = cards[index];
          return <VirtualCell item={item} />;
        }}
        // TODO: implement load more so change the fetch call to return pagination...
        //   overscan={48}
        style={{ overflowX: "hidden" }}
        totalCount={cards.length}
      />
    </Container>
  );
};

interface VirtualCellProps {
  item: MediaFile | UploadItem;
}

const VirtualCell = React.memo(({ item }: VirtualCellProps) => {
  if ("id" in item) {
    /**
     * It's a file from the DB
     */
    return <CardAsset {...item} />;
  }

  if ("status" in item) {
    /**
     * It's being uploaded
     */
    // return <CardUpload id={item.id} />;
  }

  return null;
});

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
