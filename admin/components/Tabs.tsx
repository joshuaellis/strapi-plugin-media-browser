import * as React from 'react';

import * as TabPrimitive from '@radix-ui/react-tabs';
import { animated, useSpring } from '@react-spring/web';
import styled from 'styled-components';

interface TabContextValue {
  activeItem?: string;
}

const TabContext = React.createContext<TabContextValue>(null!);

export type TabsProps = Pick<TabPrimitive.TabsProps, 'defaultValue' | 'children'>;

export const Tabs = ({ defaultValue, children }: TabsProps) => {
  const [activeItem, setActiveItem] = React.useState(defaultValue);

  const handleValueChange: TabPrimitive.TabsProps['onValueChange'] = (value) => {
    setActiveItem(value);
  };

  return (
    <TabContext.Provider value={{ activeItem }}>
      <Root value={activeItem} onValueChange={handleValueChange}>
        {children}
      </Root>
    </TabContext.Provider>
  );
};

const Root = styled(TabPrimitive.Root)`
  width: 100%;
`;

export interface TabTrigger {
  label: string;
  value: string;
}

export interface TabsListProps {
  items: TabTrigger[];
}

export const TabsList = ({ items }: TabsListProps) => {
  const listRef = React.useRef<HTMLDivElement>(null!);
  const triggerRefs = React.useRef<Record<string, HTMLButtonElement>>({});

  const isHovering = React.useRef(false);

  const { activeItem } = React.useContext(TabContext);

  const [styles, api] = useSpring(() => ({
    opacity: 0,
    x: 0,
    width: 0,
  }));

  const [activeStyles, activeApi] = useSpring(() => ({
    x: 0,
    width: 0,
  }));

  const handlePointerEnter: React.PointerEventHandler<HTMLButtonElement> = (event) => {
    const button = event.currentTarget;

    const { x: listX } = listRef.current.getBoundingClientRect();
    const { x: buttonX, width } = button.getBoundingClientRect();

    const x = buttonX - listX;

    if (!isHovering.current) {
      api.set({
        x,
        width,
      });

      isHovering.current = true;
    }

    api.start({
      opacity: 1,
      x,
      width,
    });
  };

  const handleListPointerLeave = () => {
    isHovering.current = false;
    api.start({
      opacity: 0,
    });
  };

  const animateActiveIndicator = React.useCallback(
    (immediate = false) => {
      if (!activeItem) {
        return;
      }

      const button = triggerRefs.current[activeItem];

      const { x: listX } = listRef.current.getBoundingClientRect();
      const { x: buttonX, width } = button.getBoundingClientRect();

      const x = buttonX - listX;

      activeApi.start({
        x,
        width,
        immediate,
      });
    },
    [activeApi, activeItem]
  );

  /**
   * Set up the indicator for the default value.
   */
  React.useLayoutEffect(() => {
    animateActiveIndicator(true);
  }, []);

  React.useLayoutEffect(() => {
    animateActiveIndicator();
  }, [animateActiveIndicator]);

  return (
    <List ref={listRef} onPointerLeave={handleListPointerLeave}>
      {items.map((item) => (
        <Trigger
          ref={(ref) => (triggerRefs.current[item.value] = ref!)}
          onPointerEnter={handlePointerEnter}
          key={item.value}
          value={item.value}
        >
          {item.label}
        </Trigger>
      ))}
      <TriggerBackground style={styles} />
      <ActiveItemIndicator style={activeStyles} />
    </List>
  );
};

const List = styled(TabPrimitive.List)`
  color: #fafafa;
  border-bottom: solid 1px rgba(255, 255, 255, 0.1);
  padding: 5px 0;
  position: relative;
  z-index: 0;
`;

const Trigger = styled(TabPrimitive.Trigger)`
  padding: 10px 20px;
  font-size: 14px;
  line-height: 14px;
  opacity: 0.5;
  transition: opacity 200ms ease-out;
  position: relative;
  z-index: 1;

  &:hover {
    opacity: 1;
  }

  &[data-state='active'] {
    opacity: 1;
  }
`;

const TriggerBackground = styled(animated.div)`
  position: absolute;
  top: 5px;
  left: 0;
  height: calc(100% - 10px);
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
`;

const ActiveItemIndicator = styled(animated.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background-color: #fafafa;
`;

export const TabsContent = styled(TabPrimitive.Content)``;
