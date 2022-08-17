///NXTP Config Generator based on vector/modules/router/src/config.ts
import { Type, Static } from "@sinclair/typebox";
import { config as dotenvConfig } from "dotenv";
import { ajv, ChainData, TAddress, TEnvironment, TLogLevel } from "@connext/nxtp-utils";
import { ConnextContractDeployments, ContractPostfix } from "@connext/nxtp-txservice";

import { existsSync, readFileSync } from "./mockable";

dotenvConfig();

export const TChainConfig = Type.Object({
  providers: Type.Array(Type.String()),
  deployments: Type.Object({
    connector: TAddress,
  }),
});

export const ConfigSchema = Type.Object({
  chains: Type.Record(Type.String(), TChainConfig),
  logLevel: TLogLevel,
  environment: TEnvironment,
});

export type Config = Static<typeof ConfigSchema>;

/**
 * Gets and validates the router config from the environment.
 *
 * @returns The router config with sensible defaults
 */
export const getEnvConfig = (chainData: Map<string, ChainData>, deployments: ConnextContractDeployments): Config => {
  let configJson: Record<string, any> = {};
  let configFile: any = {};

  try {
    configJson = JSON.parse(process.env.NXTP_CONFIG || "");
  } catch (e: unknown) {
    console.info("No NXTP_CONFIG exists, using config file and individual env vars");
  }
  try {
    let json: string;

    const path = process.env.NXTP_CONFIG_FILE ?? "config.json";
    if (existsSync(path)) {
      json = readFileSync(path, { encoding: "utf-8" });
      configFile = JSON.parse(json);
    }
  } catch (e: unknown) {
    console.error("Error reading config file!");
    process.exit(1);
  }
  // return configFile;

  const config: Config = {
    chains: process.env.NXTP_CHAIN_CONFIG
      ? JSON.parse(process.env.NXTP_CHAIN_CONFIG)
      : configJson.chains
      ? configJson.chains
      : configFile.chains,
    logLevel: process.env.NXTP_LOG_LEVEL || configJson.logLevel || configFile.logLevel || "info",
  };

  const contractPostfix: ContractPostfix =
    config.environment === "production"
      ? ""
      : (`${config.environment[0].toUpperCase()}${config.environment.slice(1)}` as ContractPostfix);

  // add contract deployments if they exist
  Object.entries(config.chains).forEach(([domainId, chainConfig]) => {
    const chainDataForChain = chainData.get(domainId);
    const chainRecommendedConfirmations = chainDataForChain?.confirmations ?? DEFAULT_CONFIRMATIONS;
    const chainRecommendedGasStations = chainDataForChain?.gasStations ?? [];

    // Make sure deployments is filled out correctly.
    // allow passed in address to override
    // format: { [domainId]: { { "deployments": { "connext": <address>, ... } }
    config.chains[domainId].deployments = {
      connector:
        chainConfig.deployments?.connector ??
        (() => {
          const res =
            domainId === "1337" || domainId === "1338"
              ? { address: "0x8e4C131B37383E431B9cd0635D3cF9f3F628EDae" } // hardcoded for testing
              : chainDataForChain
              ? deployments.connext(chainDataForChain.chainId, contractPostfix)
              : undefined;
          if (!res) {
            throw new Error(`No Connext contract address for domain ${domainId}`);
          }
          return res.address;
        })(),
    };

    config.chains[domainId].confirmations = chainConfig.confirmations ?? chainRecommendedConfirmations;

    config.chains[domainId].gasStations = (config.chains[domainId].gasStations ?? []).concat(
      chainRecommendedGasStations,
    );
  });

  const validate = ajv.compile(NxtpRouterConfigSchema);

  const valid = validate(config);

  if (!valid) {
    throw new Error(validate.errors?.map((err: unknown) => JSON.stringify(err, null, 2)).join(","));
  }

  return config;
};

let config: NxtpRouterConfig | undefined;

/**
 * Caches and returns the environment config
 *
 * @returns The config
 */
export const getConfig = async (
  chainData: Map<string, ChainData>,
  deployments: ConnextContractDeployments,
): Promise<NxtpRouterConfig> => {
  if (!config) {
    config = getEnvConfig(chainData, deployments);
  }
  return config;
};
