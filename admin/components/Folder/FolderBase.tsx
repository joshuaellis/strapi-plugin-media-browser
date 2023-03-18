import * as React from 'react';

import styled from 'styled-components';

import { Folder as FolderIcon } from '../Icons/Folder';

interface FolderBaseProps {
  children: React.ReactNode;
  className?: string;
}

export const Base = ({ className, children }: FolderBaseProps) => {
  return (
    <FolderContainer className={className}>
      <FolderFlex>{children}</FolderFlex>
    </FolderContainer>
  );
};

interface LeftProps {
  children: React.ReactNode;
}

export const Left = ({ children }: LeftProps) => (
  <FolderLeft>
    <FolderIcon />
    {children}
  </FolderLeft>
);

const FolderLeft = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;

  & > svg {
    width: 20px;
  }
`;

export const Right = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;

  &:focus-visible,
  &:focus-within {
    opacity: 1;
  }
`;

const FolderContainer = styled.div`
  font-size: 14px;
  line-height: 100%;
  font-weight: 600;
`;

const FolderFlex = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 4px 0px;
  border-radius: 8px;
  gap: 20px;
  cursor: grab;

  &:hover {
    ${Right} {
      opacity: 1;
    }
  }
`;
