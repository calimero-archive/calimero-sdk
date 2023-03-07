import { config } from "./calimeroConfig";
import { CalimeroSdk, WalletConnection } from "calimero-sdk"
import { useState, useEffect } from "react";
import * as nearAPI from "near-api-js";
import { Contract } from "near-api-js";
import { InMemoryKeyStore } from "near-api-js/lib/key_stores";
import { KeyPairEd25519 } from "near-api-js/lib/utils";

let walletConnectionObject = undefined;

const contractName = import.meta.env.VITE_CONTRACT_ID;

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

function App() {
  const [signedIn, setSingnedIn] = useState();

  const getAccountBalance = async () => {
    const account_id = await walletConnectionObject?.getAccountId();
    const account = await walletConnectionObject?.account();
    const balance = await account.getAccountBalance();
    const contract = getContract(account);
    const accountStorageBalance = await contract.storage_balance_of({ account_id });
    const accountFTBalance = await contract.ft_balance_of({ account_id });
    const contractStorageBalance = await contract.storage_balance_of({ account_id: contractName });
    const contractFTBalance = await contract.ft_balance_of({ account_id: contractName });
    console.log(balance);
    console.log(accountFTBalance);
    console.log(contractFTBalance);
    console.log(accountStorageBalance);
    console.log(contractStorageBalance);
  };

  const walletSignIn = async () => {
    await walletConnectionObject.requestSignIn({
      contractId: contractName,
      methodNames: ["ft_transfer"]
    });
  };
  useEffect(() => {
    const init = async () => {
      const calimero = await CalimeroSdk.init(config).connect();
      walletConnectionObject = new WalletConnection(calimero, "calimero-ft-example");
      const signedIn = await walletConnectionObject?.isSignedInAsync();
      setSingnedIn(signedIn);
    }
    init()
  }, []);

  const returnFT = async () => {
    const contract = getContract(walletConnectionObject?.account());
    const supply = await contract.ft_total_supply();
    console.log("supply", supply);
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
    const contract = getContract(walletConnectionObject?.account());
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
      nodeUrl: `config.calimeroUrl`,
      walletUrl: config.walletUrl,
      headers: {
        'x-api-key': config.calimeroToken,
      },
    });
    await keyStore.setKey(
      config.shardId,
      contractName,
      // contract private key required for transfering tokens
      KeyPairEd25519.fromString(""));

    const ownerAccount = await connection.account(contractName);
    
    const contract = getContract(ownerAccount);

    const receiver_id = await walletConnectionObject?.getAccountId();

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
    walletConnectionObject?.signOut();
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

export default App
