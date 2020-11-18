import { ContractCallArgument, ContractCallArgumentType } from '@stacks/connect';
import {
  uintCV,
  intCV,
  falseCV,
  trueCV,
  contractPrincipalCV,
  standardPrincipalCV,
  bufferCV,
} from '@blockstack/stacks-transactions';
import RPCClient from '@stacks/rpc-client';
import BigNumber from 'bignumber.js';
import { Identity } from '@stacks/keychain';

export const encodeContractCallArgument = ({ type, value }: ContractCallArgument) => {
  switch (type) {
    case ContractCallArgumentType.UINT:
      return uintCV(value);
    case ContractCallArgumentType.INT:
      return intCV(value);
    case ContractCallArgumentType.BOOL:
      if (value === 'false' || value === '0') return falseCV();
      else if (value === 'true' || value === '1') return trueCV();
      else throw new Error(`Unexpected Clarity bool value: ${JSON.stringify(value)}`);
    case ContractCallArgumentType.PRINCIPAL:
      if (value.includes('.')) {
        const [addr, name] = value.split('.');
        return contractPrincipalCV(addr, name);
      } else {
        return standardPrincipalCV(value);
      }
    case ContractCallArgumentType.BUFFER:
      return bufferCV(Buffer.from(value));
    default:
      throw new Error(`Unexpected Clarity type: ${type}`);
  }
};

export const getRPCClient = () => {
  const { origin } = location;
  const url = origin.includes('localhost')
    ? 'http://localhost:3999'
    : 'https://stacks-node-api.blockstack.org';
  return new RPCClient(url);
};

export const stacksValue = ({
  value,
  fixedDecimals = false,
  withTicker = true,
}: {
  value: number | string;
  fixedDecimals?: boolean;
  withTicker?: boolean;
}) => {
  const microStacks = new BigNumber(value);
  const stacks = microStacks.shiftedBy(-6);
  const stxString = fixedDecimals ? stacks.toFormat(6) : stacks.decimalPlaces(6).toFormat();
  return `${stxString}${withTicker ? ' STX' : ''}`;
};

export function shortenHex(hex: string, length = 4) {
  return `${hex.substring(0, length + 2)}…${hex.substring(hex.length - length)}`;
}

/**
 * truncateMiddle
 *
 * @param {string} input - the string to truncate
 * @param {number} offset - the number of chars to keep on either end
 */
export const truncateMiddle = (input: string, offset = 5): string => {
  if (input.startsWith('0x')) {
    return shortenHex(input, offset);
  }
  const start = input?.substr(0, offset);
  const end = input?.substr(input.length - offset, input.length);
  return `${start}…${end}`;
};

export const getIdentityDisplayName = (identity: Identity, truncate = false): string => {
  if (identity.defaultUsername) {
    return identity.defaultUsername;
  }
  const address = identity.getStxAddress();
  if (truncate) {
    return truncateMiddle(address);
  }
  return address;
};
