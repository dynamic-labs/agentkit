import { AgentKit } from "@coinbase/agentkit";
import { DynamicEvmWalletProvider } from "@coinbase/agentkit";
import { ThresholdSignatureScheme } from "@dynamic-labs-wallet/node";

export async function prepareAgentkit(): Promise<AgentKit> {
  const config = {
    authToken: process.env.DYNAMIC_AUTH_TOKEN as string,
    environmentId: process.env.DYNAMIC_ENVIRONMENT_ID as string,
    baseApiUrl: process.env.DYNAMIC_BASE_API_URL,
    baseMPCRelayApiUrl: process.env.DYNAMIC_BASE_MPC_RELAY_API_URL,
    chainType: "ethereum" as const,
    chainId: process.env.NETWORK_ID,
    thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
  };

  const walletProvider = await DynamicEvmWalletProvider.configureWithWallet(config);

  return AgentKit.from({
    walletProvider,
  });
} 