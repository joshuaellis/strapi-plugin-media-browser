import * as React from 'react';
import styled, { css, keyframes } from 'styled-components';

const BLADES = 12;
const SIZE = 24;

export const Loader = () => (
  <Container>
    {new Array(BLADES).fill(null).map((_, index) => (
      <Blade key={index} $index={index} />
    ))}
  </Container>
);

const Container = styled.div`
  font-size: ${SIZE}px;
  position: relative;
  display: inline-block;
  width: 1em;
  height: 1em;
`;

const spinnerFade = keyframes`
  0% {
    background-color: #69717d
  }
  
  100% {
    background-color: transparent;
  }
`;

const Blade = styled.div<{ $index: number }>`
  position: absolute;
  left: 0.4629em;
  bottom: 0;
  width: 0.074em;
  height: 0.2777em;
  border-radius: 0.5em;
  background-color: transparent;
  transform-origin: center -0.2222em;
  animation: ${spinnerFade} 1s infinite linear;

  ${(props) => css`
    animation-delay: ${props.$index * 0.0833}s;
    transform: rotate(${props.$index * 30}deg);
  `}
`;
