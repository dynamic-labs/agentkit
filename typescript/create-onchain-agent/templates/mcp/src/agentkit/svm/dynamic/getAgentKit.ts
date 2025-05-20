import { AgentKit } from "@coinbase/agentkit";
import { DynamicSvmWalletProvider } from "@coinbase/agentkit";
import { ThresholdSignatureScheme } from "@dynamic-labs-wallet/node";

export async function getAgentKit(): Promise<AgentKit> {
  const config = {
    authToken: process.env.DYNAMIC_AUTH_TOKEN as string,
    environmentId: process.env.DYNAMIC_ENVIRONMENT_ID as string,
    baseApiUrl: process.env.DYNAMIC_BASE_API_URL,
    baseMPCRelayApiUrl: process.env.DYNAMIC_BASE_MPC_RELAY_API_URL,
    chainType: "solana" as const,
    networkId: process.env.NETWORK_ID || "mainnet-beta",
    thresholdSignatureScheme: ThresholdSignatureScheme.TWO_OF_TWO,
  };

  const walletProvider = await DynamicSvmWalletProvider.configureWithWallet(config);

  return AgentKit.from({
    walletProvider,
  });
} 