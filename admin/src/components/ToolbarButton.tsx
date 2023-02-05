import * as React from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';

import { IconButtonBase } from './IconButton';

export const ToolbarButton = ({ children, ...restProps }: Toolbar.ToolbarButtonProps) => {
  return (
    <IconButtonBase as={Toolbar.Button} {...restProps}>
      {children}
    </IconButtonBase>
  );
};
