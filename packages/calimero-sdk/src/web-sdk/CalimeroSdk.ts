import * as nearAPI from 'near-api-js';

import { InMemorySigner, KeyPair, Near } from 'near-api-js';
import { Buffer } from 'buffer';
import { serialize } from 'borsh';
import { SCHEMA } from 'near-api-js/lib/transaction';


const SHARD_LOGIN_WALLET_URL_SUFFIX = '/login/';
const PENDING_ACCESS_KEY_PREFIX = 'pending_key';
interface CalimeroConfig {
  shardId: string;
  calimeroUrl: string;
  walletUrl: string;
  calimeroWebSdkService: string;
  calimeroToken: string;
}

interface SignInOptions {
  contractId?: string;
  methodNames?: string[];
  // TODO: Replace following with single callbackUrl
  successUrl?: string;
  failureUrl?: string;
}

interface Calimero {
   connection: Near;
   config: CalimeroConfig;
}

export class CalimeroSdk {
  private _config: CalimeroConfig;

  private constructor(config: CalimeroConfig) {
    this._config = config;
  }

  static init(config: CalimeroConfig): CalimeroSdk {
    return new CalimeroSdk(config);
  }

  async connect(): Promise<Calimero> {
    window.Buffer = Buffer;
    const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
    const connection = await nearAPI.connect({
      networkId: this._config.shardId,
      keyStore: keyStore,
      signer: new InMemorySigner(keyStore),
      nodeUrl: `${this._config.calimeroUrl}/api/v1/shards/${this._config.shardId}/neard-rpc`,
      walletUrl: this._config.walletUrl,
      headers: {
        ['x-api-key']: this._config.calimeroToken,
      },
    });
    return {
      connection,
      config: this._config
    };
  }
}

type RequestSignTransactionsOptions = { transactions, meta, callbackUrl };

export class WalletConnection extends nearAPI.WalletConnection {
  _calimeroConfig: CalimeroConfig;
  _connection: Near;
  _appPrefix: string | null;

  constructor(calimero: Calimero, appPrefix: string | null) {
    super(calimero.connection, appPrefix);
    this._connection = calimero.connection;
    this._calimeroConfig = calimero.config;
    this._appPrefix = appPrefix;
  }

  async requestSignIn({ contractId, methodNames, successUrl, failureUrl }: SignInOptions): Promise<void> {
    if(!this._calimeroConfig.calimeroToken || !this._calimeroConfig.shardId){
      throw new Error('Calimero token or shard id is not set!');
    }
    const currentUrl = new URL(window.location.href);
    const newUrl = new URL(this._calimeroConfig.walletUrl + SHARD_LOGIN_WALLET_URL_SUFFIX);
    newUrl.searchParams.set('success_url', successUrl || currentUrl.href);
    newUrl.searchParams.set('failure_url', failureUrl || currentUrl.href);
    const hashParams = new URLSearchParams();
    hashParams.set('calimeroRPCEndpoint', `${this._calimeroConfig.calimeroUrl}/api/v1/shards/${this._calimeroConfig.shardId}/neard-rpc`);
    hashParams.set('calimeroAuthToken', this._calimeroConfig.calimeroToken);
    hashParams.set('calimeroShardId', this._calimeroConfig.shardId);
    newUrl.hash = hashParams.toString();
    if (contractId) {
      /* Throws exception if contract account does not exist */
      console.log(super._near);
      const contractAccount = await this._connection.account(contractId);
      await contractAccount.state();

      newUrl.searchParams.set('contract_id', contractId);
      const accessKey = KeyPair.fromRandom('ed25519');
      newUrl.searchParams.set('public_key', accessKey.getPublicKey().toString());
      await this._connection.config.keyStore.setKey(this._calimeroConfig.shardId, PENDING_ACCESS_KEY_PREFIX + accessKey.getPublicKey(), accessKey);
    }

    if (methodNames) {
      methodNames.forEach(methodName => {
        newUrl.searchParams.append('methodNames', methodName);
      });
    }

    window.location.assign(newUrl.toString());
  }

  async requestSignTransactions({ transactions, meta, callbackUrl }: RequestSignTransactionsOptions): Promise<void> {
    const txnParams = new URLSearchParams();
    const currentUrl = new URL(window.location.href);
    const newUrl = new URL('sign', this._walletBaseUrl);

    txnParams.set('transactions', transactions
      .map(transaction => serialize(SCHEMA, transaction))
      .map(serialized => Buffer.from(serialized).toString('base64'))
      .join(','));
    newUrl.searchParams.set('callbackUrl', callbackUrl || currentUrl.href);
    if (meta) newUrl.searchParams.set('meta', meta);
    txnParams.set('calimeroRPCEndpoint', `${this._calimeroConfig.calimeroUrl}/api/v1/shards/${this._calimeroConfig.shardId}/neard-rpc`);
    txnParams.set('calimeroShardId', this._calimeroConfig.shardId);
    txnParams.set('calimeroAuthToken', this._calimeroConfig.calimeroToken);
    newUrl.hash = txnParams.toString();
    window.location.assign(newUrl.toString());
  }
}