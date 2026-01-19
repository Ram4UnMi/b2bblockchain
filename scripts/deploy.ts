const { ethers } = require("hardhat");

async function main() {
  const ProductReservation = await ethers.getContractFactory(
    "ProductReservation"
  );

  const productReservation = await ProductReservation.deploy();

  await productReservation.deployed();

  console.log("ProductReservation deployed to:", productReservation.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
