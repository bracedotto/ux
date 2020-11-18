import React, { useState } from 'react';
import { Box, Flex, Text, CloseIcon } from '@stacks/ui';
import { ConnectIcon } from '@components/icons/connect-icon';
import styled from '@emotion/styled';
import { SwitchAccountDrawer } from '@components/drawer/switch-account-drawer';
import { EllipsisIcon } from '@components/icons/ellipsis-icon';
import { SettingsPopover } from './settings-popover';

const CloseIconContainer = styled(Box)`
  svg {
    height: 12px;
    opacity: 50%;
    margin-top: 10px;
  }
`;

interface PopupHomeProps {
  title?: string;
  onClose?: () => void;
}
export const PopupContainer: React.FC<PopupHomeProps> = ({ children, title, onClose }) => {
  const [isShowingSwitchAccount, setShowingSwitchAccount] = useState(false);
  const [isShowingPopover, setShowingPopover] = useState(false);
  return (
    <>
      <SwitchAccountDrawer
        showing={isShowingSwitchAccount}
        close={() => setShowingSwitchAccount(false)}
      />
      <Flex
        minHeight="560px"
        maxHeight="720px"
        width="440px"
        background="white"
        p="24px"
        flexWrap="wrap"
        flexDirection="column"
      >
        <Flex width="100%">
          <Box flexGrow={1}>
            {title ? (
              <Text fontSize={4} fontWeight="600">
                {title}
              </Text>
            ) : (
              <ConnectIcon height="16px" />
            )}
          </Box>
          {onClose ? (
            <CloseIconContainer>
              <CloseIcon height="16px" cursor="pointer" onClick={onClose} />
            </CloseIconContainer>
          ) : (
            <Box cursor="pointer" position="relative">
              <SettingsPopover
                showing={isShowingPopover}
                close={() => setShowingPopover(false)}
                showSwitchAccount={() => {
                  setShowingSwitchAccount(true);
                }}
              />
              <EllipsisIcon onClick={() => setShowingPopover(true)} />
            </Box>
          )}
        </Flex>
        {children}
      </Flex>
    </>
  );
};
