import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HOMMItems, HOMMItems__factory } from '../typechain-types';

async function main() {
  const accounts: SignerWithAddress[] = await ethers.getSigners();

  if (accounts.length == 0) {
    throw new Error('No accounts were provided');
  }

  console.log("Deploying contracts with the account:", accounts[0].address);

  const HOMMItems: BeautifulImage__factory =
      (await ethers.getContractFactory("HOMMItems")) as HOMMItems__factory;
  const hommItems: BeautifulImage = await BeautifulImage.deploy();

  await hommItems.deployed();

  console.log("HOMMItems deployed to:", hommItems.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });