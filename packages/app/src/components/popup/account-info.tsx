import React from 'react';
import { AssetList } from '@components/popup/asset-list';
import { useFetchAccountData } from '@common/hooks/use-account-info';
import { useWallet } from '@common/hooks/use-wallet';
import { Flex } from '@stacks/ui';

export const AccountInfo: React.FC = () => {
  const { currentIdentity } = useWallet();
  const { data } = useFetchAccountData(currentIdentity.getStxAddress());
  if (!data) {
    return null;
  }
  return (
    <Flex flexWrap="wrap" flexDirection="column">
      <AssetList balances={data.balances} />
    </Flex>
  );
};
