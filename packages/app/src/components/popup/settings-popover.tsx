import React from 'react';
import { Box, Text, BoxProps } from '@blockstack/ui';
import useOnClickOutside from 'use-onclickoutside';

interface SettingsPopoverProps {
  showing: boolean;
  close: () => void;
  showSwitchAccount: () => void;
}
export const SettingsPopover: React.FC<SettingsPopoverProps> = ({
  showing,
  close,
  showSwitchAccount,
}) => {
  // const ref = React.useRef(null);

  // useOnClickOutside(ref, () => {
  //   if (showing) {
  //     close();
  //   }
  // });

  const SettingsItem: React.FC<BoxProps> = ({ onClick, ...props }) => (
    <Box
      {...props}
      width="100%"
      p="base-tight"
      _hover={{ backgroundColor: 'ink.150' }}
      onClick={e => {
        close();
        onClick?.(e);
      }}
    />
  );

  const Divider: React.FC = () => (
    <Box width="100%" my="tight" height="1px" backgroundColor="ink.150" />
  );

  return (
    <Box
      // ref={ref}
      position="absolute"
      top="14px"
      right="0px"
      borderRadius="8px"
      width="296px"
      boxShadow="0px 8px 16px rgba(27, 39, 51, 0.08);"
      zIndex={2000}
      background="white"
      display={showing ? 'block' : 'none'}
    >
      <SettingsItem mt="tight" onClick={() => showSwitchAccount()}>
        <Text>Switch account</Text>
      </SettingsItem>
      <SettingsItem>
        <Text>Create an Account</Text>
      </SettingsItem>
      <SettingsItem>
        <Text>View Secret Key</Text>
      </SettingsItem>
      <Divider />
      <SettingsItem>
        <Text>Add username</Text>
      </SettingsItem>
      <Divider />
      <SettingsItem mb="tight">
        <Text>Change Network</Text>
      </SettingsItem>
    </Box>
  );
};
