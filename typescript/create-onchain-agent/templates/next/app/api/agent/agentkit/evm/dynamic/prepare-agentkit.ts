import {
  type ActionProvider,
  AgentKit,
  cdpApiActionProvider,
  erc20ActionProvider,
  pythActionProvider,
  walletActionProvider,
  wethActionProvider,
  type WalletProvider,
  DynamicEvmWalletProvider
} from "@coinbase/agentkit";
import fs from "node:fs";

const WALLET_DATA_FILE = "wallet_data.txt";

export async function prepareAgentkitAndWalletProvider(): Promise<{
  agentkit: AgentKit;
  walletProvider: WalletProvider;
}> {
  try {
    const config = {
      authToken: process.env.DYNAMIC_AUTH_TOKEN as string,
      environmentId: process.env.DYNAMIC_ENVIRONMENT_ID as string,
      baseApiUrl: process.env.DYNAMIC_BASE_API_URL,
      baseMPCRelayApiUrl: process.env.DYNAMIC_BASE_MPC_RELAY_API_URL,
      chainType: "ethereum" as const,
      chainId: process.env.NETWORK_ID,
    };
    // Try to load saved wallet data (if Dynamic supports export/import)
    if (fs.existsSync(WALLET_DATA_FILE)) {
      const savedWallet = JSON.parse(fs.readFileSync(WALLET_DATA_FILE, "utf8"));
      if (savedWallet.chainId) config.chainId = savedWallet.chainId;
    }
    if (!config.chainId) {
      console.log("Warning: NETWORK_ID not set, defaulting to 8453 (base-mainnet)");
      config.chainId = "8453";
    }
    const walletProvider = await DynamicEvmWalletProvider.configureWithWallet(config);

    const actionProviders: ActionProvider[] = [
      wethActionProvider(),
      pythActionProvider(),
      walletActionProvider(),
      erc20ActionProvider(),
    ];
    const canUseCdpApi = process.env.CDP_API_KEY_NAME && process.env.CDP_API_KEY_PRIVATE_KEY;
    if (canUseCdpApi) {
      actionProviders.push(
        cdpApiActionProvider({
          apiKeyName: process.env.CDP_API_KEY_NAME,
          apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
        })
      );
    }
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders,
    });
    // Save wallet data (if Dynamic supports exportWallet)
    if (walletProvider.exportWallet) {
      const exportedWallet = walletProvider.exportWallet();
      fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(exportedWallet));
    }
    return { agentkit, walletProvider };
  } catch (error) {
    console.error("Error initializing agent:", error);
    throw new Error("Failed to initialize agent");
  }
} 