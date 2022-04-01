import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, Event, BigNumber } from "ethers";
import { BeautifulImage, BeautifulImage__factory } from '../typechain-types';

describe("BeautifulImage", function () {
  const baseURI: string = "https://ipfs.io/ipfs/";
  const contractURI: string = "https://ipfs.io/ipfs/QmVW8oSySifTBDBvkTGC7J5r9UDCJ4Ndiig6B3EHvURt5S";

  let bob: Signer;
  let alice: Signer;
  let beautifulImage: BeautifulImage;

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

  function extractSelector(...signatures: string[]): string {
    let selector = 0;

    for (const signature of signatures) {
      const hexAsString = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature)).slice(0, 10);
      const hexAsInt = parseInt(hexAsString);
      selector = selector ^ hexAsInt;
    }

    return ethers.utils.hexlify(selector>>>0);
  }

  beforeEach("Deploying contract", async function () {
    [alice, bob] = await ethers.getSigners();

    const BeautifulImageFactory: BeautifulImage__factory = 
      (await ethers.getContractFactory("BeautifulImage")) as BeautifulImage__factory;

    beautifulImage = await BeautifulImageFactory.deploy(contractURI, baseURI);
  });

  describe("metadata", async function() {
    it("Should return the valid symbol", async function () {
        const expectedSymbol: string = "BI";

        const actualSymbol: string = await beautifulImage.symbol();
        
        expect(expectedSymbol).to.equal(actualSymbol);
    });

    it("Should return the valid name", async function () {
        const expectedName: string = "BeautifulImage";

        const actualName: string = await beautifulImage.name();
        
        expect(expectedName).to.equal(actualName);
    });

    it("Should return the valid tokenURI", async function () {
      const expectedTokenId: number = 0;
      const itemURI: string = "random";
      const aliceAddress: string = await alice.getAddress();
      const baseURI: string = await beautifulImage.baseURI();

      const mintTx: any = await beautifulImage.mint(aliceAddress, itemURI);
      const mintTxReceipt: any = await mintTx.wait();

      expect(1, mintTxReceipt.events.length)
      assertTransferEvent(mintTxReceipt.events[0], ethers.constants.AddressZero, aliceAddress, expectedTokenId);

      const tokenURI: string = await beautifulImage.tokenURI(expectedTokenId);
      expect(baseURI + itemURI).to.equal(tokenURI);
    });

    it("Should return the valid contract URI", async function () {
      const actualContractURI = await beautifulImage.contractURI();

      expect(contractURI).to.be.equal(actualContractURI);
    });

    it("Should return the valid base URI", async function () {
      const actualBaseURI = await beautifulImage.baseURI();

      expect(baseURI).to.be.equal(actualBaseURI);
    });
  });

  describe("minting", async function() {
    it("Should allow for owner to mint tokens", async function () {
      const expectedTokenId: number = 0;
      const tokenURI: string = "random";
      const aliceAddress: string = await alice.getAddress();
      const totalSupplyBeforeMinting: BigNumber = await beautifulImage.totalSupply();

      expect(0).to.equal(totalSupplyBeforeMinting.toNumber());

      const mintTx: any = await beautifulImage.mint(aliceAddress, tokenURI);
      const mintTxReceipt: any = await mintTx.wait();

      expect(1, mintTxReceipt.events.length)
      assertTransferEvent(mintTxReceipt.events[0], ethers.constants.AddressZero, aliceAddress, expectedTokenId);

      const aliceBalance: BigNumber = await beautifulImage.balanceOf(aliceAddress);
      expect(1).to.equal(aliceBalance.toNumber());

      const tokenOwner: string = await beautifulImage.ownerOf(expectedTokenId);
      expect(aliceAddress).to.equal(tokenOwner);

      const totalSupplyAfterMinting: BigNumber = await beautifulImage.totalSupply();
      expect(1).to.equal(totalSupplyAfterMinting.toNumber());
    });

    it("Should not allow for non-owner to mint tokens", async function () {
      const aliceAddress: string = await alice.getAddress();
      const tokenURI: string = "random";
      const mintTxPromise: Promise<any> = beautifulImage.connect(bob).mint(aliceAddress, tokenURI);

      await expect(mintTxPromise).to.be.revertedWith("'Ownable: caller is not the owner'");
    });

    it("Should not allow minting to the zero address", async function () {
      const tokenURI: string = "random";
      const mintTxPromise: Promise<any> = beautifulImage.mint(ethers.constants.AddressZero, tokenURI);

      await expect(mintTxPromise)
        .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'ERC721: mint to the zero address'");
    });
  });

  describe("burning", async function() {
    beforeEach("Minting a token for Alice", async function () {
      const tokenURI: string = "random";
      const aliceAddress: string = await alice.getAddress();

      await beautifulImage.mint(aliceAddress, tokenURI);
    });

    it("Should not allow to burn non-belonging tokens", async function () {
      const expectedTokenId: number = 0;

      const burnTxPromise: Promise<any> = beautifulImage.connect(bob).burn(expectedTokenId);

      await expect(burnTxPromise)
        .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'ERC721Burnable: caller is not owner nor approved'");
    });

    it("Should allow to burn belonging tokens", async function () {
      const expectedTokenId: number = 0;
      const aliceAddress: string = await alice.getAddress();

      const burnTx: any = await beautifulImage.burn(expectedTokenId);
      const burnTxReceipt: any = await burnTx.wait();

      expect(2, burnTxReceipt.events.length)
      assertApprovalEvent(burnTxReceipt.events[0], aliceAddress, ethers.constants.AddressZero, expectedTokenId);
      assertTransferEvent(burnTxReceipt.events[1], aliceAddress, ethers.constants.AddressZero, expectedTokenId);

      const aliceBalanceAfterBurning: BigNumber = await beautifulImage.balanceOf(aliceAddress);
      expect(0).to.equal(aliceBalanceAfterBurning.toNumber());

      const totalSupplyAfterBurning: BigNumber = await beautifulImage.totalSupply();
      expect(0).to.equal(totalSupplyAfterBurning.toNumber());
    });
  });

  describe("transfer", async function() {
    beforeEach("Minting a token for Alice", async function () {
      const tokenURI: string = "random";
      const aliceAddress: string = await alice.getAddress();

      await beautifulImage.mint(aliceAddress, tokenURI);
    });

    it("Should allow to transfer belonging token", async function () {
      const tokenId: number = 0;
      const aliceAddress: string = await alice.getAddress();
      const bobAddress: string = await bob.getAddress();

      let balanceOfBob = await beautifulImage.balanceOf(bobAddress);
      let balanceOfAlice = await beautifulImage.balanceOf(aliceAddress);
      let tokenOwner = await beautifulImage.ownerOf(tokenId);

      expect(0).to.be.equal(balanceOfBob);
      expect(1).to.be.equal(balanceOfAlice);
      expect(aliceAddress).to.be.equal(tokenOwner);

      const transferTx: any = await beautifulImage.transferFrom(aliceAddress, bobAddress, tokenId);
      const transferTxReceipt: any = await transferTx.wait();

      expect(2, transferTxReceipt.events.length)
      assertApprovalEvent(transferTxReceipt.events[0], aliceAddress, ethers.constants.AddressZero, tokenId);
      assertTransferEvent(transferTxReceipt.events[1], aliceAddress, bobAddress, tokenId);
      
      balanceOfBob = await beautifulImage.balanceOf(bobAddress);
      balanceOfAlice = await beautifulImage.balanceOf(aliceAddress);
      tokenOwner = await beautifulImage.ownerOf(tokenId);

      expect(1).to.be.equal(balanceOfBob);
      expect(0).to.be.equal(balanceOfAlice);
      expect(bobAddress).to.be.equal(tokenOwner);
    });

    it("Should allow to transfer approved token", async function () {
      const tokenId: number = 0;
      const aliceAddress: string = await alice.getAddress();
      const bobAddress: string = await bob.getAddress();

      let balanceOfBob = await beautifulImage.balanceOf(bobAddress);
      let balanceOfAlice = await beautifulImage.balanceOf(aliceAddress);
      let tokenOwner = await beautifulImage.ownerOf(tokenId);

      expect(0).to.be.equal(balanceOfBob);
      expect(1).to.be.equal(balanceOfAlice);
      expect(aliceAddress).to.be.equal(tokenOwner);

      const approveTx: any = await beautifulImage.approve(bobAddress, tokenId);
      const approveTxReceipt: any = await approveTx.wait();

      expect(1, approveTxReceipt.events.length)
      assertApprovalEvent(approveTxReceipt.events[0], aliceAddress, bobAddress, tokenId);

      const transferTx: any = await beautifulImage.connect(bob).transferFrom(aliceAddress, bobAddress, tokenId);
      const transferTxReceipt: any = await transferTx.wait();

      expect(2, transferTxReceipt.events.length)
      assertApprovalEvent(transferTxReceipt.events[0], aliceAddress, ethers.constants.AddressZero, tokenId);
      assertTransferEvent(transferTxReceipt.events[1], aliceAddress, bobAddress, tokenId);
      
      balanceOfBob = await beautifulImage.balanceOf(bobAddress);
      balanceOfAlice = await beautifulImage.balanceOf(aliceAddress);
      tokenOwner = await beautifulImage.ownerOf(tokenId);

      expect(1).to.be.equal(balanceOfBob);
      expect(0).to.be.equal(balanceOfAlice);
      expect(bobAddress).to.be.equal(tokenOwner);
    });

    it("Should not allow to transfer unapproved token", async function () {
      const tokenId: number = 0;
      const aliceAddress: string = await alice.getAddress();
      const bobAddress: string = await bob.getAddress();

      const transferTxPromise: any = beautifulImage.connect(bob).transferFrom(aliceAddress, bobAddress, tokenId);

      await expect(transferTxPromise)
        .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'ERC721: transfer caller is not owner nor approved'");
    });
  });

  describe("misc", async function() {
    it('Should correctly check supported interfaces', async function() {
      const ierc165Selector = extractSelector("supportsInterface(bytes4)");
      const ierc721MetadataSelector = extractSelector("name()", "symbol()", "tokenURI(uint256)");
      const ierc721Selector = extractSelector(
        "balanceOf(address)",
        "ownerOf(uint256)",
        "safeTransferFrom(address,address,uint256)",
        "transferFrom(address,address,uint256)",
        "approve(address,uint256)",
        "getApproved(uint256)",
        "setApprovalForAll(address,bool)",
        "isApprovedForAll(address,address)",
        "safeTransferFrom(address,address,uint256,bytes)"
      );
      const ierc721EnumerableSelector = extractSelector(
        "totalSupply()", "tokenOfOwnerByIndex(address,uint256)", "tokenByIndex(uint256)"
      );

      const supportsIERC165 = await beautifulImage.supportsInterface(ierc165Selector);
      const supportsIERC721Metadata = await beautifulImage.supportsInterface(ierc721MetadataSelector);
      const supportsIERC721Enumerable = await beautifulImage.supportsInterface(ierc721EnumerableSelector);
      const supportsIERC721 = await beautifulImage.supportsInterface(ierc721Selector);

      expect(supportsIERC165).to.equal(true);
      expect(supportsIERC721Metadata).to.equal(true);
      expect(supportsIERC721Enumerable).to.equal(true);
      expect(supportsIERC721).to.equal(true);
    });

    it('Should return valid token owner', async function() {
      const expectedTokenId: number = 0;
      const itemURI: string = "random";
      const aliceAddress: string = await alice.getAddress();

      await beautifulImage.mint(aliceAddress, itemURI);

      const tokenOwner = await beautifulImage.ownerOf(expectedTokenId);
      expect(aliceAddress).to.equal(tokenOwner);
    });

    it('Should not allow to find owner for a non-existent token', async function() {
      const nonExistentTokenId = 1;

      const ownerOfPromise: any = beautifulImage.ownerOf(nonExistentTokenId);

      await expect(ownerOfPromise).to.be.revertedWith("ERC721: owner query for nonexistent token");
    });
  });
});
