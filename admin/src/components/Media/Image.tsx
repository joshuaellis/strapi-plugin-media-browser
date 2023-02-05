import * as React from 'react';
import styled, { css } from 'styled-components';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  $showCheckerboard?: boolean;
}

export const Image = (props: ImageProps) => {
  return (
    <ImageWrapper>
      <Img {...props} />
    </ImageWrapper>
  );
};

const ImageWrapper = styled.span`
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
`;

const Img = styled.img<Pick<ImageProps, '$showCheckerboard'>>`
  --checkerboard-color: #272a2e;

  display: block;
  width: 0px;
  height: 0px;
  min-width: 100%;
  max-width: 100%;
  min-height: 100%;
  max-height: 100%;
  object-fit: contain;
  position: absolute;
  inset: 0px;

  ${(props) =>
    props.$showCheckerboard &&
    css`
      background-image: linear-gradient(45deg, var(--checkerboard-color) 25%, transparent 25%),
        linear-gradient(-45deg, var(--checkerboard-color) 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, var(--checkerboard-color) 75%),
        linear-gradient(-45deg, transparent 75%, var(--checkerboard-color) 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0;
    `}
`;
