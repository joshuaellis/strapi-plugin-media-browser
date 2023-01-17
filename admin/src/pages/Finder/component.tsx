/*
 *
 * HomePage
 *
 */

import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import { FileBrowser } from "../../components/FileBrowser";

import { Header } from "../../components/Header";
import { SideBar } from "../../components/SidePanel";

import { useGetAllFilesQueryState } from "../../data/finderApi";

import { useTypedDispatch, useTypedSelector } from "../../store/hooks";

import { goBack, goForward, pushState } from "../../modules/finder";

export const Finder: React.FunctionComponent = () => {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useTypedDispatch();

  const isGoing = React.useRef({
    forward: false,
    back: false,
  });

  const { canGoBack, canGoForward } = useTypedSelector((state) => ({
    canGoBack: state.finder.canGoBack,
    canGoForward: state.finder.canGoForward,
  }));

  const [_, subroute] = location.pathname.split("/plugins/media-library/");

  /**
   * TODO: Handle back and forward when the name of the folder has changed (thus the subroute is _incorrect_).
   */
  React.useLayoutEffect(() => {
    const { forward, back } = isGoing.current;

    if (forward || back) {
      isGoing.current = {
        forward: false,
        back: false,
      };
      return;
    } else {
      // this should only occur on link movements, not back/forward clicks
      dispatch(pushState(subroute ?? "root"));
    }
  }, [subroute]);

  const { data } = useGetAllFilesQueryState(undefined, {
    selectFromResult: (res) => ({
      ...res,
      data: !subroute
        ? res.data
        : res.data?.filter((file) => file.name === subroute),
    }),
  });

  const [currentFolderData] = data ?? [];

  const handleBackClick = () => {
    if (canGoBack) {
      /**
       * Perform the browser back action
       * dispatch the goBack action to keep redux in sync
       * and set the ref to avoid an infinite loop and incorrect state pushing
       */
      history.goBack();
      dispatch(goBack());
      isGoing.current.back = true;
    }
  };

  const handleForwardClick = () => {
    if (canGoForward) {
      /**
       * Perform the browser forward action
       * dispatch the goForward action to keep redux in sync
       * and set the ref to avoid an infinite loop and incorrect state pushing
       */
      history.goForward();
      dispatch(goForward());
      isGoing.current.forward = true;
    }
  };

  return (
    <>
      <Header
        backButtonDisabled={!canGoBack}
        forwardButtonDisabled={!canGoForward}
        onBackClick={handleBackClick}
        onForwardClick={handleForwardClick}
      >
        {subroute ? subroute : "All files"}
      </Header>
      <SideBar />
      <Container>
        <FileBrowser />
      </Container>
    </>
  );
};

const Container = styled.div`
  grid-column: 2 / 4;
  grid-row: 2 / 3;
  color: #fafafa66;
`;
