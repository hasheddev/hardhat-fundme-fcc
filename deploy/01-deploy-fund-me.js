//hre hardhat runtime environment contains many methods

const { network } = require("hardhat");

const { networkConfig, developmentChains } = require('../helper-harhat-config');
const { verify } = require('../utils/verify');
// ethUsdPriceFeedAdress = networkConfig[chainId]['ethUsdPriceFeed'];

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  //We want to use a mock for simulating chainfeed
  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUSDAggragator = await get('MockV3Aggregator');
    ethUsdPriceFeedAddress = ethUSDAggragator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]['ethUsdPriceFeed'];
  }
  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy('FundMe', {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  log('----------------------------------------------------------------------');

  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    log('---------------------------------------------------------------------------');
    await verify(fundMe.address, args);
    log('Verifying');
  }
  log('DONE')
  log('---------------------------------------------------------------------------');
};

module.exports.tags = ['all', 'fundme']