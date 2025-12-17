import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable } = createNetworkConfig({
  testnet: {
    url: getFullnodeUrl("testnet"),
    variables: {
      // NEW Package ID (from your latest publish output)
      packageId: "0x3d8ffd269790ea6761a6efbdd401251310ec9a33c890085797f417490c8cf165",
      
      // NEW Marketplace Shared Object ID (Created Objects -> ...::Marketplace)
      marketplaceId: "0x285c72d48fd92d9642ea2314c72dea23d36e38eade8d64f6da9f01e229d47b2b",
    },
  },
});

export { useNetworkVariable, networkConfig };