import * as React from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import { animated, useTransition } from '@react-spring/web';
import { prefixFileUrlWithBackendUrl } from '@strapi/helper-plugin';
import styled from 'styled-components';

import { IconButton } from './IconButton';
import { Cross } from './Icons/Cross';
import { notify } from './Notifications';
import { Tabs, TabsList, TabTrigger, TabsContent } from './Tabs';
import { TextButton } from './TextButton';
import * as CardBase from '../components/Cards/CardBase';
import { MediaFile } from '../data/fileApi';
import { downloadFile } from '../helpers/files';

interface AssetDetailsProps {
  asset: MediaFile | null;
  onCloseClick: () => void;
}

const TAB_ITEMS = [
  {
    label: 'Details',
    value: 'details',
  },
  {
    label: 'References',
    value: 'references',
  },
] as const;

type TabItems = (typeof TAB_ITEMS)[number];

type TabValues = {
  [key in TabItems['label']]: Extract<TabItems, { label: key }>['value'];
};

const TAB_VALUES = TAB_ITEMS.reduce((acc, curr) => {
  /* @ts-ignore */
  acc[curr.label] = curr.value;

  return acc;
}, {} as TabValues);

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

  const handleDownloadClick = () => {
    if (asset) {
      downloadFile(asset);
    }
  };

  const handleCopyClick = async () => {
    if (asset) {
      try {
        await navigator.clipboard.writeText(prefixFileUrlWithBackendUrl(asset.url));

        notify({
          status: 'success',
          title: 'URL copied to clipboard',
          closable: false,
        });
      } catch (err) {
        console.error('failed to copy url to clipboard', err);
        notify({
          status: 'error',
          title: 'Failed to copy url to clipboard',
          closable: false,
        });
      }
    }
  };

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
                        <TextButton onClick={handleDownloadClick} size="S" variant="secondary">
                          Download
                        </TextButton>
                        <TextButton onClick={handleCopyClick} size="S" variant="secondary">
                          Copy URL
                        </TextButton>
                      </AssetActions>
                    </AssetPreview>
                    <TabsSection>
                      <Tabs defaultValue="details">
                        <TabsList items={TAB_ITEMS as unknown as TabTrigger[]} />
                        <TabsContent value={TAB_VALUES.Details}>
                          <h1>aha you found me</h1>
                        </TabsContent>
                        <TabsContent value={TAB_VALUES.References}>
                          <h1>references</h1>
                        </TabsContent>
                      </Tabs>
                    </TabsSection>
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
  padding: 20px 25px 25px;
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

const TabsSection = styled.div`
  flex-basis: 60%;
`;

const DialogFooter = styled.footer`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
`;
