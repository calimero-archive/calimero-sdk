import React, { useEffect } from "react";

import calimeroSdk, { config } from "../../calimeroSdk";
import * as nearAPI from "near-api-js";
import big from "bn.js";
import { WalletConnection } from "calimero-sdk";
import { Buffer } from "buffer";

const getAccountBalance = async () => {
  const connection = await calimeroSdk.getCalimeroConnection();
  const account = await connection.account(localStorage.getItem("accountId"));
  const balance = await account.getAccountBalance();
  console.log(balance);
}

const walletSignIn = async () => {
  window.Buffer = window.Buffer || Buffer; 
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
  console.log(keyStore);
  const connection = await nearAPI.connect({
    networkId: config.shardId,
    keyStore,
    signer: new nearAPI.InMemorySigner(keyStore),
    nodeUrl: `${config.calimeroUrl}/api/v1/shards/${config.shardId}/neard-rpc`,
    walletUrl: config.walletUrl,
  });
  const walletConnection = new WalletConnection(connection, config);
  console.log(walletConnection);
  walletConnection.requestSignIn({ contractId: "atoken.demosha.calimero.testnet", methodNames: ["ft_transfer"]});
}


const contractCall = async () => {
  // const accountId = localStorage.getItem("accountId");
  // const publicKey = localStorage.getItem("publicKey");
  // const calimeroConnection = await calimeroSdk.getCalimeroConnection();
  // const walletConnection = new nearAPI.WalletConnection(calimeroConnection);
  // walletConnection._authData = 
  // { accountId, allKeys: [publicKey] };
  // let contract = new nearAPI.Contract(walletConnection.account(), "tictactoe.brt2.calimero.testnet", {
  //   viewMethods: [],
  //   changeMethods: ["make_a_move"],
  // });
  // console.log(calimeroConnection.config);
  // const metaJson = {
  //   calimeroRPCEndpoint: calimeroConnection.config.nodeUrl,
  //   calimeroShardId: calimeroConnection.config.networkId,
  //   calimeroAuthToken: localStorage.getItem("calimeroToken"),
  // };
  // const meta = JSON.stringify(metaJson);
  // try {
  //   await contract.make_a_move(
  //     {
  //       meta, // meta information NEAR Wallet will send back to the application. `meta` will be attached to the `callbackUrl` as a url search param
  //       args: {
  //         game_id: 1,
  //         selected_field: 1,        
  //     },
  //     gas:  300000000000000, // attached GAS (optional)
  //     amount: new big.BN("0")
  //   }
  //   );
  // } catch (error) {
  //   console.error(error);
  // }
}

const PrivateComponent= () => <div>
  <button onClick={() => calimeroSdk.signTransaction("EAAAAGRhbGVwYXBpLnRlc3RuZXQAccIgton1dWYvHQfQnz1zBhZNus1OD84pxv%2Ftd4mpD17BM6EQAAAAABAAAABkYWxlcGFwaS50ZXN0bmV019g2Y1DPtOjGuld6oQ9tkKaS1X49bt%2BdSAs%2BTJ8bSiMBAAAAAwAAAKHtzM4bwtMAAAAAAAA%3D","https://localhost:3001")}>Send Transaction</button>
  <button onClick={() => getAccountBalance()}>Get Balance</button>
  <button onClick={() => walletSignIn()}>Change method</button>
  <button onClick={calimeroSdk.signOut}>Logout</button>
</div>;

const PublicComponent = () => <div>
  <button onClick={calimeroSdk.signIn}>Login with NEAR</button>
</div>;

export default function Dashboard() {
  useEffect(()=>{
    calimeroSdk.setCredentials();
  },[])

  return calimeroSdk.isSignedIn() ? <PrivateComponent /> : <PublicComponent />;
};
