import * as React from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import { IconButton } from "../components/IconButton";
import { useTypedDispatch, useTypedSelector } from "../store";
import { LeftArrow } from "./Icons/LeftArrow";
import { RightArrow } from "./Icons/RightArrow";
import { Search } from "./Icons/Search";

interface HeaderProps {
  children: React.ReactNode;
  onBackClick?: () => void;
  onForwardClick?: () => void;
  backButtonDisabled?: boolean;
  forwardButtonDisabled?: boolean;
}

export const Header = ({
  children,
  onBackClick,
  onForwardClick,
  backButtonDisabled,
  forwardButtonDisabled,
}: HeaderProps) => {
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    }
  };

  const handleForwardClick = () => {
    if (onForwardClick) {
      onForwardClick();
    }
  };

  return (
    <Head>
      <HeaderLeft>
        <HeaderArrows>
          <IconButton
            disabled={backButtonDisabled}
            label="Back"
            onClick={handleBackClick}
          >
            <LeftArrow />
          </IconButton>
          <IconButton
            disabled={forwardButtonDisabled}
            label="Forward"
            onClick={handleForwardClick}
          >
            <RightArrow />
          </IconButton>
        </HeaderArrows>
        <HeaderTitle>{children}</HeaderTitle>
      </HeaderLeft>
      <div>
        <IconButton label="Search">
          <Search />
        </IconButton>
      </div>
    </Head>
  );
};

const Head = styled.header`
  grid-column: 2 / 4;
  grid-row: 1 / 2;
  background-color: rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 20px;
`;

const HeaderLeft = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 30px;
`;

const HeaderArrows = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 20px;
  line-height: 100%;
`;
