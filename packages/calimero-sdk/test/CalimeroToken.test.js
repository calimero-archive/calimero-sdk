const nearAPI = require('near-api-js');
const {WalletData} = require('../src/token/CalimeroToken');

describe('Calimero token data',
  () => {
    it('should verfiy a valid signature',
      () => {
        const keys = nearAPI.utils.key_pair.KeyPairEd25519.fromRandom();
        const accountId = 'dalepapi.testnet';
        const blockId = '933sFpfhM7oi4kbWgbB6MSbqS6DR6mZDwwKpK3mboejh';
        const publicKey = keys.publicKey;
        const message = '123456789';
        const data = JSON.stringify({
          accountId,
          message,
          blockId,
          publicKey: Buffer.from(publicKey.data).toString('base64'),
          keyType: publicKey.keyType,
        });
        const signature = keys.sign(Buffer.from(data));
        const walletData = new WalletData(
          accountId,
          message,
          blockId,
          publicKey.toString(),
          Buffer.from(signature.signature).toString('base64'),
        );
        expect(walletData.isSignatureValid()).toBeTruthy();
      });
  });
