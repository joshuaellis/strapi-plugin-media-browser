import * as React from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import { animated, useTransition } from '@react-spring/web';
import styled from 'styled-components';

import { IconButton } from './IconButton';
import { Cross } from './Icons/Cross';
import { TextButton } from './TextButton';
import * as CardBase from '../components/Cards/CardBase';
import { MediaFile } from '../data/fileApi';

interface AssetDetailsProps {
  asset: MediaFile | null;
  onCloseClick: () => void;
}

export const AssetDetails = ({ asset, onCloseClick }: AssetDetailsProps) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onCloseClick();
    }
  };

  const transitions = useTransition(asset, {
    from: {
      y: 40,
      opacity: 0,
    },
    enter: {
      y: 0,
      opacity: 1,
    },
    leave: {
      y: 40,
      opacity: 0,
    },
    config: {
      tension: 210,
      friction: 30,
      mass: 1,
    },
  });

  return (
    <Dialog.Root open={asset !== null} onOpenChange={handleOpenChange}>
      <Dialog.Portal forceMount>
        {transitions((styles, item) =>
          item ? (
            <>
              <DialogOverlay forceMount style={{ opacity: styles.opacity }} />
              <DialogContent>
                <DialogAnimatedContainer style={styles}>
                  <DialogHeader>
                    <DialogTitle>Asset Details</DialogTitle>
                    <Dialog.Close asChild>
                      <IconButton label="Close">
                        <Cross />
                      </IconButton>
                    </Dialog.Close>
                  </DialogHeader>
                  <Divider />
                  <DialogMain>
                    <AssetPreview>
                      <CardBase.Media
                        /* @ts-expect-error TODO: when we have all the file types, remove me. */
                        type={item.assetType}
                        alt={item.alternativeText ?? ''}
                        src={item.url}
                      />
                      <MetaList>
                        <MetaItem>
                          <MetaTitle>Size</MetaTitle>
                          <MetaDescription>{item.size}</MetaDescription>
                        </MetaItem>
                        <MetaItem>
                          <MetaTitle>MIME type</MetaTitle>
                          <MetaDescription>{item.mime}</MetaDescription>
                        </MetaItem>
                        <MetaItem>
                          <MetaTitle>Extension</MetaTitle>
                          <MetaDescription>{item.ext}</MetaDescription>
                        </MetaItem>
                        <MetaItem>
                          <MetaTitle>Dimensions</MetaTitle>
                          <MetaDescription>{`${item.width}x${item.height}px`}</MetaDescription>
                        </MetaItem>
                      </MetaList>
                      <AssetActions>
                        <TextButton size="S" variant="secondary">
                          Download
                        </TextButton>
                        <TextButton size="S" variant="secondary">
                          Copy URL
                        </TextButton>
                      </AssetActions>
                    </AssetPreview>
                  </DialogMain>
                  <Divider />
                  <DialogFooter>
                    <TextButton variant="danger">Delete</TextButton>
                    <TextButton>Save and Close</TextButton>
                  </DialogFooter>
                </DialogAnimatedContainer>
              </DialogContent>
            </>
          ) : null
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const DialogOverlay = styled(animated(Dialog.Overlay))`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  backdrop-filter: blur(5px);

  @supports not (backdrop-filter: blur(10px)) {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const DialogContent = styled(Dialog.Content)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 200;
  width: 80vw;
  height: 80vh;
  color: #fafafa;
`;

const DialogAnimatedContainer = styled(animated.div)`
  background-color: rgba(28, 28, 28, 1);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  height: 100%;
  padding: 18px 25px 25px;
  display: flex;
  flex-direction: column;
`;

const Divider = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  height: 1px;
  width: 100%;
`;

const DialogHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
`;

const DialogTitle = styled(Dialog.Title)`
  font-size: 20px;
  color: inherit;
  line-height: 100%;
`;

const DialogMain = styled.main`
  display: flex;
  gap: 40px;
  flex: 1;
  padding: 20px 0;
`;

const AssetPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-basis: 40%;
`;

const MetaList = styled.dl`
  font-size: 14px;
`;

const MetaItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  & + & {
    margin-top: 5px;
  }
`;

const MetaTitle = styled.dt`
  opacity: 0.8;
`;

const MetaDescription = styled.dd`
  opacity: 0.4;
`;

const AssetActions = styled.div`
  display: flex;
  gap: 10px;
`;

const DialogFooter = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
`;
