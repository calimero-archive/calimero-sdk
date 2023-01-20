/* eslint-disable @typescript-eslint/naming-convention */
import * as nearAPI from 'near-api-js';
import {Account, KeyPair} from 'near-api-js';
import {getConnectionConfig, getNetworkId} from './NetworkConfig';

const { keyStores } = nearAPI;
const { connect } = nearAPI;
const {providers} = nearAPI;

export enum ChainType {
  NEAR,
  CALIMERO,
}

export enum Environment {
    DEVELOPMENT,
    STAGING,
    PRODUCTION,
}

export enum ConnectorType {
  FT,
  NFT,
  XSC,
}

export function connectorTypeToString(connectorType: ConnectorType): string {
  if (connectorType === ConnectorType.FT) return 'FT';
  if (connectorType === ConnectorType.NFT) return 'NFT';
  if (connectorType === ConnectorType.XSC) return 'XSC';
  return '';
}

export function environmentToContractNameInfix(chain: ChainType, env: Environment): string {
  if (chain === ChainType.NEAR) {
    if (env === Environment.DEVELOPMENT) return '.dev';
    if (env === Environment.STAGING) return '.stage';
  }
  return '';
}

export enum NetworkType {
    TESTNET,
    MAINNET,
}

export async function fetchAccount(
  chain: ChainType,
  network: NetworkType,
  env: Environment,
  accountId: string,
  keyPair: KeyPair,
  shardName = '',
  apiKey = ''
): Promise<Account> {

  const networkId = getNetworkId(chain, network, shardName);
  const myKeyStore = new keyStores.InMemoryKeyStore();
  await myKeyStore.setKey(networkId, accountId, keyPair);

  const connectionConfig = {
    ...getConnectionConfig(chain, network, env, shardName, apiKey),
    keyStore: myKeyStore,
  };
  const nearConnection = await connect(connectionConfig);
  return await nearConnection.account(accountId);
}

export async function callViewMethod(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  connectionInfo: any,
  contractId: string,
  methodName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: string): Promise<any> {

  const provider = new providers.JsonRpcProvider(connectionInfo);
  const encodedArgs = Buffer.from(args).toString('base64');

  return await provider.query({
    ['request_type']: 'call_function',
    ['account_id']: contractId,
    ['method_name']: methodName,
    ['args_base64']: encodedArgs,
    ['finality']: 'final',
  });
}
