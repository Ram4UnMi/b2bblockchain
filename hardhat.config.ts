require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

task("check-account", "Prints the account's address used for deployment", async (taskArgs, hre) => {
  const [deployer] = await hre.ethers.getSigners();
  if (deployer) {
    console.log("Deployer Address:", deployer.address);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.utils.formatEther(balance), "ETH");
  } else {
    console.log("No deployer account configured. Check your PRIVATE_KEY in the .env file.");
  }
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};