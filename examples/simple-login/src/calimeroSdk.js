import { CalimeroSdk } from "calimero-sdk";

const config = {
  shardId: process.env.REACT_APP_SHARD_ID,
  walletUrl: process.env.REACT_APP_WALLET_URL,
  calimeroUrl: process.env.REACT_APP_CALIMERO_URL,
  calimeroWebSdkService: process.env.REACT_APP_CALIMERO_WS,
  calimeroToken: process.env.REACT_APP_CALIMERO_TOKEN
};

export default CalimeroSdk.init(config);
