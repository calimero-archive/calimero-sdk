import React, { useEffect, useState } from "react";
import calimeroSdk from "../../calimeroSdk";
import * as nearAPI from "near-api-js";
import { Buffer } from "buffer";
import walletConnection from "../../walletConnection";

export default function Dashboard() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  const getAccountBalance = async () => {
    const calimero = await calimeroSdk.connect();
    const account = await calimero.connection.account(
      localStorage.getItem("accountId")
    );
    const balance = await account.getAccountBalance();
    console.log(balance);
  };

  const walletSignIn = async () => {
    const connection = await walletConnection();
    connection.requestSignIn({});
  };
  const walletSignOut = async () => {
    const connection = await walletConnection();
    connection.signOut();
  };
  const addFunctionkey = async () => {
    window.Buffer = window.Buffer || Buffer;
    const connection = await walletConnection();
    await connection.addFunctionKey(
      "tictactoe.fran.calimero.testnet",
      ["make_a_move", "start_game"],
      nearAPI.utils.format.parseNearAmount("1"),
      localStorage.getItem("calimeroToken")
    );
  };
  const contractCall = async () => {
    window.Buffer = window.Buffer || Buffer;

    const accountId = localStorage.getItem("accountId");
    const publicKey = localStorage.getItem("publicKey");

    const calimero = await calimeroSdk.connect();
    const walletConnection = new nearAPI.WalletConnection(calimero.connection);
    walletConnection._authData = { accountId, allKeys: [publicKey] };

    const account = await walletConnection.account(accountId);

    const contractArgs = {
      player_a: accountId,
      player_b: "zone.testnet",
    };

    const metaJson = {
      calimeroRPCEndpoint: calimero.config.nodeUrl,
      calimeroShardId: calimero.config.networkId,
      calimeroAuthToken: localStorage.getItem("calimeroToken"),
    };
    const meta = JSON.stringify(metaJson);

    try {
      await account.signAndSendTransaction({
        receiverId: "tictactoe.fran.calimero.testnet",
        actions: [
          nearAPI.transactions.functionCall(
            "start_game",
            Buffer.from(JSON.stringify(contractArgs)),
            10000000000000,
            "0"
          ),
        ],
        walletMeta: meta,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const PrivateComponent = () => (
    <div>
      <button onClick={() => getAccountBalance()}>Get Balance</button>
      <button onClick={() => addFunctionkey()}>Add Function Key</button>
      <button onClick={() => contractCall()}>Contract Call</button>
      <button onClick={() => walletSignOut()}>Logout</button>
    </div>
  );

  const PublicComponent = () => (
    <div>
      <button onClick={() => walletSignIn()}>Login with NEAR</button>
    </div>
  );

  useEffect(() => {
    const initialiseWalletConnection = async () => {
      const walletConnectiontemp = await walletConnection();
      setIsSignedIn(walletConnectiontemp.isSignedIn());
    };
    initialiseWalletConnection();
  }, [isSignedIn]);

  return isSignedIn ? <PrivateComponent /> : <PublicComponent />;
}
