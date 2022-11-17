require("dotenv").config({ path: ".env" });

const { ethers } = require("hardhat");
const TESTNET_CONFIG = require("./testnet.json");
const CHAIN_NAME_SOURCE = process.env.CHAIN_NAME_SOURCE;
const CHAIN_NAME_DESTINATION = process.env.CHAIN_NAME_DESTINATION;

async function deployOnSourceChain() {
  const sourceFactory = await ethers.getContractFactory("DeployOnSourceChain");

  const sourceContract = await sourceFactory.deploy(
    TESTNET_CONFIG[CHAIN_NAME_SOURCE].gateway,
    TESTNET_CONFIG[CHAIN_NAME_SOURCE].gasReceiver
  );

  console.log(
    `DeployOnSourceChain contract deployed to ${TESTNET_CONFIG[CHAIN_NAME_SOURCE].name} testnet at ${sourceContract.address}.`
  );
}

async function deployOnDestinationChain() {
  const destinationFactory = await ethers.getContractFactory(
    "DeployOnDestinationChain"
  );

  const destinationContract = await destinationFactory.deploy(
    TESTNET_CONFIG[CHAIN_NAME_DESTINATION].gateway,
    TESTNET_CONFIG[CHAIN_NAME_DESTINATION].gasReceiver
  );

  console.log(
    `DeployOnDestinationChain contract deployed to ${TESTNET_CONFIG[CHAIN_NAME_DESTINATION].name} testnet at ${destinationContract.address}.`
  );
}

async function main() {
  // Uncomment one depends on where do you want to deploy, source chain or destination chain
  // await deployOnSourceChain();
  // await deployOnDestinationChain();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
