import {CALIMERO_CONTRACT_SUFFIX, LIGHT_CLIENT_CONTRACT_PREFIX} from './Constants';
import {callViewMethod, ChainType, Environment, environmentToContractNameInfix, NetworkType} from './Utils';
import {getConnectionInfo} from './NetworkConfig';

export class LightClient {
  shardName: string;
  env: Environment;
  network: NetworkType;

  constructor(shardName: string, env: Environment, network: NetworkType)
  {
    this.shardName = shardName;
    this.env = env;
    this.network = network;
  }

  async getCurrentBlockHeight(chain: ChainType, apiKey = ''): Promise<bigint> {
    const connectionInfo = getConnectionInfo(chain, this.network, this.env, this.shardName, apiKey);
    const args = '{}';
    const envInfix = environmentToContractNameInfix(chain, this.env);
    const contractId = LIGHT_CLIENT_CONTRACT_PREFIX + this.shardName + envInfix + CALIMERO_CONTRACT_SUFFIX;
    const queryResponse = await callViewMethod(connectionInfo, contractId, 'current_height', args);

    return JSON.parse(Buffer.from(queryResponse.result).toString());
  }
}
