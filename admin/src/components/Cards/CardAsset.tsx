import * as React from "react";
import { prefixFileUrlWithBackendUrl } from "@strapi/helper-plugin";
import styled from "styled-components";

import { MediaFile } from "../../data/fileApi";

import { Image } from "../Media/Image";
import { VisuallyHidden } from "../VisuallyHidden";

export const CardAsset = ({
  name,
  url,
  assetType,
  alternativeText,
}: MediaFile) => {
  const [isChecked, setIsChecked] = React.useState(false);

  const handleClick: React.MouseEventHandler<HTMLLabelElement> = (event) => {
    if (event.detail === 1) {
      setIsChecked((prev) => !prev);
    }
  };

  return (
    <CardWrapper
      $isChecked={isChecked}
      onDoubleClick={(e) => {
        /**
         * TODO: this should open a modal with the image and it's details
         */
        e.preventDefault();
        console.log("double clicked");
      }}
      onClick={handleClick}
    >
      <Flex>
        {assetType === "image" ? (
          <Image
            draggable={false}
            src={prefixFileUrlWithBackendUrl(url)}
            alt={alternativeText ?? ""}
          />
        ) : null}
      </Flex>
      <CardLabel>
        <VisuallyHidden
          as="input"
          type="checkbox"
          // Noop to shut react up – is this still accessible? Does it need to be?
          onChange={() => {}}
          checked={isChecked}
        />
        <VisuallyHidden>{`Select `}</VisuallyHidden>
        {name}
      </CardLabel>
    </CardWrapper>
  );
};

const CardWrapper = styled.label<{ $isChecked: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  border-radius: 10px;
  padding: 20px;
  padding-bottom: 12px;
  transition: background-color 200ms ease-out;
  cursor: pointer;

  background-color: ${(props) =>
    props.$isChecked ? "#fafafa33" : "transparent"};
`;

const Flex = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  width: 100%;
`;

const CardLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 10px;
  color: #fafafa;
`;
