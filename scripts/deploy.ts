import { ethers } from "hardhat";
import { Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BeautifulImage, BeautifulImage__factory } from '../typechain-types';

async function main() {
  const baseURI: string = "https://ipfs.io/ipfs/"
  const contractURI: string =  "https://ipfs.io/ipfs/QmVW8oSySifTBDBvkTGC7J5r9UDCJ4Ndiig6B3EHvURt5S"

  const accounts: SignerWithAddress[] = await ethers.getSigners();

  if (accounts.length == 0) {
    throw new Error('No accounts were provided');
  }

  console.log("Deploying contracts with the account:", accounts[0].address);

  const BeautifulImage: BeautifulImage__factory = 
      (await ethers.getContractFactory("BeautifulImage")) as BeautifulImage__factory;
  beautifulImage = await BeautifulImageFactory.deploy(contractURI, baseURI);

  await beautifulImage.deployed();

  console.log("BeautifulImage deployed to:", beautifulImage.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });