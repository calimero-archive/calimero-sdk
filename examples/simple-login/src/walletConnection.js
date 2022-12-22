import { WalletConnection } from "calimero-sdk";
import calimeroSdk from "./calimeroSdk";

export const walletConnection = async () => {
  const calimero = await calimeroSdk.connect();
  return new WalletConnection(calimero);
};

export default walletConnection;
