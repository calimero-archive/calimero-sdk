import React, { useEffect, useState } from "react";
import { WalletConnection } from "calimero-sdk";
import calimeroSdk, { config } from "../../calimeroSdk";
import * as nearAPI from "near-api-js";
import big from "bn.js";
import { Buffer } from "buffer";
import walletConnection from "../../walletConnection";
import { AccessKeyView } from 'near-api-js/lib/providers/provider';


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
    const connection = await calimeroSdk.getCalimeroConnection();
    const account = await connection.account(localStorage.getItem("accountId"));
    const balance = await account.getAccountBalance();
    console.log(balance);
  }

  const walletSignIn = async () => {
      const connection = await walletConnection();
      connection.requestSignIn({});
  }
  const walletSignOut = async () => {
    const connection = await walletConnection();
    connection.signOut();
  }
  const addFunctionkey = async () => {
    window.Buffer = window.Buffer || Buffer;
    const connection = await walletConnection();
    await connection.addFunctionKey(
      "tictactoe.calisdk.calimero.testnet",
      ["make_a_move","start_game"],
      nearAPI.utils.format.parseNearAmount("1"),
      localStorage.getItem("calimeroToken")
    )
  }

  const PrivateComponent= () => <div>
    <button onClick={() => getAccountBalance()}>Get Balance</button>
    <button onClick={() => addFunctionkey()}>Add Function Key</button>
    <button onClick={() => console.log("todo - call contract")}>Contract Call</button>
    <button onClick={() => walletSignOut()}>Logout</button>
    
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
