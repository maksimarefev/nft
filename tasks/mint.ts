import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";
import { task } from 'hardhat/config';
import { Contract, ContractFactory, Event } from "ethers";

task("mint", "Mints a new token with the `tokenIdentifier` to the `to` address")
    .addParam("contractAddress", "An address of a contract")
    .addParam("to", "The recipient address")
    .addParam("tokenIdentifier", "The content identifier of a token's metadata")
    .setAction(async function (taskArgs, hre) {
        const BeautifulImage: ContractFactory = await hre.ethers.getContractFactory("BeautifulImage");
        const beautifulImage: Contract = await BeautifulImage.attach(taskArgs.contractAddress);

        const mintTx: any = await beautifulImage.mint(taskArgs.to, taskArgs.tokenIdentifier);
        const mintTxReceipt: any = await mintTx.wait();

        const transferEvent: Event = mintTxReceipt.events[0];
        console.log(
            "Successfully mint token with id %d to %s", transferEvent.args.tokenId.toNumber(), transferEvent.args.to
        );
        console.log("Gas used: %d", mintTxReceipt.gasUsed.toNumber() * mintTxReceipt.effectiveGasPrice.toNumber());
    });
