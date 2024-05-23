const { ethers, getNamedAccounts, network } = require('hardhat');
const { assert } = require('chai');

const { developmentChains } = require('../../helper-harhat-config')

developmentChains.includes(network.name) ? describe.skip :
  describe('FundMe', async function () {
    let fundMe;
    let deployer;
    const transferValue = ethers.utils.parseEther('1');
    beforeEach(async function () {
      //run all  functions with the all tag in deploy folder
      deployer = (await getNamedAccounts()).deployer;
      fundMe = await ethers.getContract('FundMe', deployer)
    })
    it('Allows withdraw', async function () {
      //arrange
      await fundMe.fund({ value: transferValue })
      await fundMe.withdraw()

      const endingContractBalance = await fundMe.provider.getBalance(fundMe.address)
      assert.equal(endingContractBalance, 0)
    })
  })