import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";
import { task } from 'hardhat/config';
import { Contract, ContractFactory, Event } from "ethers";

task("hommItemsMintGoldWoodAndMercury", "Mints the `amountOfGold` (id == 0), `amountOfWood` (id == 1), `amountOfMercury` (id == 2) to the `to` address")
    .addParam("contractAddress", "An address of a contract")
    .addParam("to", "The recipient address")
    .addParam("amountOfGold", "The amount of gold to mint")
    .addParam("amountOfWood", "The amount of wood to mint")
    .addParam("amountOfMercury", "The amount of mercury to mint")
    .setAction(async function (taskArgs, hre) {
        const HOMMItems: ContractFactory = await hre.ethers.getContractFactory("HOMMItems");
        const hommItems: Contract = await HOMMItems.attach(taskArgs.contractAddress);

        const mintTx: any = await hommItems.mintGoldWoodAndMercury(
            taskArgs.to, taskArgs.amountOfGold, taskArgs.amountOfWood, taskArgs.amountOfMercury
        );
        const mintTxReceipt: any = await mintTx.wait();

        const transferEvent: Event = mintTxReceipt.events[0];
        console.log(
            "Successfully minted %d of gold, %d of wood and %d of mercury to %s",
            transferEvent.args[4][0].toNumber(),
            transferEvent.args[4][1].toNumber(),
            transferEvent.args[4][2].toNumber(),
            transferEvent.args.to
        );
        console.log("Gas used: %d", mintTxReceipt.gasUsed.toNumber() * mintTxReceipt.effectiveGasPrice.toNumber());
    });
