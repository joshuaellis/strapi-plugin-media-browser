import * as React from 'react';

import * as CardBase from './CardBase';
import type { MediaFile } from '../../data/fileApi';
import { VisuallyHidden } from '../VisuallyHidden';

export interface CardAssetProps extends MediaFile {
  isSelected?: boolean;
  onClick?: (uuid: string, event: React.MouseEvent<HTMLLabelElement>) => void;
  onDoubleClick?: (uuid: string, event: React.MouseEvent<HTMLLabelElement>) => void;
}

export const CardAsset = ({
  name,
  url,
  assetType,
  alternativeText,
  isSelected = false,
  onClick,
  onDoubleClick,
  uuid,
}: CardAssetProps) => {
  const handleClick: React.MouseEventHandler<HTMLLabelElement> = (event) => {
    if (event.detail === 1 && onClick) {
      onClick(uuid, event);
    }

    event.stopPropagation();
  };

  const handleDoubleClick: React.MouseEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();

    if (onDoubleClick) {
      onDoubleClick(uuid, event);
    }
  };

  return (
    <CardBase.Root $isChecked={isSelected}>
      <CardBase.Container onDoubleClick={handleDoubleClick} onClick={handleClick}>
        <CardBase.Media
          /* @ts-expect-error TODO: when we have all the file types, remove me. */
          type={assetType}
          alt={alternativeText ?? ''}
          src={url}
        />
        <CardBase.Label>
          <VisuallyHidden
            as="input"
            type="checkbox"
            // Noop to shut react up – is this still accessible? Does it need to be?
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onChange={() => {}}
            checked={isSelected}
          />
          <VisuallyHidden>{`Select `}</VisuallyHidden>
          {name}
        </CardBase.Label>
      </CardBase.Container>
    </CardBase.Root>
  );
};
