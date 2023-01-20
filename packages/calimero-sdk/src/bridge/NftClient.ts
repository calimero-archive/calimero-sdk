import {Contract, KeyPair} from 'near-api-js';
import {CALIMERO_CONTRACT_SUFFIX, NFT_CONNECTOR_CONTRACT_PREFIX} from './Constants';
import {ChainType, Environment, environmentToContractNameInfix, fetchAccount, NetworkType} from './Utils';

export class NftClient {

  shardName: string;
  env: Environment;
  network: NetworkType;
  apiKey: string;

  constructor(shardName: string, env: Environment, network: NetworkType, apiKey = '')
  {
    this.shardName = shardName;
    this.env = env;
    this.network = network;
    this.apiKey = apiKey;
  }

  async nftBridge(
    chain: ChainType,
    accountId: string,
    keyPair: KeyPair,
    contractId: string,
    tokenId: string
  ): Promise<boolean> {

    const account = await fetchAccount(chain, this.network, this.env, accountId, keyPair, this.shardName);
    const contract = new Contract(
      account,
      contractId,
      {
        viewMethods: [],
        changeMethods: ['nft_transfer_call'],
      }
    );

    const envInfix = environmentToContractNameInfix(chain, this.env);

    const MAX_GAS = 300000000000000;
    const YOCTO_NEAR_AMOUNT = 1;
    try {
      const result = await contract['nft_transfer_call'](
        {
          ['receiver_id']: NFT_CONNECTOR_CONTRACT_PREFIX + this.shardName + envInfix + CALIMERO_CONTRACT_SUFFIX,
          ['token_id']: tokenId,
          msg: this.shardName + CALIMERO_CONTRACT_SUFFIX,
        },
        MAX_GAS,
        YOCTO_NEAR_AMOUNT,
      );

      return result;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async withdraw(chain: ChainType, accountId: string, keyPair: KeyPair, contractId: string, tokenId: string): Promise<void> {
    const account = await fetchAccount(chain, this.network, this.env, accountId, keyPair, this.shardName, this.apiKey);

    const contract = new Contract(
      account,
      contractId,
      {
        viewMethods: [],
        changeMethods: ['withdraw'],
      }
    );
    const MAX_GAS = 300000000000000;
    const YOCTO_NEAR_AMOUNT = 1;

    try {
      await contract['withdraw'](
        {
          ['token_id']: tokenId,
        },
        MAX_GAS,
        YOCTO_NEAR_AMOUNT,
      );
    } catch (error) {
      console.log(error);
    }
  }
}
