const { ethers, getNamedAccounts } = require('hardhat');

async function main() {
  const { deployer } = await getNamedAccounts()
  const fundMe = await ethers.getContract('FundMe', deployer)
  console.log('Funding contract')
  const transferValue = ethers.utils.parseEther('0.2');
  const transactionResponse = await fundMe.fund({ value: transferValue })
  await transactionResponse.wait(1)
  console.log('Funded')
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })