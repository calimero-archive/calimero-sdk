import {callViewMethod, ChainType, Environment, NetworkType} from './Utils';
import {getConnectionInfo} from './NetworkConfig';

export class BalanceClient {

  static async ftBalanceOf(
    chain: ChainType,
    network: NetworkType,
    env: Environment,
    contractId: string,
    accountId: string,
    shardName = '',
    apiKey = ''
  ): Promise<number> {

    const connectionInfo = getConnectionInfo(chain, network, env, shardName, apiKey);
    const args = `{ "account_id": "${accountId}" }`;
    const queryResponse = await callViewMethod(connectionInfo, contractId, 'ft_balance_of', args);
    
    return JSON.parse(Buffer.from(queryResponse.result).toString());
  }

  static async getNftOwnerId(
    chain: ChainType,
    network: NetworkType,
    env: Environment,
    contractId: string,
    tokenId: string,
    shardName = '',
    apiKey = ''
  ): Promise<string> {

    const connectionInfo = getConnectionInfo(chain, network, env, shardName, apiKey);
    const args = `{ "token_id": "${tokenId}" }`;
    const queryResponse = await callViewMethod(connectionInfo, contractId, 'nft_token', args);

    return JSON.parse(Buffer.from(queryResponse.result).toString()).owner_id;
  }

  static async getNftTokensForOwner(
    chain: ChainType,
    network: NetworkType,
    env: Environment,
    contractId: string,
    accountId: string,
    shardName = '',
    apiKey = ''
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[]> {

    const connectionInfo = getConnectionInfo(chain, network, env, shardName, apiKey);
    const args = `{ "account_id": "${accountId}" }`;
    const queryResponse = await callViewMethod(connectionInfo, contractId, 'nft_tokens_for_owner', args);

    return JSON.parse(Buffer.from(queryResponse.result).toString());
  }
}
