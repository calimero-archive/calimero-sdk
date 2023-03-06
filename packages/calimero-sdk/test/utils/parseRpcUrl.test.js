const { parseRpcUrl } = require('../../src/utils/parseRpcUrl');

describe('Parse Calimero RPC urls', () => {
  it('should extract the shardId from production urls', () => {
    const url = 'https://api.calimero.network/api/v1/shards/demos-calimero-testnet/neard-rpc/';

    const result = parseRpcUrl(url);

    expect(result.shardId).toBe('demos-calimero-testnet');
  });
  it('should extract the shardId from development urls', () => {
    const url = 'https://api.dev.calimero.network/api/v1/shards/demos-calimero-testnet/neard-rpc/';
    
    const result = parseRpcUrl(url);

    expect(result.shardId).toBe('demos-calimero-testnet');
  });
  it('should extract the shardId from staging urls', () => {
    const url = 'https://api.staging.calimero.network/api/v1/shards/demos-calimero-testnet/neard-rpc/';
    
    const result = parseRpcUrl(url);

    expect(result.shardId).toBe('demos-calimero-testnet');
  });
  it('should return testnet wallet url from a testnet calimero rpc url', () => {
    const url = 'https://api.staging.calimero.network/api/v1/shards/demos-calimero-testnet/neard-rpc/';
    
    const result = parseRpcUrl(url);

    expect(result.walletUrl).toBe('https://testnet-calimero-mnw.netlify.app/');
  });
  it('should return mainnet wallet url from a mainnet calimero rpc url', () => {
    const url = 'https://api.staging.calimero.network/api/v1/shards/demos-calimero/neard-rpc/';
    
    const result = parseRpcUrl(url);

    expect(result.walletUrl).toBe('https://calimero-mnw.netlify.app/');
  });
});
