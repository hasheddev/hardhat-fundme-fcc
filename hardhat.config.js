require("dotenv").config();
require('hardhat-deploy');
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const SEPOLIAURL = process.env.SEPOLIA_RPC_URL || "";
const PRIVATEKEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: 'hardhat',
  solidity: {
    compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
  },
  networks: {
    //  ropsten: {
    //  url: process.env.ROPSTEN_URL || "",
    //  accounts:
    //    process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    //  },
    //  sepolia: {
    //    url: SEPOLIAURL,
    //    accounts: [PRIVATEKEY],
    //    blockConfirmations: 5,
    //  },
  },
  gasReporter: {
    enabled: true,
    outputFile: 'gas-report.txt',
    currency: "USD",
    noColors: true,
    currency: "USD",
    //coinmarketcap: COINMARKETCAP_API_KEY,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
      //4: 1, rinkeby deployer ia account index[1]
    },
    user: {
      default: 1,
    },
  },
};
