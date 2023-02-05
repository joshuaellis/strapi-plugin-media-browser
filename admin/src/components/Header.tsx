import * as React from "react";
import styled from "styled-components";
import * as Toolbar from "@radix-ui/react-toolbar";

import { IconButton } from "./IconButton";
import { LeftArrow } from "./Icons/LeftArrow";
import { RightArrow } from "./Icons/RightArrow";
import { Search } from "./Icons/Search";
import { FiltersToolbarButton } from "./Toolbar/Filters";
import { Download } from "./Icons/Download";
import { TagsToolbarButton } from "./Toolbar/Tags";
import { ActionsToolbarButton } from "./Toolbar/Actions";
import { ToolbarButton } from "./ToolbarButton";

interface HeaderProps {
  children: React.ReactNode;
  onBackClick?: () => void;
  onForwardClick?: () => void;
  backButtonDisabled?: boolean;
  forwardButtonDisabled?: boolean;
  canDownload?: boolean;
  onDownloadClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const Header = ({
  children,
  onBackClick,
  onForwardClick,
  backButtonDisabled,
  forwardButtonDisabled,
  canDownload = false,
  onDownloadClick,
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

  const handleDownloadClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onDownloadClick) {
      onDownloadClick(event);
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
      <ToolbarRoot>
        <FiltersToolbarButton />
        <ToolbarButton
          aria-disabled={!canDownload}
          disabled={!canDownload}
          onClick={handleDownloadClick}
        >
          <Download />
        </ToolbarButton>
        <TagsToolbarButton disabled />
        <ActionsToolbarButton disabled />
        <ToolbarSep />
        <ToolbarButton>
          <Search />
        </ToolbarButton>
      </ToolbarRoot>
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

const ToolbarRoot = styled(Toolbar.Root)`
  display: flex;
  min-width: max-content;
  gap: 10px;
`;

const ToolbarSep = styled(Toolbar.Separator)`
  width: 20px;
`;
