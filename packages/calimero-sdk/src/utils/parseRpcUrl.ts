const TESTNET_WALLET_URL = 'https://testnet-calimero-mnw.netlify.app/';
const MAINNET_WALLET_URL = 'https://calimero-mnw.netlify.app/';

export function parseRpcUrl(url: string): { shardId: string, walletUrl: string } {
  const regex = /^https:\/\/api\.(.*?)calimero\.network\/api\/v1\/shards\/(?<shardId>\S*)\/neard-rpc\/$/;
  const result = regex.exec(url);
  const shardId = result?.groups?.shardId;
  if (shardId) {
    if (shardId.endsWith('calimero')) {
      return {shardId, walletUrl: MAINNET_WALLET_URL};
    } else if(shardId.endsWith('calimero-testnet')) {
      return {shardId, walletUrl: TESTNET_WALLET_URL};
    }
    throw new Error('Invalid shardId');
  }
  throw new Error('Invalid RPC URL');
}
