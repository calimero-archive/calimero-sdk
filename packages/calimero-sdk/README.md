# Calimero SDK

A JavaScript library for building decentralized applications, interacting with Calimero private shards, and managing NEAR wallets.

## Calimero Documentation 
- [Learn about](https://docs.calimero.network/) Calimero Network 
- To quickly get started with integrating Calimero Sdk in a project, check our [Calimero examples](https://github.com/calimero-is-near/calimero-examples) repository.
## Getting started

add calimero-sdk dependency to your project.
### NPM 
```
$ npm i calimero-sdk
``` 
### Yarn
```
$ yarn add calimero-sdk
``` 
## Usage 
### CalimeroSdk class

| Method        | Description   | Paremeters  |     Return   |
| ------------- | :------------- | :--------------- | :--------- |
| init ( config )  | Initialize a new  instance of CalimeroSdk.  | shardId : <i>string / undefined</i><br> calimeroUrl : <i>string</i> <br> walletUrl : <i>string / undefined</i> <br> calimeroToken : <i>string</i> | <i>CalimeroSdk : Object</i> |
| connect() |Connect to a Calimero private shard  using NEAR wallet and near-api-js | | <i>Connection : CalimeroConnection <br> config : CalimeroConfig</i>|


### WalletConnection class

| Method        | Description   | Parameters  |     Return   |
| ------------- | :------------- | :------------- | :----------- |
| new WalletConnection ( <br> calimero,<br> appPrefix<br> ) | Creates a new wallet connection instance which extends near-api-js WalletConnection | calimero : <i>CalimeroSdk</i><br>  appPrefix : <i>String</i> | <i>WalletConnection : WalletConnection</i> |
| requestSignIn({ <br>contractId,<br>methodNames,<br>successUrl,<br>failureUrl}) | Connect wallet with a Calimero private shard and sync account. Creates function key if methodNames and contractId provided. | contractId: <i>string / undefined</i><br> methodNames: <i>string[] / undefined</i><br> successUrl: <i>string / undefined</i><br> failureUrl : <i>string / undefined</i> | <i>Promise : void </i> | 
| requestSignTransactions (<br>transactions,<br>meta,<br>callbackUrl<br>) | Sign and approve requested transactions with wallet redirect | transactions : <i>string</i><br> meta : <i>any</i><br> callbackUrl : <i>string</i> | <i> Promise : void </i> | 




## <i>RequestSignIn paremeters in depth</i>
`contractId` : string - Address of account / contract located in the Calimero private shard. 
`methodNames` : string[] - String array of change functions available in smart contract. 
`successUrl` : string - Web page URL that a user is redirected to after successfully completing sign in
`failureUrl` : string - Web page URL that a user is redirected to after failing to complete sign in




## Examples

### Initialise new CalimeroSdk instance 
ReactJS example with environment variables.
```
# index.js

import { CalimeroSdk, WalletConnection } from "calimero-sdk"
import { useEffect } from "react";

const config = {
  shardId: process.env.REACT_APP_CALIMERO_SHARD_ID,
  walletUrl: process.env.REACT_APP_WALLET_ENDPOINT_URL,
  calimeroUrl: process.env.REACT_APP_CALIMERO_ENDPOINT_URL,
  calimeroToken: process.env.REACT_APP_CALIMERO_TOKEN,
}


let calimero = undefined;

useEffect(() => {
    const init = async () => {
      calimero = await CalimeroSdk.init(config).connect();
    }
    init()
}, []);
```

### Initialise new WalletConnection instance
ReactJS example with environment variables.
```
# index.js

import { CalimeroSdk, WalletConnection } from "calimero-sdk"
import { useEffect } from "react";

const config = {
  shardId: process.env.REACT_APP_CALIMERO_SHARD_ID,
  walletUrl: process.env.REACT_APP_WALLET_ENDPOINT_URL,
  calimeroUrl: process.env.REACT_APP_CALIMERO_ENDPOINT_URL,
  calimeroToken: process.env.REACT_APP_CALIMERO_TOKEN,
}


let walletConnectionObject = undefined;

useEffect(() => {
    const init = async () => {
      calimero = await CalimeroSdk.init(config).connect();
      walletConnectionObject = new WalletConnection(calimero, "calimero-simple-login");
    }
    init()
}, []);
```
### Create simple login flow with HTML and JavaScript in ReactJS
```
# index.js

import { config } from "./calimeroConfig";
import { CalimeroSdk, WalletConnection } from "calimero-sdk"
import { useState, useEffect } from "react";

let walletConnectionObject = undefined;

function App() {
  const [signedIn, setSingnedIn] = useState();

  const walletSignIn = async () => {
    await walletConnectionObject?.requestSignIn({});
  };

  const logout = async () => {
    walletConnectionObject?.signOut();
    setSingnedIn(false);
  };

  useEffect(() => {
    const init = async () => {
      const calimero = await CalimeroSdk.init(config).connect();
      walletConnectionObject = new WalletConnection(calimero, "calimero-simple-login");
      const signedIn = await walletConnectionObject?.isSignedInAsync();
      setSingnedIn(signedIn);
    }
    init()
  }, []);
  
  const App = ({ isSignedIn }) => isSignedIn ? <PrivateComponent /> : <PublicComponent />;

  const PrivateComponent = () => (
    <div>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
  
  const PublicComponent = () => (
    <div>
      <button onClick={() => walletSignIn()}>Login with NEAR</button>
    </div>
  );
  return <App isSignedIn={signedIn}/>;

}

export default App
```
## Additional notes

This library is designed to be used in conjunction with Calimero private shards, and requires that you have a NEAR wallet with a valid key pair and access to the Calimero Console. You will also need to have a valid `xApiKey` to interact with the Calimero private shard.

Please refer to the [Calimero documentation](https://docs.calimero.network/) and [Calimero examples](https://github.com/calimero-is-near/calimero-examples) for further information and guidance on using the Calimero SDK.

## Calimero Token 
Calimero tokens are used to grant the user access to selected Calimero private shard RPC endpoints.

## Generating Calimero Token
`Calimero tokens` are generated based on the user's `account ID` and the selected `Calimero private shard ID`. The token data also includes a start and expiry date. The maximum lifetime of a token is 30 days. The token data is sent to the NEAR wallet to be signed as a message, which does not require a blockchain transaction or gas usage. Once the authorization service verifies that the user's account ID has signed the message (containing token data), a `Calimero Authorization Token` is issued, allowing the user access to Calimero private shard RPC endpoints.

## Usage
+ Create a CalimeroTokenData instance with the required data: accountId and shardId. The duration of the token is specified by the from and to fields, which are optional and default to Date.now() and Date.now() + MAX_CALIMERO_TOKEN_DURATION, respectively.
Create `CalimeroTokenData` with the required data: `accountId` and `shardId`. Duration of the token:`from` and `to` fields are optional and default to `Date.now()` and `Date.now() + MAX_CALIMERO_TOKEN_DURATION`, respectively. 
+ Serialize the data using calimeroTokenDataInstance.serialize() and use this as the message parameter to be signed by My NEAR Wallet. Store the data received from My NEAR Wallet in a WalletData instance.
+ Create a CalimeroToken with the WalletData and CalimeroTokenData instances: calimeroToken = new CalimeroToken(walletData, calimeroTokenData).
+ Verify the signed message by calling calimeroToken.verify(). This will check if the token is valid with respect to Date.now() and if the signature matches the public key of the user's account ID.
+ Access to the Calimero private shard RPC endpoint should be granted to tokens that return true from calimeroToken.verify().



| Method                                        | Description                        | Parameters                            |    Return         |
| -------------------------------------         | :----------------------------------| :------------------------------------ | :---------------- |
| CalimeroToken ( walletData, tokenData )  | Creates instance of Calimero Token with required wallet and token data. |  walletData : <i>walletData</i><br> tokenData : <i>CalimeroTokenData</i>                                     |     <i>constructor</i>              |
| CalimeroToken.isDurationValid()               | Check if token has expired.         |                                       | <i>boolean</i>    |
| CalimeroToken.isSignatureValid()              | Verifies the that user's signature is valid.  |                                  | <i>boolean</i>    |
| CalimeroToken.verify()                        | Verify the signed message.             |                                       | <i>boolean</i>    |
| WalletData ( <br>accountId,<br> message,<br> message,<br> blockId,<br> publicKey,<br> signature<br>) | Creates an instance of WalletData  with data obtained from the NEAR wallet. | accountId : <i>string</i><br> message : <i>string</i><br> blockId: <i>string</i><br>publicKey : <i>string</i><br> signature : <i>string</i> | <i> constructor</i>
| WalletData.isSignatureValid()                  | Verifies that the user's signature is valid. | | <i>boolean</i> |
| CalimeroTokenData ( <br>accountId,<br> shardId,<br> from,<br> to <br>) | Creates an instance of Calimero Token Data. | accountId : <i>string</i><br> shardId : <i>string</i><br> from (optional) : <i>Date</i><br> to (optional) : <i>Date</i> <br> | <i>constructor</i> |
| CalimeroTokenData.isDurationValid() | Checks if the expiry time is between 0 and 30 days. | | <i>boolean</i> |

## License

This repository is distributed under the terms of both the MIT license and the Apache License (Version 2.0).
See [LICENSE](LICENSE) and [LICENSE-APACHE](LICENSE-APACHE) for details.