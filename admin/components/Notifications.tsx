import * as React from 'react';

import { Toaster, toast } from 'sonner';
import styled, { css } from 'styled-components';

import { IconButton } from './IconButton';
import { CircleCheck } from './Icons/CircleCheck';
import { CircleError } from './Icons/CircleError';
import { CircleInfo } from './Icons/CircleInfo';
import { Cross } from './Icons/Cross';

export interface Notification {
  status: 'success' | 'error' | 'info';
  title?: React.ReactNode;
  description?: React.ReactNode;
  closable?: boolean;
}

export const Notifications = () => {
  return <Toaster position="bottom-right" visibleToasts={5} />;
};

interface ToastProps extends Notification {
  onDimiss: () => void;
}

export const notify = (notification: Notification) =>
  toast.custom((id) => <Toast {...notification} onDimiss={() => toast.dismiss(id)} />);

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ title, description, status, closable = true, onDimiss }, ref) => {
    return (
      <ToastContainer ref={ref} $status={status}>
        <ToastIcon>
          {status === 'success' && <CircleCheck width={20} color="hsl(100 90% 45% / 1)" />}
          {status === 'info' && <CircleInfo width={20} opacity={0.6} />}
          {status === 'error' && <CircleError width={20} color="hsl(10 100% 50% / 1)" />}
        </ToastIcon>
        <ToastContent>
          {title ? <ToastTitle>{title}</ToastTitle> : null}
          {closable && (
            <CloseButton onClick={onDimiss} label="Dismiss notification">
              <Cross />
            </CloseButton>
          )}
          {description ? <ToastDescription>{description}</ToastDescription> : null}
        </ToastContent>
      </ToastContainer>
    );
  }
);

const ToastContainer = styled.div<{ $status: Notification['status'] }>`
  background-color: #171717;
  color: #fafafa;
  border: solid 1px #fafafa33;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 4px 12px #fafafa05;
  width: 356px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  overflow: hidden;

  ${(props) =>
    props.$status !== 'info'
      ? css`
  border-color: ${
    props.$status === 'success' ? 'hsl(100 90% 45% / 0.5)' : 'hsl(10 100% 50% / 0.5)'
  }};
  `
      : ''}
`;

const ToastIcon = styled.div`
  margin-top: 1px;
`;

const ToastContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 12px;
  right: 12px;
`;

const ToastTitle = styled.h1`
  font-size: 14px;
  line-height: 1.5;
`;

const ToastDescription = styled.p`
  font-size: 14px;
  font-weight: 300;
  margin-bottom: 4px;

  & a {
    color: inherit;
    text-decoration: underline;
  }
`;
