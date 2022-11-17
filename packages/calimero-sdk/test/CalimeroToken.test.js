const { WalletData } = require('../src/token/CalimeroToken');

describe('Calimero token data',
  () => {
    it('should verfiy a valid signature',
      () => {
        const walletData = new WalletData(
          'dalepapi.testnet',
          '123456789',
          '933sFpfhM7oi4kbWgbB6MSbqS6DR6mZDwwKpK3mboejh',
          'ed25519:8f4kw3WHrTDkGh5QSMNtthJfkW7ccdzWhHbzGGWLX34h',
          'NQrTXxJ7b2ZnJC8YiDjVdMn8GLFghGTBe+rIgnlcGbQbLecKbYBZ1NVhtrr2m3T7Z0meZJ1JLh9nRCQsiO9NDg=='
        );
        expect(walletData.isSignatureValid()).toBeTruthy();
      });
  });
