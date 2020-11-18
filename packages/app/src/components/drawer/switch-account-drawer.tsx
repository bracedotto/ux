import React from 'react';
import { Box, Flex, Text } from '@blockstack/ui';
import { BaseDrawer, BaseDrawerProps } from './index';
import { useWallet } from '@common/hooks/use-wallet';
import { getIdentityDisplayName } from '@common/stacks-utils';
import { CheckmarkIcon } from '@components/icons/checkmark-icon';

export const SwitchAccountDrawer: React.FC<BaseDrawerProps> = ({ showing, close }) => {
  const { identities, currentIdentityIndex } = useWallet();
  const identityRows = identities.map((identity, index) => {
    return (
      <Box
        width="100%"
        key={identity.address}
        _hover={{
          backgroundColor: 'ink.150',
        }}
        cursor="pointer"
        px={6}
        py="base"
      >
        <Flex width="100%">
          <Box flexGrow={1}>
            <Text fontSize={2} display="block">
              {getIdentityDisplayName(identity, true)}
            </Text>
            <Text fontSize={1} color="gray">
              {identity.getStxAddress()}
            </Text>
          </Box>
          <Box pt="base-loose">{index === currentIdentityIndex ? <CheckmarkIcon /> : null}</Box>
        </Flex>
      </Box>
    );
  });
  return (
    <BaseDrawer showing={showing} close={close}>
      <Box width="100%" px={6}>
        <Text fontSize={4} fontWeight="600">
          Switch Account
        </Text>
      </Box>
      <Flex flexWrap="wrap" flexDirection="column">
        {identityRows}
      </Flex>
    </BaseDrawer>
  );
};
