require("@nomiclabs/hardhat-waffle");
require("dotenv").config({ path: ".env" });

const TESTNET_CONFIG = require("./scripts/testnet.json");

const PRIVATE_KEY = process.env.EVM_PRIVATE_KEY;
const CHAIN_NAME_SOURCE = process.env.CHAIN_NAME_SOURCE;
const CHAIN_NAME_DESTINATION = process.env.CHAIN_NAME_DESTINATION;

module.exports = {
  solidity: "0.8.17",
  networks: {
    source: {
      url: TESTNET_CONFIG[CHAIN_NAME_SOURCE].rpc,
      accounts: [PRIVATE_KEY],
    },
    destination: {
      url: TESTNET_CONFIG[CHAIN_NAME_DESTINATION].rpc,
      accounts: [PRIVATE_KEY],
    },
  },
};
