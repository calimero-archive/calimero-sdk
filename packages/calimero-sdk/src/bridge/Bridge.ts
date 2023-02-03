import {ChainType, ConnectorType, Environment, NetworkType} from './Utils';
import {BalanceClient} from './BalanceClient';
import {KeyPair} from 'near-api-js';
import {ConnectorPermissions} from './ConnectorPermissions';
import {FtClient} from './FtClient';
import {NftClient} from './NftClient';
import {LightClient} from './LightClient';

export class Bridge {

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

  async ftBalanceOf(
    chain: ChainType,
    contractId: string,
    accountId: string
  ): Promise<number> {
    return await BalanceClient.ftBalanceOf(
      chain,
      this.network,
      this.env,
      contractId,
      accountId,
      this.shardName,
      this.apiKey
    );
  }

  async getNftOwnerId(
    chain: ChainType,
    contractId: string,
    tokenId: string
  ): Promise<string> {
    return await BalanceClient.getNftOwnerId(
      chain,
      this.network,
      this.env,
      contractId,
      tokenId,
      this.shardName,
      this.apiKey
    );
  }

  async getNftTokensForOwner(
    chain: ChainType,
    contractId: string,
    accountId: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[]> {
    return await BalanceClient.getNftTokensForOwner(
      chain,
      this.network,
      this.env,
      contractId,
      accountId,
      this.shardName,
      this.apiKey
    );
  }

  async getCurrentBlockHeight(chain: ChainType): Promise<bigint> {
    const lightClient = new LightClient(this.shardName, this.env, this.network);
    return await lightClient.getCurrentBlockHeight(chain, this.apiKey);
  }

  async resetPermissions(
    chain: ChainType,
    signerKeyPair: KeyPair,
    connectorType: ConnectorType
  ) : Promise<void> {
    const permissionsContract = await ConnectorPermissions.initForChangeMethods(
      chain,
      this.shardName,
      this.env,
      this.network,
      connectorType,
      signerKeyPair,
      this.apiKey
    );

    await permissionsContract.resetPermissions(connectorType);
  }

  async canBridge(
    chain: ChainType,
    accountId: string,
    connectorType: ConnectorType
  ): Promise<boolean> {
    const permissionsContract = await ConnectorPermissions.initForViewMethods(
      chain,
      this.shardName,
      this.env,
      this.network,
      this.apiKey
    );

    return await permissionsContract.canBridge(accountId, connectorType);
  }

  async getAllowRegexRules(
    chain: ChainType,
    connectorType: ConnectorType
  ): Promise<string[]> {
    const permissionsContract = await ConnectorPermissions.initForViewMethods(
      chain,
      this.shardName,
      this.env,
      this.network,
      this.apiKey
    );

    return await permissionsContract.getAllowRegexRules(connectorType);
  }

  async addAllowRegexRule(
    chain: ChainType,
    signerKeyPair: KeyPair,
    regexRule: string,
    connectorType: ConnectorType,
    attachedDeposit: string
  ): Promise<boolean> {
    const permissionsContract = await ConnectorPermissions.initForChangeMethods(
      chain,
      this.shardName,
      this.env,
      this.network,
      connectorType,
      signerKeyPair,
      this.apiKey
    );

    return await permissionsContract.addAllowRegexRule(regexRule, connectorType, attachedDeposit);
  }

  async removeAllowedRegexRule(
    chain: ChainType,
    signerKeyPair: KeyPair,
    regexRule: string,
    connectorType: ConnectorType
  ): Promise<boolean> {
    const permissionsContract = await ConnectorPermissions.initForChangeMethods(
      chain,
      this.shardName,
      this.env,
      this.network,
      connectorType,
      signerKeyPair,
      this.apiKey
    );

    return await permissionsContract.removeAllowedRegexRule(regexRule, connectorType);
  }

  async denyCrossShardCallPerContract(
    chain: ChainType,
    signerKeyPair: KeyPair,
    accountRegex: string,
    contractRegex: string,
    attachedDeposit: string
  ): Promise<boolean> {
    const permissionsContract = await ConnectorPermissions.initForChangeMethods(
      chain,
      this.shardName,
      this.env,
      this.network,
      ConnectorType.XSC,
      signerKeyPair,
      this.apiKey
    );

    return await permissionsContract.denyCrossShardCallPerContract(accountRegex, contractRegex, attachedDeposit);
  }

  async removeDeniedCrossShardCallPerContract(
    chain: ChainType,
    signerKeyPair: KeyPair,
    accountRegex: string,
    contractRegex: string
  ): Promise<boolean> {
    const permissionsContract = await ConnectorPermissions.initForChangeMethods(
      chain,
      this.shardName,
      this.env,
      this.network,
      ConnectorType.XSC,
      signerKeyPair,
      this.apiKey
    );

    return await permissionsContract.removeDeniedCrossShardCallPerContract(accountRegex, contractRegex);
  }

  async canMakeCrossShardCallForContract(
    chain: ChainType,
    accountId: string,
    contractId: string
  ): Promise<boolean> {
    const permissionsContract = await ConnectorPermissions.initForViewMethods(
      chain,
      this.shardName,
      this.env,
      this.network,
      this.apiKey
    );

    return await permissionsContract.canMakeCrossShardCallForContract(accountId, contractId);
  }

  async getAccountPerContractDeniesForXsc(chain: ChainType): Promise<{accountRule: string, contractRule: string}[]> {
    const permissionsContract = await ConnectorPermissions.initForViewMethods(
      chain,
      this.shardName,
      this.env,
      this.network,
      this.apiKey
    );

    return await permissionsContract.getAccountPerContractDeniesForXsc();
  }

  async ftBridge(
    chain: ChainType,
    accountId: string,
    keyPair: KeyPair,
    contractId: string,
    amount: number
  ): Promise<number> {
    const ftClient = new FtClient(this.shardName, this.env, this.network, this.apiKey);
    return await ftClient.ftBridge(chain, accountId, keyPair, contractId, amount);
  }

  async ftWithdraw(chain: ChainType, accountId: string, keyPair: KeyPair, contractId: string, amount: number) : Promise<void> {
    const ftClient = new FtClient(this.shardName, this.env, this.network, this.apiKey);
    return await ftClient.withdraw(chain, accountId, keyPair, contractId, amount);
  }

  async nftBridge(
    chain: ChainType,
    accountId: string,
    keyPair: KeyPair,
    contractId: string,
    tokenId: string
  ): Promise<boolean> {
    const nftClient = new NftClient(this.shardName, this.env, this.network, this.apiKey);
    return await nftClient.nftBridge(chain, accountId, keyPair, contractId, tokenId);
  }

  async nftWithdraw(chain: ChainType, accountId: string, keyPair: KeyPair, contractId: string, tokenId: string) : Promise<void> {
    const nftClient = new NftClient(this.shardName, this.env, this.network, this.apiKey);
    return await nftClient.withdraw(chain, accountId, keyPair, contractId, tokenId);
  }
}
