import * as React from 'react';

import * as Accordion from '@radix-ui/react-accordion';
import * as Dialog from '@radix-ui/react-dialog';
import { animated, useTransition } from '@react-spring/web';
import styled, { css, keyframes } from 'styled-components';

import { FILE_BROWSER_CONTAINER_ID } from '../../constants';
import { useFileMutationApi } from '../../data/fileApi';
import { useGetAllTagsQuery, useTagMutationApi, type TagEntity } from '../../data/tagApi';
import { composeEventHandlers } from '../../helpers/events';
import { useQuery } from '../../hooks/useQuery';
import { useTypedSelector } from '../../store/hooks';
import { selectSelectedItemsWithTags } from '../../store/selectors';
import { IconButton } from '../IconButton';
import { Cross } from '../Icons/Cross';
import { InfoCircle } from '../Icons/InfoCircle';
import { Pencil } from '../Icons/Pencil';
import { Tag } from '../Icons/Tag';
import { notify } from '../Notifications';
import { TextButton } from '../TextButton';
import { TextInput, type TextInputProps } from '../TextInput';
import { ToolbarButton } from '../ToolbarButton';
import { VisuallyHidden } from '../VisuallyHidden';

interface TagsToolbarButtonProps {
  disabled?: boolean;
}

export const TagsToolbarButton = ({ disabled }: TagsToolbarButtonProps) => {
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [showNewTagForm, setShowNewTagForm] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null!);

  const [query] = useQuery();
  const selectedItems = useTypedSelector(selectSelectedItemsWithTags(query));
  const hasSelectedItems = selectedItems.length > 0;

  const { data } = useGetAllTagsQuery(undefined);

  const { postNewTag, deleteTag, updateTag } = useTagMutationApi();
  const { updateFile, isUpdateFileLoading } = useFileMutationApi();

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

  const handleNewTagClick = () => {
    setShowNewTagForm(true);
  };

  const hideNewTagAndRestoreFocus = (clearInput = false) => {
    /**
     * Restore UI to the state before the new folder form was shown.
     * Therefore focussing the new folder button.
     */
    if (inputRef.current && clearInput) {
      inputRef.current.value = '';
    }
    setShowNewTagForm(false);
    triggerRef.current.focus();
  };

  const handleNewTagBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    if (e.currentTarget.value === '') {
      hideNewTagAndRestoreFocus();
    } else {
      // TODO: handle blur but also take into account blur happens when the form is submitted
    }
  };

  React.useEffect(() => {
    if (showNewTagForm && inputRef.current) {
      /**
       * Focus the input in the form when the form is shown.
       */
      inputRef.current.focus();
    }
  }, [showNewTagForm]);

  const handleNewTagFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    const data = new FormData(e.currentTarget);

    const tagName = data.get('tagName');

    if (tagName === '') {
      hideNewTagAndRestoreFocus();
      return;
    } else if (typeof tagName === 'string') {
      const res = await postNewTag({
        name: tagName,
      });

      if ('data' in res) {
        /* This assumes success and we therefore reset the form */
        hideNewTagAndRestoreFocus(true);
      } else if ('error' in res) {
        console.error(res.error);
        notify({
          status: 'error',
          title: "Couldn't delete folder",
          closable: false,
        });
      }
    }
  };

  const handleOpenChange = (internalIsOpen: boolean) => {
    if (!internalIsOpen) {
      setShowNewTagForm(false);
    }

    setIsOpen(internalIsOpen);
  };

  const handleTagDelete: TagAccordionProps['onTagDelete'] = async (uuid) => {
    const res = await deleteTag({ uuid });

    if ('error' in res) {
      console.error(res.error);
      notify({
        status: 'error',
        title: "Couldn't delete tag",
        closable: false,
      });
    }
  };

  const handleTagRename: TagAccordionProps['onTagRename'] = async (uuid, { name }) => {
    const res = await updateTag({ uuid, name });

    if ('data' in res) {
      return true;
    } else if ('error' in res) {
      console.error(res.error);
      notify({
        status: 'error',
        title: "Couldn't rename tag",
        closable: false,
      });
    }

    return false;
  };

  const handleApplyTagsSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);

    const connectedTagUUIDs = Array.from(data.getAll('tags')).map((uuid) => uuid.toString());

    const res = await updateFile({
      uuid: selectedItems.map((item) => item.uuid),
      patch: {
        tags: {
          set: connectedTagUUIDs,
        },
      },
    });

    if ('data' in res) {
      setIsOpen(false);
      notify({
        status: 'success',
        title: 'Applied tags to files',
        closable: false,
      });
      // show success toast
    } else if ('error' in res) {
      console.error(res.error);
      notify({
        status: 'error',
        title: "Couldn't apply tags to files",
        closable: false,
      });
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <ToolbarButton asChild aria-disabled={disabled}>
        <Dialog.Trigger style={{ pointerEvents: isOpen ? 'none' : 'all' }} disabled={disabled}>
          <Tag />
        </Dialog.Trigger>
      </ToolbarButton>
      <Dialog.Portal forceMount container={container}>
        {transitions(({ opacity, x }, item) =>
          item ? (
            <>
              <Dialog.Overlay forceMount asChild>
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
                  {hasSelectedItems ? (
                    <TagContainer as="form" onSubmit={handleApplyTagsSubmit}>
                      <TagContainer>
                        <Divider />
                        <TagList as="fieldset">
                          <VisuallyHidden as="legend">Tags to apply</VisuallyHidden>
                          {data?.map((tag) => {
                            const isChecked =
                              selectedItems.every((item) => item.tags.includes(tag.uuid)) &&
                              'checked';
                            const isIndeterminate =
                              selectedItems.some((item) => item.tags.includes(tag.uuid)) &&
                              !isChecked &&
                              'indeterminate';
                            return (
                              <TagItem $disabled={isUpdateFileLoading} as="label" key={tag.uuid}>
                                <AccordionHeader
                                  as="span"
                                  style={{ justifyContent: 'flex-start', gap: '10px' }}
                                >
                                  <Checkbox
                                    initialState={isChecked || isIndeterminate || 'unchecked'}
                                    value={tag.uuid}
                                    disabled={isUpdateFileLoading}
                                  />
                                  <AccordionTitle as="span">{tag.name}</AccordionTitle>
                                </AccordionHeader>
                              </TagItem>
                            );
                          })}
                        </TagList>
                      </TagContainer>
                      <SubmitButton aria-busy={isUpdateFileLoading}>Apply tags</SubmitButton>
                    </TagContainer>
                  ) : (
                    <>
                      <TagContainer>
                        <Divider />
                        <Accordion.Root type="multiple" asChild>
                          <TagList>
                            {showNewTagForm ? (
                              <TagItem $isForm>
                                <NewTagForm
                                  ref={inputRef}
                                  onBlur={handleNewTagBlur}
                                  onFormSubmit={handleNewTagFormSubmit}
                                />
                              </TagItem>
                            ) : null}
                            {data?.map((tag) => (
                              <TagItem key={tag.uuid}>
                                <TagAccordion
                                  {...tag}
                                  onTagDelete={handleTagDelete}
                                  onTagRename={handleTagRename}
                                />
                              </TagItem>
                            ))}
                          </TagList>
                        </Accordion.Root>
                        <Divider />
                      </TagContainer>
                      <SubmitButton
                        ref={triggerRef}
                        disabled={showNewTagForm}
                        aria-disabled={showNewTagForm}
                        onClick={handleNewTagClick}
                      >
                        New Tag
                      </SubmitButton>
                    </>
                  )}
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
  gap: 20px;
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
`;

const TagContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Divider = styled.div`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  height: 1px;
  width: 100%;
`;

const TagList = styled.ul`
  padding-top: 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TagItem = styled.li<{ $isForm?: boolean; $disabled?: boolean }>`
  background-color: ${(props) => (props.$isForm ? 'transparent' : 'rgba(255, 255, 255, 0.04)')};
  border-radius: 5px;

  ${(props) =>
    props.$isForm
      ? css`
          pointer-events: ${props.$disabled ? 'none' : 'auto'};
          opacity: ${props.$disabled ? 0.5 : 1};
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 12px 15px;
          cursor: ${props.$disabled ? 'not-allowed' : 'pointer'};

          &:focus-within {
            outline: 2px solid #0855c9;
          }
        `
      : ''}
`;

const SubmitButton = styled(TextButton)`
  width: 100%;
`;

interface TagAccordionProps extends TagEntity {
  onTagDelete?: (uuid: string) => void;
  onTagRename?: (uuid: string, { name }: { name: string }) => Promise<boolean>;
}

const TagAccordion = ({
  uuid,
  files,
  createdBy,
  name,
  onTagDelete,
  onTagRename,
}: TagAccordionProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  const handleTagDelete = (uuid: string) => () => {
    if (onTagDelete) {
      onTagDelete(uuid);
    }
  };

  const handleRenameClick = () => {
    setIsEditing(true);
  };

  const handleFormSubmit: NewTagFormProps['onFormSubmit'] = (e) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);

    const tagNameValue = data.get('tagName');

    if (tagNameValue && typeof tagNameValue === 'string') {
      handleRename(uuid, tagNameValue);
    }
  };

  const handleRename = async (uuid: string, name: string) => {
    if (onTagRename) {
      const success = await onTagRename(uuid, { name });
      setIsEditing(!success);
    } else {
      setIsEditing(false);
    }
  };

  const handleFormBlur: NewTagFormProps['onBlur'] = (e) => {
    handleRename(uuid, e.currentTarget.value);
  };

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <Accordion.Item value={uuid}>
      <AccordionHeader asChild $isEditing={isEditing}>
        <div>
          {isEditing ? (
            <NewTagForm
              ref={inputRef}
              initialValue={name}
              onBlur={handleFormBlur}
              onFormSubmit={handleFormSubmit}
            />
          ) : (
            <>
              <AccordionTitle>{name}</AccordionTitle>
              <AccordionActions>
                <AccordionNameActions>
                  <DimmedIconButton onClick={handleRenameClick} label="Rename tag">
                    <Pencil />
                  </DimmedIconButton>
                  <DimmedIconButton onClick={handleTagDelete(uuid)} label="Delete tag">
                    <Cross />
                  </DimmedIconButton>
                </AccordionNameActions>
                <Accordion.Trigger asChild>
                  <DimmedIconButton label="Show information">
                    <InfoCircle />
                  </DimmedIconButton>
                </Accordion.Trigger>
              </AccordionActions>
            </>
          )}
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

const AccordionHeader = styled(Accordion.Header)<{ $isEditing?: boolean }>`
  width: 100%;
  padding: ${(props) => (props.$isEditing ? '13px 15px' : '10px 15px')};
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
  padding: 3px 0;
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

interface NewTagFormProps extends Pick<TextInputProps, 'onBlur' | 'initialValue'> {
  onFormSubmit?: React.FormEventHandler<HTMLFormElement>;
}

const NewTagForm = React.forwardRef<HTMLInputElement, NewTagFormProps>(
  ({ onFormSubmit, onBlur, initialValue }, ref) => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (onFormSubmit) {
        onFormSubmit(e);
      }
    };

    return (
      <form onSubmit={handleSubmit}>
        <TextInput
          hasUnderline={false}
          ref={ref}
          label="Tag name"
          onBlur={onBlur}
          initialValue={initialValue}
          name="tagName"
        />
      </form>
    );
  }
);

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  initialState?: CheckboxState;
}

type CheckboxState = 'checked' | 'unchecked' | 'indeterminate';

const Checkbox = ({ initialState = 'unchecked', ...props }: CheckboxProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null!);
  const [checkedType, setCheckedType] = React.useState(initialState);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setCheckedType(e.target.checked ? 'checked' : 'unchecked');
  };

  React.useEffect(() => {
    inputRef.current.indeterminate = checkedType === 'indeterminate';
  }, [checkedType]);

  return (
    <CheckboxBorder>
      <VisuallyHidden
        as="input"
        ref={inputRef}
        type="checkbox"
        name="tags"
        {...props}
        checked={checkedType === 'checked'}
        onChange={composeEventHandlers(handleChange, props.onChange)}
      />
      <CheckboxInner $variant={checkedType} />
    </CheckboxBorder>
  );
};

const CheckboxBorder = styled.span`
  width: 16px;
  height: 16px;
  border: solid 1px #fafafa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  top: 1px;
`;

const CheckboxInner = styled.span<{ $variant: CheckboxState }>`
  background: ${(props) => (props.$variant !== 'unchecked' ? '#fafafa' : 'transparent')};
  border-radius: 1px;
  padding: 4px;
  clip-path: ${(props) =>
    props.$variant === 'indeterminate' ? 'polygon(0% 0%, 0% 100%, 100% 0%)' : 'unset'};
`;
