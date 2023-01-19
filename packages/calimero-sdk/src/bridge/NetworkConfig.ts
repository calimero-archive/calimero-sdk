import {ChainType, Environment, NetworkType} from './Utils';
import {
  CALIMERO_NETWORK_SUFFIX, CALIMERO_RPC_NODE_SUFFIX,
  CALIMERO_RPC_NODE_URL_DEV,
  CALIMERO_RPC_NODE_URL_PROD,
  CALIMERO_RPC_NODE_URL_STAGE,
  MAINNET_NETWORK_ID,
  MAINNET_NETWORK_SUFFIX,
  TESTNET_NETWORK_ID,
  TESTNET_NETWORK_SUFFIX
} from './Constants';

export const nearConfigTestnet = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://explorer.testnet.near.org',
  headers: {},
};

export const nearConfigMainnet = {
  networkId: 'mainnet',
  nodeUrl: 'https://rpc.mainnet.near.org',
  walletUrl: 'https://wallet.mainnet.near.org',
  helperUrl: 'https://helper.mainnet.near.org',
  explorerUrl: 'https://explorer.mainnet.near.org',
  headers: {},
};

export function getNetworkId(chain: ChainType, network: NetworkType, shardName = ''): string {
  if (chain === ChainType.NEAR) {
    if (network === NetworkType.TESTNET) return TESTNET_NETWORK_ID;
    if (network === NetworkType.MAINNET) return MAINNET_NETWORK_ID;
  }
  if (chain === ChainType.CALIMERO) {
    if (network === NetworkType.TESTNET) return shardName + CALIMERO_NETWORK_SUFFIX + TESTNET_NETWORK_SUFFIX;
    if (network === NetworkType.MAINNET) return shardName + CALIMERO_NETWORK_SUFFIX + MAINNET_NETWORK_SUFFIX;
  }
  return '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getNearConfig(network: NetworkType): any {
  if (network === NetworkType.TESTNET) return nearConfigTestnet;
  if (network === NetworkType.MAINNET) return nearConfigMainnet;
  return null;
}

export function getNearRpcUrl(network: NetworkType): string {
  return getNearConfig(network).nodeUrl;
}
export function getCalimeroRpcUrl(network: NetworkType, env: Environment, shardName: string): string {
  const networkId = getNetworkId(ChainType.CALIMERO, network, shardName);
  if (env === Environment.DEVELOPMENT) {
    return CALIMERO_RPC_NODE_URL_DEV + networkId + CALIMERO_RPC_NODE_SUFFIX;
  }
  if (env === Environment.STAGING) {
    return CALIMERO_RPC_NODE_URL_STAGE + networkId + CALIMERO_RPC_NODE_SUFFIX;
  }
  if (env === Environment.PRODUCTION) {
    return CALIMERO_RPC_NODE_URL_PROD + networkId + CALIMERO_RPC_NODE_SUFFIX;
  }
  return '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCalimeroConfig(network: NetworkType, env: Environment, shardName: string, apiKey: string): any {
  const networkId = getNetworkId(ChainType.CALIMERO, network, shardName);
  return {
    networkId: networkId,
    nodeUrl: getCalimeroRpcUrl(network, env, shardName),
    headers: {
      ['x-api-key']: apiKey,
    }
  };
}

export function getConnectionConfig(
  chain: ChainType,
  network: NetworkType,
  env: Environment,
  shardName = '',
  apiKey = ''
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {

  if (chain === ChainType.NEAR) {
    return getNearConfig(network);
  }
  if (chain === ChainType.CALIMERO) {
    return getCalimeroConfig(network, env, shardName, apiKey);
  }
  return null;
}

export function getConnectionInfo(
  chain: ChainType,
  network: NetworkType,
  env: Environment,
  shardName: string,
  apiKey: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {

  if (chain === ChainType.NEAR) {
    return { url: getNearRpcUrl(network) };
  }
  if (chain === ChainType.CALIMERO) {
    return {
      url: getCalimeroRpcUrl(network, env, shardName),
      headers: {
        ['x-api-key']: apiKey,
      },
    };
  }
  return null;
}
