import { fetchAllAccountData, AllAccountData } from '@common/api/accounts';
import useSWR from 'swr';

export const useFetchAccountData = (principal: string) => {
  // TODO: generalize, use network settings
  const apiServer = origin.includes('localhost')
    ? 'http://localhost:3999'
    : 'https://stacks-node-api.blockstack.org';

  const fetcher = (principal: string): Promise<AllAccountData> =>
    fetchAllAccountData(apiServer)(principal);

  const data = useSWR<AllAccountData>(principal, fetcher, {
    refreshInterval: 5000,
    suspense: true,
  });

  return data;
};
