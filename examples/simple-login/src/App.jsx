import { config } from "./calimeroConfig";
import { CalimeroSdk, WalletConnection } from "calimero-sdk"
import { useState, useEffect } from "react";

let walletConnectionObject = undefined;

function App() {
  const [signedIn, setSingnedIn] = useState();

  const getAccountBalance = async () => {
    const account = await walletConnectionObject?.account();
    const balance = await account.getAccountBalance();
    console.log(balance);
  };

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
      console.log(walletConnectionObject);
      const signedIn = await walletConnectionObject?.isSignedInAsync();
      console.log(signedIn);
      setSingnedIn(signedIn);
    }
    init()
  }, []);
  
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

export default App
