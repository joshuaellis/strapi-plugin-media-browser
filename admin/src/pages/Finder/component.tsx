/*
 *
 * HomePage
 *
 */

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";

import { Header } from "../../components/Header";
import { SideBar } from "../../components/SidePanel";

export const Finder: React.FunctionComponent = () => {
  const location = useLocation();

  const [_, subroute] = location.pathname.split("/plugins/media-library/");

  return (
    <>
      <Header>{subroute ? subroute : "All files"}</Header>
      <SideBar />
      <Container>hello world</Container>
    </>
  );
};

const Container = styled.div`
  grid-column: 2 / 4;
  grid-row: 2 / 3;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fafafa66;
`;
