import * as React from "react";
import styled from "styled-components";

import { IconButton } from "../components/IconButton";
import { LeftArrow } from "./Icons/LeftArrow";
import { RightArrow } from "./Icons/RightArrow";
import { Search } from "./Icons/Search";

interface HeaderProps {
  children: React.ReactNode;
}

export const Header = ({ children }: HeaderProps) => {
  return (
    <Head>
      <HeaderLeft>
        <HeaderArrows>
          <IconButton label="Back">
            <LeftArrow />
          </IconButton>
          <IconButton label="Forward">
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
