const { deployments, ethers, getNamedAccounts } = require('hardhat');
const { assert, expect } = require('chai');
const { developmentChains } = require('../../helper-harhat-config')

!developmentChains.includes(network.name) ? describe.skip :
  describe('FundMe', async function () {
    let fundMe;
    let deployer;
    let mockV3Aggretator;
    const transferValue = ethers.utils.parseEther('1');
    beforeEach(async function () {
      //run all  functions with the all tag in deploy folder
      deployer = (await getNamedAccounts()).deployer;
      await deployments.fixture(['all']);
      // get recent deployed contract
      //const accounts = await ethers.getSigners(); //10 fake accounts on local host
      //accountZero= accounts[0]
      fundMe = await ethers.getContract('FundMe', deployer)
      mockV3Aggretator = await ethers.getContract('MockV3Aggregator', deployer)
    })
    describe('constructor', async function () {
      it('Sets the aggregtor address correctly', async function () {
        const response = await fundMe.s_priceFeed()
        assert.equal(response, mockV3Aggretator.address)
      })
    })

    describe('fund', async function () {
      it('fails if not enough eth is send', async function () {
        await expect(fundMe.fund()).to.be.revertedWith('You need to spend more ETH!');
      })

      it('updates the amount funded data structure', async function () {
        await fundMe.fund({ value: transferValue })
        const response = await fundMe.s_addressToAmountFunded(deployer)
        assert.equal(response.toString(), transferValue.toString())
      })

      it('adds funder to s_funders array', async function () {
        await fundMe.fund({ value: transferValue })
        const funder = await fundMe.s_funders(0)
        assert.equal(funder, deployer)
      })
    })

    describe('Withdraw', async function () {
      beforeEach(async function () {
        await fundMe.fund({ value: transferValue })
      })

      it('withdraws eth from a single founder', async function () {
        //arrange
        const startingContractBalance = await fundMe.provider.getBalance(fundMe.address)
        const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
        //Act
        const response = await fundMe.withdraw()
        const receipt = await response.wait(1)
        const { gasUsed, effectiveGasPrice } = receipt;
        const gasCost = gasUsed.mul(effectiveGasPrice)
        const endingContractBalance = await fundMe.provider.getBalance(fundMe.address)
        const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
        //assert
        assert.equal(endingContractBalance, 0)
        assert.equal(startingContractBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
      })

      it('withdraws eth from multiple founders', async function () {
        const accounts = await ethers.getSigners()
        for (let i = 1; i < 6; i++) {
          const fundMeConnectedContract = await fundMe.connect(accounts[i])
          await fundMeConnectedContract.fund({ value: transferValue })
        }

        const startingContractBalance = await fundMe.provider.getBalance(fundMe.address)
        const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
        //Act
        const response = await fundMe.withdraw()
        const receipt = await response.wait(1)
        const { gasUsed, effectiveGasPrice } = receipt;
        const gasCost = gasUsed.mul(effectiveGasPrice)
        const endingContractBalance = await fundMe.provider.getBalance(fundMe.address)
        const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
        //assert
        assert.equal(endingContractBalance, 0)
        assert.equal(startingContractBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())

        await expect(fundMe.s_funders(0)).to.be.reverted
        for (let i = 1; i < 6; i++) {
          assert.equal(await fundMe.s_addressToAmountFunded(accounts[i].address), 0)
        }
      })

      it('only the owner can withdraw', async function () {
        const attackers = await ethers.getSigners()
        const attacker = attackers[1]
        const fundMeConnectedAttacker = await fundMe.connect(attacker)
        await expect(fundMeConnectedAttacker.withdraw()).to.be.revertedWith('FundeMe__NotOwner')
      })
    })

    describe('cheaperWithdraw()', async function () {
      beforeEach(async function () {
        await fundMe.fund({ value: transferValue })
      })

      it('withdraws eth from a single founder', async function () {
        //arrange
        const startingContractBalance = await fundMe.provider.getBalance(fundMe.address)
        const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
        //Act
        const response = await fundMe.cheaperWithdraw()
        const receipt = await response.wait(1)
        const { gasUsed, effectiveGasPrice } = receipt;
        const gasCost = gasUsed.mul(effectiveGasPrice)
        const endingContractBalance = await fundMe.provider.getBalance(fundMe.address)
        const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
        //assert
        assert.equal(endingContractBalance, 0)
        assert.equal(startingContractBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
      })

      it('withdraws eth from multiple founders', async function () {
        const accounts = await ethers.getSigners()
        for (let i = 1; i < 6; i++) {
          const fundMeConnectedContract = await fundMe.connect(accounts[i])
          await fundMeConnectedContract.fund({ value: transferValue })
        }

        const startingContractBalance = await fundMe.provider.getBalance(fundMe.address)
        const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
        //Act
        const response = await fundMe.cheaperWithdraw()
        const receipt = await response.wait(1)
        const { gasUsed, effectiveGasPrice } = receipt;
        const gasCost = gasUsed.mul(effectiveGasPrice)
        const endingContractBalance = await fundMe.provider.getBalance(fundMe.address)
        const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
        //assert
        assert.equal(endingContractBalance, 0)
        assert.equal(startingContractBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())

        await expect(fundMe.s_funders(0)).to.be.reverted
        for (let i = 1; i < 6; i++) {
          assert.equal(await fundMe.s_addressToAmountFunded(accounts[i].address), 0)
        }
      })

      it('only the owner can withdraw', async function () {
        const attackers = await ethers.getSigners()
        const attacker = attackers[1]
        const fundMeConnectedAttacker = await fundMe.connect(attacker)
        await expect(fundMeConnectedAttacker.cheaperWithdraw()).to.be.revertedWith('FundeMe__NotOwner')
      })
    })

  })