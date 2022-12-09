import BN from 'bn.js';
import { sha256 } from 'js-sha256';
import * as nearAPI from 'near-api-js';
import { InMemorySigner, KeyPair, Near } from 'near-api-js';
import { v4 as uuidv4 } from 'uuid';
import { AccessKeyView } from 'near-api-js/lib/providers/provider';

const AUTH_TOKEN_KEY = 'calimeroToken';
const MESSAGE_KEY = 'calimeroMessage';
const MESSAGE_HASH_KEY = 'calimeroSecretHash';
const ACCOUNT_ID = 'accountId';
const PUBLIC_KEY = 'publicKey';
const ALL_KEYS = 'all_keys';
const WALLET_DATA = 'calimero_wallet_auth_key';

interface CalimeroConfig {
  shardId: string;
  calimeroUrl: string;
  walletUrl: string;
  calimeroWebSdkService: string;
}

export class CalimeroSdk {
  private _config: CalimeroConfig;

  private constructor(config: CalimeroConfig) {
    this._config = config;
  }

  static init(config: CalimeroConfig): CalimeroSdk {
    return new CalimeroSdk(config);
  }

  getCalimeroConnection = async (): Promise<nearAPI.Near> => {
    const xApiKey = localStorage.getItem(AUTH_TOKEN_KEY) || '';
    if(!xApiKey) {
      console.log('Log in first');
    }
    const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
    return await nearAPI.connect({
      networkId: this._config.shardId,
      keyStore: keyStore,
      signer: new InMemorySigner(keyStore),
      nodeUrl: `${this._config.calimeroUrl}/api/v1/shards/${this._config.shardId}/neard-rpc`,
      walletUrl: this._config.walletUrl,
      headers: {
        ['x-api-key']: xApiKey,
      },
    });
  };
}

const clearLocalStorage = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(MESSAGE_KEY);
  localStorage.removeItem(MESSAGE_HASH_KEY);
  localStorage.removeItem(ACCOUNT_ID);
  localStorage.removeItem(PUBLIC_KEY);
  localStorage.removeItem(WALLET_DATA);
};

const setCredentials = (): void => {
  if (window.location.hash) {
    try {
      const decodedData = JSON.parse(
        decodeURIComponent(window.location.hash.substring(1))
      );
      const walletData = JSON.parse(decodedData.calimeroToken).walletData;
      const message = walletData.message;
      const accountId = walletData.accountId;
      const publicKey = walletData.publicKey;
      const authToken = decodedData.secretToken;
      const sentHash = localStorage.getItem(MESSAGE_HASH_KEY);
      if (message !== sentHash) {
        throw new Error(
          'Sent Message hash is not equal to receiver, please try again!'
        );
      }
      localStorage.setItem(AUTH_TOKEN_KEY,
        authToken);
      localStorage.setItem(MESSAGE_KEY,
        message);
      localStorage.setItem(ACCOUNT_ID,
        accountId);
      localStorage.setItem(PUBLIC_KEY,
        publicKey);
    } catch (error) {
      if (typeof error === 'string') {
        console.error(error.toUpperCase());
      } else if (error instanceof Error) {
        console.error(error.message);
      }
    }
  }
};

interface SignInOptions {
  successUrl?: string;
}

interface RequestSignTransactionsOptions {
  transactions: nearAPI.transactions.Transaction[];
  callbackUrl?: string;
}

export class WalletConnection extends nearAPI.WalletConnection {
  _calimeroConfig: CalimeroConfig;
  connection: nearAPI.WalletConnection;

  constructor(near: Near, config: CalimeroConfig, appPrefix: string | null) {
    super(near, appPrefix);
    this._calimeroConfig = config;
  }

  static init(near: Near, config: CalimeroConfig, appPrefix = 'calimero'): WalletConnection {
    return new WalletConnection(near, config, appPrefix);
  }

  generateMessage(): { ogm: string, message: string } {
    const ogm = uuidv4().toString();
    const message = sha256.update(ogm).toString();
    localStorage.setItem(MESSAGE_HASH_KEY,
      message);
    return {ogm, message};
  }
  signOut = (callbackUrl = '/'): void => {
    clearLocalStorage();
    window.location.href = callbackUrl;
  };

  async requestSignIn({ successUrl }: SignInOptions): Promise<void> {
    const currentUrl = new URL(window.location.href);
    const calimeroLoginUrl = new URL(this._calimeroConfig.calimeroWebSdkService + '/accounts/sync/');

    calimeroLoginUrl.searchParams.set('shard', this._calimeroConfig.shardId);
    calimeroLoginUrl.searchParams.set('next', successUrl || currentUrl.href);
   
    const { ogm, message } = this.generateMessage();
    const walletVerificationUrl = new URL(`${this._calimeroConfig.walletUrl}/verify-owner/`);

    calimeroLoginUrl.searchParams.set('ogm', ogm);
    walletVerificationUrl.searchParams.set('callbackUrl', calimeroLoginUrl.toString());
    walletVerificationUrl.searchParams.set('message', message);

    window.location.assign(walletVerificationUrl.toString());
  }

  async _completeSignInWithAccessKey(): Promise<void> {
    setCredentials();

    const currentUrl = new URL(window.location.href);
    const publicKey = localStorage.getItem(PUBLIC_KEY) || '';
    const allKeys = (localStorage.getItem(ALL_KEYS) || '').split(',');
    const accountId = localStorage.getItem(ACCOUNT_ID);

    if(!!accountId && !!publicKey){
      allKeys.push(publicKey);
      this._authData = {
        accountId,
        allKeys
      };

      localStorage.setItem(this._authDataKey, JSON.stringify(this._authData));
      window.location.assign(currentUrl.origin+currentUrl.pathname);
    }
  }

  async requestSignTransactions({ transactions, callbackUrl }: RequestSignTransactionsOptions): Promise<void> {

    const metaJson = {
      calimeroRPCEndpoint: `${this._calimeroConfig.calimeroUrl}/api/v1/shards/${this._calimeroConfig.shardId}/neard-rpc`,
      calimeroShardId: this._calimeroConfig.shardId,
      calimeroAuthToken: localStorage.getItem(AUTH_TOKEN_KEY),
    };
    const encodedMeta = encodeURIComponent(JSON.stringify(metaJson));
  
    const currentUrl = new URL(window.location.href);
    const newUrl = new URL('sign', this._walletBaseUrl);

    newUrl.searchParams.set('transactions', transactions
      .map(transaction => nearAPI.utils.serialize.serialize(nearAPI.transactions.SCHEMA, transaction))
      .map(serialized => Buffer.from(serialized).toString('base64'))
      .join(','));
    newUrl.searchParams.set('callbackUrl', callbackUrl || currentUrl.href);
    if (encodedMeta){
      newUrl.hash = 'meta='+encodedMeta;
    }
    window.location.assign(newUrl.toString());
  }

  addFunctionKey = async(contractAddress: string, methodNames: string[], allowance: BN, xApiKey: string): Promise<void> => {
    let sender;
    let publicKey;
    try{
      sender = localStorage.getItem(ACCOUNT_ID);
      publicKey = localStorage.getItem(PUBLIC_KEY);
    }catch(error){
      console.error(error);
    }
    const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();

    const calimeroConnection = await nearAPI.connect({
      networkId: this._calimeroConfig.shardId,
      keyStore: keyStore,
      signer: new InMemorySigner(keyStore),
      nodeUrl: `${this._calimeroConfig.calimeroUrl}/api/v1/shards/${this._calimeroConfig.shardId}/neard-rpc`,
      walletUrl: this._calimeroConfig.walletUrl,
      headers: {
        ['x-api-key']: xApiKey,
      },
    });
    const calimeroProvider = calimeroConnection.connection.provider;
    let accessKey;
    try{
      accessKey = await calimeroProvider.query<AccessKeyView>({
        ['request_type']: 'view_access_key',
        ['finality']: 'final',
        ['account_id']: sender || '',
        ['public_key']: publicKey || '',
      });
    }catch(error){
      console.error(error);
      console.log('Error while accessing public key!');
      return;
    }
    
    const blockHash = nearAPI.utils.serialize.base_decode(accessKey.block_hash);
    const nonce = accessKey.nonce+1;
    const newKeyPair = KeyPair.fromRandom('ed25519');
    const keystore = new nearAPI.keyStores.BrowserLocalStorageKeyStore(
      localStorage,
      'functionKey:'
    );
    keystore.setKey('calisdk-calimero-testnet',
      sender || '',
      newKeyPair);
    const actions = [
      nearAPI.transactions.addKey(
        newKeyPair.getPublicKey(),
        nearAPI.transactions.functionCallAccessKey(
          contractAddress,
          methodNames,
          allowance
        )
      ),
    ];
    const transaction = nearAPI.transactions.createTransaction(
      sender || '',
      newKeyPair.getPublicKey(),
      sender || '',
      nonce,
      actions,
      blockHash
    );
    const batchTransactionArray : nearAPI.transactions.Transaction[] = [];
    batchTransactionArray.push(transaction);
    
    await this.requestSignTransactions({
      transactions: batchTransactionArray,
      callbackUrl: window.location.href
    });
  };

}
