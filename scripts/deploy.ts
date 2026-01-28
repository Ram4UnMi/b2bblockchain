import { ethers } from "hardhat";

async function main() {
  const supplyChain = await ethers.deployContract("SupplyChainB2B");

  await supplyChain.waitForDeployment();

  console.log("SupplyChainB2B deployed to:", supplyChain.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
