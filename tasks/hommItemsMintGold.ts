import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";
import { task } from 'hardhat/config';
import { Contract, ContractFactory, Event } from "ethers";

task("hommItemsMintGold", "Mints the `amount` of gold (id == 0) to the `to` address")
    .addParam("contractAddress", "An address of a contract")
    .addParam("to", "The recipient address")
    .addParam("amount", "The amount of gold to mint")
    .setAction(async function (taskArgs, hre) {
        const HOMMItems: ContractFactory = await hre.ethers.getContractFactory("HOMMItems");
        const hommItems: Contract = await HOMMItems.attach(taskArgs.contractAddress);

        const mintTx: any = await hommItems.mintGold(taskArgs.to, taskArgs.amount);
        const mintTxReceipt: any = await mintTx.wait();

        const transferEvent: Event = mintTxReceipt.events[0];
        console.log("Successfully minted %d of gold to %s", transferEvent.args.value.toNumber(), transferEvent.args.to);
        console.log("Gas used: %d", mintTxReceipt.gasUsed.toNumber() * mintTxReceipt.effectiveGasPrice.toNumber());
    });
