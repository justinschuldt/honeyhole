import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "HoneyPause" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployHoneyPause: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("HoneyPause", {
    from: deployer,
    // Contract constructor arguments
    args: [],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const honeyPause = await hre.ethers.getContract<Contract>("HoneyPause", deployer);

  const honeyToken = await hre.ethers.getContract<Contract>("HoneyToken", deployer);
  const honeyVerifier = await hre.ethers.getContract<Contract>("HoneyVerifier", deployer);
  const honeyProtocol = await hre.ethers.getContract<Contract>("HoneyProtocol", deployer);

  await honeyToken.mint(honeyVerifier, 1000000000);

  console.log("honeyPause:", await honeyPause.getAddress());
  const name = "Protocol honeypause";
  const payoutToken = await honeyToken.getAddress();
  const payoutAmount = 10000;
  const verifier = await honeyVerifier.getAddress();
  const pauser = await honeyProtocol.getAddress();
  const payer = await honeyVerifier.getAddress();
  const operator = deployer;
  await honeyPause.add(name, payoutToken, payoutAmount, verifier, pauser, payer, operator);
};

export default deployHoneyPause;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags HoneyPause
deployHoneyPause.tags = ["HoneyPause"];
