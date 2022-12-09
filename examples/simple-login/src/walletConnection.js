import { WalletConnection } from "calimero-sdk";
import { config } from "./calimeroSdk";
import * as nearAPI from "near-api-js";

export const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
export const signer = new nearAPI.InMemorySigner(keyStore);
export const getConnection = async () => {
    const xApiKey = localStorage.getItem("calimeroToken");
    const connection = await nearAPI.connect({
        networkId: config.shardId,
        keyStore,
        signer: signer,
        nodeUrl: `${config.calimeroUrl}/api/v1/shards/${config.shardId}/neard-rpc`,
        walletUrl: config.walletUrl,  
        headers: {
        "x-api-key": xApiKey || '',
      },
    });
    return WalletConnection.init(connection,config);
};

export default getConnection;
