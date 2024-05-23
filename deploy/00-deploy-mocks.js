const { network } = require("hardhat");


const { developmentChains, DECIMALS, INITAILANSWER } = require('../helper-harhat-config');


module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  if (developmentChains.includes(network.name)) {
    log('Local netwok detected deploying mocks');
    await deploy('MockV3Aggregator', {
      contract: 'MockV3Aggregator',
      from: deployer,
      logs: true,
      args: [DECIMALS, INITAILANSWER]
    });
    log('Mocks deployed');
  }

}
module.exports.tags = ['all', 'mocks'];