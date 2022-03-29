import { expect } from "chai";
import { ethers, artifacts, network } from "hardhat";
import { Signer, Contract, ContractFactory, Event, BigNumber } from "ethers";
import { BeautifulImage, BeautifulImage__factory } from '../typechain-types';

/*
todo arefev: write tests
  * should return valid total supply
  * should return valid token owner
  * should return valid token by index
  * should return valid balance
*/
  describe("BeautifulImage", function () {

    let bob: Signer;
    let alice: Signer;
    let contract: BeautifulImage;

    function assertTransferEvent(event: Event, from: string, to: string, value: number) {
        expect("Transfer").to.equal(event.event);
        expect(from).to.equal(event.args.from);
        expect(to).to.equal(event.args.to);
        expect(value).to.equal(event.args.tokenId.toNumber());
    }

    function assertApprovalEvent(event: Event, tokenOwner: string, spender: string, value: number) {
        expect("Approval").to.equal(event.event);
        expect(tokenOwner).to.equal(event.args.owner);
        expect(spender).to.equal(event.args.approved);
        expect(value).to.equal(event.args.tokenId.toNumber());
    }

    beforeEach(async function () {
      [alice, bob] = await ethers.getSigners();

      const BeautifulImageFactory: BeautifulImage__factory = 
        (await ethers.getContractFactory("BeautifulImage")) as BeautifulImage__factory;

      contract = await BeautifulImageFactory.deploy();
    });

    it("Should return the valid symbol", async function () {
        const expectedSymbol: string = "CTS";

        const actualSymbol: string = await contract.symbol();
        
        expect(expectedSymbol).to.equal(actualSymbol);
    });

    it("Should return the valid name", async function () {
        const expectedName: string = "Cats";

        const actualName: string = await contract.name();
        
        expect(expectedName).to.equal(actualName);
    });

    it("Should return the valid tokenURI", async function () {
      const expectedTokenId: number = 0;
      const itemURI: string = "random";
      const aliceAddress: string = await alice.getAddress();
      const baseURI: string = await contract.getBaseURI();

      const mintTx: any = await contract.mint(aliceAddress, itemURI);
      const mintTxReceipt: any = await mintTx.wait();

      expect(1, mintTxReceipt.events.length)
      assertTransferEvent(mintTxReceipt.events[0], ethers.constants.AddressZero, aliceAddress, expectedTokenId);

      const tokenURI: string = await contract.tokenURI(expectedTokenId);
      expect(baseURI + itemURI).to.equal(tokenURI);
    });

    it("Should allow for owner to mint tokens", async function () {
      const expectedTokenId: number = 0;
      const tokenURI: string = "random";
      const aliceAddress: string = await alice.getAddress();
      const totalSupplyBeforeMinting: BigNumber = await contract.totalSupply();

      expect(0).to.equal(totalSupplyBeforeMinting.toNumber());

      const mintTx: any = await contract.mint(aliceAddress, tokenURI);
      const mintTxReceipt: any = await mintTx.wait();

      expect(1, mintTxReceipt.events.length)
      assertTransferEvent(mintTxReceipt.events[0], ethers.constants.AddressZero, aliceAddress, expectedTokenId);

      const aliceBalance: BigNumber = await contract.balanceOf(aliceAddress);
      expect(1).to.equal(aliceBalance.toNumber());

      const tokentOwner: string = await contract.ownerOf(expectedTokenId);
      expect(aliceAddress).to.equal(tokentOwner);

      const totalSupplyAfterMinting: BigNumber = await contract.totalSupply();
      expect(1).to.equal(totalSupplyAfterMinting.toNumber());
    });

    it("Should not allow for non-owner to mint tokens", async function () {
      const aliceAddress = await alice.getAddress();
      const tokenURI: string = "random";
      const mintTxPromise: Promise<any> = contract.connect(bob).mint(aliceAddress, tokenURI);

      await expect(mintTxPromise).to.be.revertedWith("'Ownable: caller is not the owner'");

    });

    it("Should not allow to burn non-belonging tokens", async function () {
      const aliceAddress: string = await alice.getAddress();
      const bobAddress: string = await bob.getAddress();
      const expectedTokenId: number = 0;
      const tokenURI: string = "random";

      const mintTx: any = await contract.mint(aliceAddress, tokenURI);
      const mintTxReceipt: any = await mintTx.wait();

      expect(1, mintTxReceipt.events.length)
      assertTransferEvent(mintTxReceipt.events[0], ethers.constants.AddressZero, aliceAddress, expectedTokenId);

      const burnTxPromise: Promise<any> = contract.connect(bob).burn(expectedTokenId);

      await expect(burnTxPromise)
        .to.be.revertedWith("Error: VM Exception while processing transaction: reverted with reason string 'ERC721Burnable: caller is not owner nor approved'");
    });

    it("Should allow to burn belonging tokens", async function () {
      const expectedTokenId: number = 0;
      const tokenURI: string = "random";
      const aliceAddress: string = await alice.getAddress();
      const totalSupplyBeforeMinting: BigNumber = await contract.totalSupply();

      //todo arefev: check alice' balance
      expect(0).to.equal(totalSupplyBeforeMinting.toNumber());

      const mintTx: any = await contract.mint(aliceAddress, tokenURI);
      const mintTxReceipt: any = await mintTx.wait();

      expect(1, mintTxReceipt.events.length)
      assertTransferEvent(mintTxReceipt.events[0], ethers.constants.AddressZero, aliceAddress, expectedTokenId);

      const aliceBalanceAfterMinting: BigNumber = await contract.balanceOf(aliceAddress);
      expect(1).to.equal(aliceBalanceAfterMinting.toNumber());

      const totalSupplyAfterMinting: BigNumber = await contract.totalSupply();
      expect(1).to.equal(totalSupplyAfterMinting.toNumber());

      const burnTx: any = await contract.burn(expectedTokenId);
      const burnTxReceipt: any = await burnTx.wait();

      expect(2, burnTxReceipt.events.length)
      assertApprovalEvent(burnTxReceipt.events[0], aliceAddress, ethers.constants.AddressZero, expectedTokenId);
      assertTransferEvent(burnTxReceipt.events[1], aliceAddress, ethers.constants.AddressZero, expectedTokenId);

      const aliceBalanceAfterBurning: BigNumber = await contract.balanceOf(aliceAddress);
      expect(0).to.equal(aliceBalanceAfterBurning.toNumber());

      const totalSupplyAfterBurning: BigNumber = await contract.totalSupply();
      expect(0).to.equal(totalSupplyAfterBurning.toNumber());
    });

    it("Should allow to transfer approved token", async function () {
      //todo arefev: implement
    });

    it("should not allow to transfer unapproved token", async function () {
      //todo arefev: implement
    });
  });
