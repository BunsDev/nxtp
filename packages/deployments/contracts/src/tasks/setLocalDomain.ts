import { task } from "hardhat/config";

import { NOMAD_DEPLOYMENTS } from "../constants";

export default task("set-local-domain", "Set the local domain of the token registry")
  .addOptionalParam("tokenRegisry", "Override local token registry address")
  .setAction(async ({ tokenRegistry: _tokenRegistry }, { deployments, getNamedAccounts, ethers }) => {
    const namedAccounts = await getNamedAccounts();

    console.log("namedAccounts: ", namedAccounts);

    let tokenRegistry = _tokenRegistry;
    if (!tokenRegistry) {
      const tokenRegistryDeployment = await deployments.get("TokenRegistryUpgradeBeaconProxy");
      tokenRegistry = tokenRegistryDeployment.address;
    }
    console.log("tokenRegistry: ", tokenRegistry);
    const { chainId } = await ethers.provider.getNetwork();

    const config = NOMAD_DEPLOYMENTS.get(chainId);
    if (!config) {
      throw new Error(`No nomad config found for ${chainId}`);
    }

    const registry = await ethers.getContractAt((await deployments.getArtifact("TokenRegistry")).abi, tokenRegistry);
    const setLocalTx = await registry.setLocalDomain(config.domain);
    console.log("set local domain tx:", setLocalTx);
    const receipt = await setLocalTx.wait();
    console.log("set local domain tx mined:", receipt);
  });