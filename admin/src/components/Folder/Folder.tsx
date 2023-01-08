import * as React from "react";
import styled from "styled-components";

import { Folder as FolderIcon } from "../Icons/Folder";

interface FolderProps {
  title: string;
}

export const Folder = ({ title }: FolderProps) => {
  return (
    <FolderContainer>
      <FolderFlex>
        <FolderLeft>
          <FolderIcon />
          <FolderName>{title}</FolderName>
        </FolderLeft>
      </FolderFlex>
    </FolderContainer>
  );
};

const FolderContainer = styled.div``;

const FolderFlex = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0px;
  border-radius: 8px;
  cursor: grab;
`;

const FolderLeft = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;

  & > svg {
    width: 20px;
  }
`;

const FolderName = styled.span`
  font-size: 14px;
  line-height: 100%;
  cursor: pointer;
  font-weight: 600;
`;
