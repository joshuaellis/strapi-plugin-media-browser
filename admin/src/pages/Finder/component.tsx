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

import { useTypedDispatch, useTypedSelector } from "../../store/hooks";

import { goBack, goForward, pushState } from "../../modules/finder";

import { useGetAllFilesAtFolderQuery } from "../../data/fileApi";
import { useQuery } from "../../hooks/useQuery";

import axios from "../../utils/axiosInstance";

export const Finder: React.FunctionComponent = () => {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useTypedDispatch();
  const selectedItems = useTypedSelector((state) => state.finder.selectedItems);
  const folder = useTypedSelector((state) => state.finder.currentPlace);

  const [query] = useQuery();
  const selectedUUIDs = useTypedSelector((state) => state.finder.selectedItems);
  const { data: files = [] } = useGetAllFilesAtFolderQuery({
    folder: folder === "root" ? "" : folder,
    sortBy: query.get("sortBy") ?? "none",
  });

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

  const handleDownloadClick = () => {
    const itemsToDownload = files.filter((file) =>
      selectedUUIDs.includes(file.uuid)
    );

    Promise.all(
      itemsToDownload.map(async (file) => {
        try {
          /**
           * Get the _actual_ file from the server as a blob
           */
          const response = await axios.get(file.url, {
            responseType: "blob",
          });

          if ("data" in response) {
            /**
             * Create the blob and object URL
             * Create a link and click it to download the file
             * Revoke the object URL and the anchor
             */
            const blob = new Blob([response.data], { type: "image/png" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          } else if ("error" in response) {
            throw response.error;
          }
        } catch (err) {
          /**
           * TODO: Handle errors
           */
        }
      })
    );
  };

  const filesWithSelection = files.map((card) => {
    /**
     * If the UUID is in the selectedItems of the store
     * then we want to mark the card as selected so the
     * necessary styles can be applied.
     */
    if ("uuid" in card) {
      return {
        ...card,
        isSelected: selectedUUIDs.includes(card.uuid),
      };
    }

    return card;
  });

  return (
    <>
      <Header
        backButtonDisabled={!canGoBack}
        forwardButtonDisabled={!canGoForward}
        onBackClick={handleBackClick}
        onForwardClick={handleForwardClick}
        canDownload={selectedItems.length > 0}
        onDownloadClick={handleDownloadClick}
      >
        {subroute ? subroute : "All files"}
      </Header>
      <SideBar />
      <Container>
        <FileBrowser files={filesWithSelection} />
      </Container>
    </>
  );
};

const Container = styled.div`
  grid-column: 2 / 4;
  grid-row: 2 / 3;
  color: #fafafa66;
`;
