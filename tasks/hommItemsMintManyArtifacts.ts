import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";
import { task } from 'hardhat/config';
import { Contract, ContractFactory, Event } from "ethers";

task("hommItemsMintManyArtifacts", "Mints a bunch of new artifacts with the `metadataCIDs` to the `to` address")
    .addParam("contractAddress", "An address of a contract")
    .addParam("to", "The recipient address")
    .addParam("metadataIdentifiers", "The comma separated artifacts metadata CIDs of v1")
    .setAction(async function (taskArgs, hre) {
        const HOMMItems: ContractFactory = await hre.ethers.getContractFactory("HOMMItems");
        const hommItems: Contract = await HOMMItems.attach(taskArgs.contractAddress);

        const mintTx: any = await hommItems.mintManyArtifacts(taskArgs.to, taskArgs.metadataIdentifiers.split(","));
        const mintTxReceipt: any = await mintTx.wait();

        const transferEvent: Event = mintTxReceipt.events[0];
        console.log(
            "Successfully minted artifacts with ids %s to %s",
            JSON.stringify(transferEvent.args.ids.map(id => id.toNumber())),
            transferEvent.args.to
        );
        console.log("Gas used: %d", mintTxReceipt.gasUsed.toNumber() * mintTxReceipt.effectiveGasPrice.toNumber());
    });
