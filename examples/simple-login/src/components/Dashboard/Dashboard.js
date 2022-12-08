import React, { useEffect, useState } from "react";
import { WalletConnection } from "calimero-sdk";
import calimeroSdk, { config } from "../../calimeroSdk";
import * as nearAPI from "near-api-js";
import big from "bn.js";
// import { walletConnection } from "../../walletConnection";
// import { Buffer } from "buffer";
import walletConnection from "../../walletConnection";


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

export default function Dashboard() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const getAccountBalance = async () => {
    const walletCon = await walletConnection();
    const connection = await walletCon.requestCalimeroConnection();
    const account = await connection.account(localStorage.getItem("accountId"));
    const balance = await account.getAccountBalance();
    console.log(balance);
  }

  const walletSignIn = async () => {
      const connection = await walletConnection();
      connection.requestSignIn({});
  }

  const PrivateComponent= () => <div>
    <button onClick={() => calimeroSdk.signTransaction("EAAAAGRhbGVwYXBpLnRlc3RuZXQAccIgton1dWYvHQfQnz1zBhZNus1OD84pxv%2Ftd4mpD17BM6EQAAAAABAAAABkYWxlcGFwaS50ZXN0bmV019g2Y1DPtOjGuld6oQ9tkKaS1X49bt%2BdSAs%2BTJ8bSiMBAAAAAwAAAKHtzM4bwtMAAAAAAAA%3D","https://localhost:3001")}>Send Transaction</button>
    <button onClick={() => getAccountBalance()}>Get Balance</button>
    <button onClick={calimeroSdk.signOut}>Logout</button>
  </div>;

  const PublicComponent = () => <div>
    <button onClick={() => walletSignIn()}>Login with NEAR</button>
  </div>;

  useEffect(()=>{
    const initialiseWalletConnection = async ()=> {
      const walletConnectiontemp = await walletConnection();
      setIsSignedIn(walletConnectiontemp.isSignedIn());
    }
    initialiseWalletConnection();
  },[isSignedIn]);

  return isSignedIn ? <PrivateComponent /> : <PublicComponent />;
};
