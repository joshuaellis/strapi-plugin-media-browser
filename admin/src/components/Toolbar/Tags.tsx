import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import styled, { keyframes } from 'styled-components';
import { animated, useTransition } from '@react-spring/web';
import * as Accordion from '@radix-ui/react-accordion';

import { Tag } from '../Icons/Tag';
import { ToolbarButton } from '../ToolbarButton';
import { VisuallyHidden } from '../VisuallyHidden';
import { Cross } from '../Icons/Cross';
import { InfoCircle } from '../Icons/InfoCircle';
import { IconButton } from '../IconButton';

import { useGetAllTagsQuery, TagEntity } from '../../data/tagApi';

import { FILE_BROWSER_CONTAINER_ID } from '../../constants';
import { Pencil } from '../Icons/Pencil';

interface TagsToolbarButtonProps {
  disabled?: boolean;
}

export const TagsToolbarButton = ({ disabled }: TagsToolbarButtonProps) => {
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const { data } = useGetAllTagsQuery(undefined);

  React.useLayoutEffect(() => {
    const container = document.getElementById(FILE_BROWSER_CONTAINER_ID);

    setContainer(container);
  }, []);

  const transitions = useTransition(isOpen, {
    from: {
      x: '100%',
      opacity: 0,
    },
    enter: {
      x: '0',
      opacity: 1,
    },
    leave: {
      x: '100%',
      opacity: 0,
    },
    config: {
      tension: 210,
      friction: 30,
      mass: 1,
    },
  });

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <ToolbarButton asChild aria-disabled={disabled}>
        <Dialog.Trigger style={{ pointerEvents: isOpen ? 'none' : 'all' }} disabled={disabled}>
          <Tag />
        </Dialog.Trigger>
      </ToolbarButton>
      <Dialog.Portal forceMount container={container}>
        {transitions(({ opacity, x }, item) =>
          item ? (
            <>
              <Dialog.Overlay>
                <DialogOverlay style={{ opacity }} />
              </Dialog.Overlay>
              <Dialog.Content forceMount asChild>
                <DialogContent style={{ x }}>
                  <DialogHeader>
                    <DialogTitle>Tags</DialogTitle>
                    <Dialog.Close asChild>
                      <IconButton label="close">
                        <Cross color="#fafafa" />
                      </IconButton>
                    </Dialog.Close>
                  </DialogHeader>
                  <VisuallyHidden>
                    <Dialog.Description>{'Create, delete & manage your tags.'}</Dialog.Description>
                  </VisuallyHidden>
                  <TagContainer>
                    <Divider />
                    <Accordion.Root type="multiple" asChild>
                      <TagList>
                        {data?.map((tag) => (
                          <TagItem key={tag.uuid}>
                            <TagAccordion {...tag} />
                          </TagItem>
                        ))}
                      </TagList>
                    </Accordion.Root>
                  </TagContainer>
                </DialogContent>
              </Dialog.Content>
            </>
          ) : null
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const DialogContent = styled(animated.div)`
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  z-index: 200;
  box-shadow: -3px 0 12px -10px rgba(0, 0, 0, 0.5);
  background-color: rgb(28, 28, 28);
  padding: 18px 25px 25px;
  display: flex;
  flex-direction: column;
  color: #fafafa;
`;

const DialogOverlay = styled(animated.div)`
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

const DialogTitle = styled(Dialog.Title)`
  font-size: 20px;
  color: inherit;
  line-height: 100%;
  position: relative;
  bottom: 2px;
`;

const DialogHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const TagContainer = styled.div`
  flex: 1;
`;

const Divider = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  height: 1px;
  width: 100%;
`;

const TagList = styled.ul`
  padding-top: 10px;
`;

const TagItem = styled.li`
  background-color: rgba(255, 255, 255, 0.04);
  border-radius: 5px;
`;

type TagAccordionProps = TagEntity;

const TagAccordion = ({ uuid, files, createdBy, name }: TagAccordionProps) => {
  return (
    <Accordion.Item value={uuid}>
      <AccordionHeader asChild>
        <div>
          <AccordionTitle>{name}</AccordionTitle>
          <AccordionActions>
            <AccordionNameActions>
              <DimmedIconButton label="Rename tag">
                <Pencil />
              </DimmedIconButton>
              <DimmedIconButton label="Delete tag">
                <Cross />
              </DimmedIconButton>
            </AccordionNameActions>
            <Accordion.Trigger asChild>
              <DimmedIconButton label="Show information">
                <InfoCircle />
              </DimmedIconButton>
            </Accordion.Trigger>
          </AccordionActions>
        </div>
      </AccordionHeader>
      <Accordion.Content asChild>
        <AccordionContent>
          <Divider />
          <AccordionList>
            <AccordionListItemFlex>
              <dt>{'Used in'}</dt>
              <dd>{`${files.count} ${files.count === 1 ? 'file' : 'files'}.`}</dd>
            </AccordionListItemFlex>
            <AccordionListItemFlex>
              {createdBy ? (
                <>
                  <dt>{'Created by'}</dt>
                  <dd>{`${createdBy.firstname} ${createdBy.lastname}`}</dd>
                </>
              ) : null}
            </AccordionListItemFlex>
          </AccordionList>
        </AccordionContent>
      </Accordion.Content>
    </Accordion.Item>
  );
};

const AccordionNameActions = styled.div`
  display: flex;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;

  &:focus-visible,
  &:focus-within {
    opacity: 1;
  }
`;

const AccordionHeader = styled(Accordion.Header)`
  width: 100%;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    ${AccordionNameActions} {
      opacity: 1;
    }
  }
`;

const AccordionTitle = styled.h3`
  color: inherit;
`;

const AccordionActions = styled.div`
  display: flex;
`;

const DimmedIconButton = styled(IconButton)`
  opacity: 0.6;

  & > svg {
    width: 15px;
  }
`;

const slideDown = keyframes`
  from {
    height: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
  }
`;

/**
 * TODO: it'd be nice to make these spring operated.
 */
const slideUp = keyframes`
  from {
    height: var(--radix-accordion-content-height);
  }
  to {
    height: 0;
  }
`;

const AccordionContent = styled.div`
  padding: 0 15px;
  overflow: hidden;

  &[data-state='open'] {
    animation: ${slideDown} 200ms ease-out;
  }

  &[data-state='closed'] {
    animation: ${slideUp} 200ms ease-out;
  }
`;

const AccordionList = styled.dl`
  padding: 15px 0;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
`;

const AccordionListItemFlex = styled.div`
  display: flex;
  gap: 0.25em;
  font-size: 14px;
  opacity: 0.8;
`;
