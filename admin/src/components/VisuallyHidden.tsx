import styled from "styled-components";

export const VisuallyHidden = styled.span`
  // See: https://github.com/twbs/bootstrap/blob/master/scss/mixins/_screen-reader.scss
  position: absolute;
  border: 0;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  word-wrap: normal;
`;
