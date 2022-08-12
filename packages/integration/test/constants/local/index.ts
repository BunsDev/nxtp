import { Wallet } from "ethers";

// Used in polling loops.
export const SUBG_POLL_PARITY = 5_000;

export const DEPLOYER_WALLET = Wallet.fromMnemonic(
  "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
);
export const USER_WALLET = Wallet.fromMnemonic(
  "define various win open delay annual edge wait embark fire brain novel",
);

export const PARAMETERS = {
  ENVIRONMENT: "production",
  AGENTS: {
    ROUTER: {
      address: "0x627306090abaB3A6e1400e9345bC60c78a8BEf57",
    },
    RELAYER: { address: "0x627306090abaB3A6e1400e9345bC60c78a8BEf57" },
    CARTOGRAPHER: {
      url: "http://localhost:3000",
    },
    USER: {
      address: USER_WALLET.address,
      signer: USER_WALLET,
    },
    DEPLOYER: {
      address: DEPLOYER_WALLET.address,
      signer: DEPLOYER_WALLET,
    },
  },
  ASSET: {
    address: "0x913bbCFea2f347a24cfCA441d483E7CBAc8De3Db",
    name: "TEST",
    symbol: "TEST",
  },
  A: {
    DOMAIN: "1337",
    CHAIN: 1337,
    RPC: ["http://localhost:8547"],
    DEPLOYMENTS: {
      ConnextHandler: "0x8e4C131B37383E431B9cd0635D3cF9f3F628EDae",
      PromiseRouterUpgradeBeaconProxy: "0xB529f14AA8096f943177c09Ca294Ad66d2E08b1f",
      RelayerFeeRouterUpgradeBeaconProxy: "0xbaAA2a3237035A2c7fA2A33c76B44a8C6Fe18e87",
      BridgeRouterUpgradeBeaconProxy: "0xeec918d74c746167564401103096D45BbD494B74",
      TokenRegistry: "0x75c35C980C0d37ef46DF04d31A140b65503c0eEd",
      XAppConnectionManager: "0xFB88dE099e13c3ED21F80a7a1E49f8CAEcF10df6",
    },
  },
  B: {
    DOMAIN: "1338",
    CHAIN: 1338,
    RPC: ["http://localhost:8546"],
    DEPLOYMENTS: {
      ConnextHandler: "0x8e4C131B37383E431B9cd0635D3cF9f3F628EDae",
      PromiseRouterUpgradeBeaconProxy: "0xB529f14AA8096f943177c09Ca294Ad66d2E08b1f",
      RelayerFeeRouterUpgradeBeaconProxy: "0xbaAA2a3237035A2c7fA2A33c76B44a8C6Fe18e87",
      BridgeRouterUpgradeBeaconProxy: "0xeec918d74c746167564401103096D45BbD494B74",
      TokenRegistry: "0x75c35C980C0d37ef46DF04d31A140b65503c0eEd",
      XAppConnectionManager: "0xFB88dE099e13c3ED21F80a7a1E49f8CAEcF10df6",
    },
  },
};
