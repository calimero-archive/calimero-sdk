import React, { useEffect, useState } from "react";

import { walletConnection } from "../../walletConnection";

export default function Dashboard() {
  const [signedIn, setSingnedIn] = useState();
  const [connection, setConnection] = useState();

  const getAccountBalance = async () => {
    const account = await connection.account();
    const balance = await account.getAccountBalance();
    console.log(balance);
  };

  const walletSignIn = async () => {
    await connection.requestSignIn({});
  };

  useEffect(()=> {
    const init = async () => {
      const walletConnectionObject = await walletConnection();
      setConnection(walletConnectionObject);
    }
    const checkSignedIn = async () => {
      await connection.isSignedInAsync();
      setSingnedIn(connection.isSignedIn());
    }

    if(!connection){
      init();
    }
    if(connection){
      checkSignedIn();
    }
  }, [connection]);

  const logout = async () => {
    await connection.signOut();
    setSingnedIn(false);
  };

  const App = ({ isSignedIn }) => isSignedIn ? <PrivateComponent /> : <PublicComponent />;

  const PrivateComponent = () => (
    <div>
      <button onClick={() => getAccountBalance()}>Get Balance</button>
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
