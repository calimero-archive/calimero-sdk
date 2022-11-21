import BN from 'bn.js';
import { sha256 } from 'js-sha256';
import * as nearAPI from 'near-api-js';
import { InMemorySigner, KeyPair } from 'near-api-js';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';
import { AccessKeyView } from 'near-api-js/lib/providers/provider';
const AUTH_TOKEN_KEY = 'calimeroToken';
const MESSAGE_KEY = 'calimeroMessage';
const MESSAGE_HASH_KEY = 'calimeroSecretHash';
const ACCOUNT_ID = 'accountId';
const PUBLIC_KEY = 'publicKey';

const clearLocalStorage = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(MESSAGE_KEY);
  localStorage.removeItem(MESSAGE_HASH_KEY);
  localStorage.removeItem(ACCOUNT_ID);
  localStorage.removeItem(PUBLIC_KEY);
};

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

  isSignedIn(): boolean {
    return localStorage.getItem(AUTH_TOKEN_KEY) !== null;
  }

  signMessage = (): void => {
    const message = uuidv4().toString();
    localStorage.setItem(MESSAGE_HASH_KEY, 
      sha256.update(message ).toString());
    const callbackUrl = encodeURIComponent(
    // eslint-disable-next-line max-len
      `${this._config.calimeroWebSdkService}/accounts/sync/?shard=${this._config.shardId}&next=${window.location.href}&ogm=${message}`
    );
    window.location.href =
      // eslint-disable-next-line max-len
      `${this._config.walletUrl}/verify-owner?message=${localStorage.getItem(MESSAGE_HASH_KEY)}&callbackUrl=${callbackUrl}`;
  };

  signIn = (): void => {
    this.signMessage();
  };

  signTransaction = (transactionString: string, callbackUrl: string): void => {
    if (!this.isSignedIn) {
      console.error('SignIn required before sign a transaction');
    }

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const metaJson = {
      calimeroRPCEndpoint: `${this._config.calimeroUrl}/api/v1/shards/${this._config.shardId}/neard-rpc`,
      calimeroShardId: this._config.shardId,
      calimeroAuthToken: token,
    };
    const meta = encodeURIComponent(JSON.stringify(metaJson));
    callbackUrl = encodeURIComponent(callbackUrl);
    window.location.href =
      // eslint-disable-next-line max-len
      `${this._config.walletUrl}/sign?transactions=${transactionString}&callbackUrl=${callbackUrl}#meta=${meta}`;
  };

  signOut = (): void => {
    clearLocalStorage();
    window.location.href = '/';
  };

  setCredentials = (): void => {
    if (window.location.hash) {
      try {
        const decodedData = JSON.parse(
          decodeURIComponent(window.location.hash.substring(1))
        );
        const walletData = JSON.parse(decodedData.calimeroToken).walletData;
        console.log(walletData);
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
        this.confirmSignIn();
      } catch (error) {
        if (typeof error === 'string') {
          console.error(error.toUpperCase());
        } else if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }
  };
  confirmSignIn = (): void => {
    if (window.location.hash) {
      window.location.replace(window.location.origin+window.location.pathname);
    }
  };
  getCalimeroConnection = async (): Promise<nearAPI.Near> => {
    const xApiKey = localStorage.getItem(AUTH_TOKEN_KEY) || '';
    if(!xApiKey) {
      console.log('LogIn first');
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
      networkId: this._config.shardId,
      keyStore: keyStore,
      signer: new InMemorySigner(keyStore),
      nodeUrl: `${this._config.calimeroUrl}/api/v1/shards/${this._config.shardId}/neard-rpc`,
      walletUrl: this._config.walletUrl,
      headers: {
        ['x-api-key']: xApiKey,
      },
    });
    const calimeroProvider = calimeroConnection.connection.provider;
    const accessKey = await calimeroProvider.query<AccessKeyView>({
      ['request_type']: 'view_access_key',
      finality: 'final',
      ['account_id']: sender || '',
      ['public_key']: publicKey || '',
    });
    const blockHash = nearAPI.utils.serialize.base_decode(accessKey.block_hash);
    const nonce = accessKey.nonce.add(new BN(1));
    const newKeyPair = KeyPair.fromRandom('ed25519');
    const keystore = new nearAPI.keyStores.BrowserLocalStorageKeyStore(
      localStorage,
      'competition:'
    );
    keystore.setKey('brt2-calimero-testnet',
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
    let serializedTx: Uint8Array;
    try {
      serializedTx = nearAPI.utils.serialize.serialize(
        nearAPI.transactions.SCHEMA,
        transaction
      );
      this.signTransaction(
        encodeURIComponent(Buffer.from(serializedTx || '').toString('base64')),
        window.location.href
      );
    } catch (error) {
      console.error(error);
    }
  };
}
