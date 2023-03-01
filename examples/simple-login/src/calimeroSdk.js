export const config = {
  shardId: process.env.REACT_APP_SHARD_ID,
  walletUrl:process.env.REACT_APP_WALLET_URL || "https://testnet.mynearwallet.com/",
  calimeroUrl: process.env.REACT_APP_CALIMERO_URL || "https://api.dev.calimero.network",
  calimeroWebSdkService: process.env.REACT_APP_CALIMERO_WS || "https://app.calimero.network",
  calimeroToken: process.env.REACT_APP_CALIMERO_TOKEN
};
