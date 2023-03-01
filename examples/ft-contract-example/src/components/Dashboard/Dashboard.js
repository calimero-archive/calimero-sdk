import React, { useEffect, useState } from "react";
import { config } from "../../calimeroSdk";
import { CalimeroSdk, WalletConnection } from "calimero-sdk";
import * as nearAPI from "near-api-js";
import { Contract } from "near-api-js";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { KeyPairEd25519 } from "near-api-js/lib/utils";

let walletConnectionObject = undefined;

const contractName = process.env.REACT_APP_CONTRACT_ID;

const getContract = (account) => {
  return new Contract(
    account, // the account object that is connecting
    contractName,
    {
      // name of contract you're connecting to
      viewMethods: ["ft_total_supply", "ft_balance_of", "storage_balance_of"], // view methods do not change state but usually return a value
      changeMethods: ["storage_deposit", "ft_transfer"], // change methods modify state
    });
  }

export default function Dashboard() {
  const [signedIn, setSingnedIn] = useState();
  console.log(config);
  const getAccountBalance = async () => {
    const account_id = await walletConnectionObject.getAccountId();
    const account = await walletConnectionObject.account();
    const balance = await account.getAccountBalance();
    const contract = getContract(account);
    const accoutnStorageBalance = await contract.storage_balance_of({ account_id });
    const accountFTBalance = await contract.ft_balance_of({ account_id });
    const contractStorageBalance = await contract.storage_balance_of({ account_id: contractName });
    const contractFTBalance = await contract.ft_balance_of({ account_id: contractName });
    console.log(balance);
    console.log(accountFTBalance);
    console.log(contractFTBalance);
    console.log(accoutnStorageBalance);
    console.log(contractStorageBalance);
  };

  const walletSignIn = async () => {
    console.log(walletConnectionObject);
    await walletConnectionObject.requestSignIn({
      contractId: contractName,
      methodNames: ["ft_transfer"]
    });
  };
  useEffect(() => {
    const init = async () => {
      console.log(contractName);
      const calimero = await CalimeroSdk.init(config).connect();
      walletConnectionObject = new WalletConnection(calimero, contractName);
      await walletConnectionObject.isSignedInAsync();
      console.log(walletConnectionObject.isSignedIn());
      setSingnedIn(walletConnectionObject.isSignedIn());
    }
    init()
  }, []);

  const returnFT = async () => {
    const contract = getContract(walletConnectionObject.account());
    const supply = await contract.ft_total_supply();
      console.log("supply", supply);

      await contract.ft_total_supply();

      await contract.ft_transfer({
          receiver_id: contractName,
          amount: "1",
          memo: "mymemo"
        },
        30000000000000,
        "1"
      );
  };

  const depositStorage = async () => {
    const contract = getContract(walletConnectionObject.account());
    await contract.storage_deposit(
    {},
        30000000000000, // attached gas
        nearAPI.utils.format.parseNearAmount('1') // account creation costs 0.00125 NEAR for storage
    );
  }


  const claimFts = async () => {
    const keyStore = new InMemoryKeyStore();
    console.log(keyStore);

    const connection = await nearAPI.connect({
      networkId: config.shardId,
      keyStore: keyStore,
      signer: new nearAPI.InMemorySigner(keyStore),
      nodeUrl: `${config.calimeroUrl}/api/v1/shards/${config.shardId}/neard-rpc`,
      walletUrl: config.walletUrl,
      headers: {
        'x-api-key': config.calimeroToken,
      },
    });
    await keyStore.setKey(config.shardId, contractName, KeyPairEd25519.fromString("ed25519:4cV7eNeNB1JPcnGzFAvTfBDkaXdjn87AkUduNyNt2hXsRu2FE8PBm5CHUWdRTT2SVgSNjntT6UQK1p7iGUdmnDPX"));
    const ownerAccount = await connection.account(contractName);
    
    const contract = getContract(ownerAccount);

    const receiver_id = await walletConnectionObject.getAccountId();

    await contract.ft_transfer({
      receiver_id,
      amount: "20",
      memo: "mymemo"
    },
    30000000000000,
    "1"
    );    
  }

  const logout = async () => {
    await walletConnectionObject.signOut();
    setSingnedIn(false);
  };

  const App = ({ isSignedIn }) => isSignedIn ? <PrivateComponent /> : <PublicComponent />;

  const PrivateComponent = () => (
    <div>
      <button onClick={() => getAccountBalance()}>Get Balance</button>
      <button onClick={() => depositStorage()}>Register FT</button>
      <button onClick={() => returnFT()}>Transfer a token</button>
      <button onClick={() => claimFts()}>Claim 20 tokens</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
  
  const PublicComponent = () => (
    <div>
      <button onClick={() => walletSignIn()}>Login with NEAR</button>
    </div>
  );
  return <App isSignedIn={signedIn} />;
}
