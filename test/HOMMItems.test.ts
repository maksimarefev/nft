import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, Event, BigNumber } from "ethers";
import { HOMMItems, HOMMItems__factory } from '../typechain-types';

describe("HOMMItems", function () {
  const GOLD: number = 0;
  const WOOD: number = 1;
  const MERCURY: number = 2;
  const GOLD_INITIAL_SUPPLY: number = 10000;
  const WOOD_INITIAL_SUPPLY: number = 20;
  const MERCURY_INITIAL_SUPPLY: number = 10;

  let bob: Signer;
  let alice: Signer;
  let hommItems: HOMMItems;

  function assertTransferSingleEvent(event: Event, from: string, to: string, id: number, value: number) {
      //todo arefev: should i test the operator? => YES I SHOULD
      expect("TransferSingle").to.equal(event.event);
      expect(from).to.equal(event.args.from);
      expect(to).to.equal(event.args.to);
      expect(value).to.equal(event.args.value.toNumber());
      expect(id).to.equal(event.args.id.toNumber());
  }

  function assertTransferBatchEvent(event: Event, from: string, to: string, ids: number[], values: number[]) {
      //todo arefev: should i test the operator? => YES I SHOULD
      expect("TransferBatch").to.equal(event.event);
      expect(from).to.equal(event.args.from);
      expect(to).to.equal(event.args.to);
      expect(ids).to.eql(event.args.ids.map(id => id.toNumber()));
  }

  function assertApprovalForAllEvent(event: Event, operator: string, account: string, approved: boolean) {
      expect("ApprovalForAll").to.equal(event.event);
      expect(operator).to.equal(event.args.operator);
      expect(account).to.equal(event.args.account);
      expect(approved).to.equal(event.args.approved);
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

    const HOMMItemsFactory: HOMMItems__factory =
      (await ethers.getContractFactory("HOMMItems")) as HOMMItems__factory;

    hommItems = await HOMMItemsFactory.deploy();
  });

  describe("minting", async function() {
    async function shouldAllowToMint(
        tokenId: number, initialSupply: number, mintFunction: (address: string, amount: number) => Promise<any>
     ) {
        const amountOfGoldToIssue: number = 1000;
        const aliceAddress: string = await alice.getAddress();
        const aliceBalanceBeforeMinting: BigNumber = await hommItems.balanceOf(aliceAddress, tokenId);
        const totalSupplyBeforeMinting: BigNumber = await hommItems.totalSupply(tokenId);

        expect(initialSupply).to.equal(aliceBalanceBeforeMinting.toNumber());
        expect(initialSupply).to.equal(totalSupplyBeforeMinting.toNumber());

        const mintTx: any = await mintFunction(aliceAddress, amountOfGoldToIssue);
        const mintTxReceipt: any = await mintTx.wait();

        expect(1, mintTxReceipt.events.length);
        assertTransferSingleEvent(
            mintTxReceipt.events[0], ethers.constants.AddressZero, aliceAddress, tokenId, amountOfGoldToIssue
        );

        const aliceBalanceAfterMinting: BigNumber = await hommItems.balanceOf(aliceAddress, tokenId);
        expect(aliceBalanceBeforeMinting.toNumber() + amountOfGoldToIssue).to.equal(aliceBalanceAfterMinting.toNumber());

        const totalSupplyAfterMinting: BigNumber = await hommItems.totalSupply(tokenId);
        expect(totalSupplyBeforeMinting.toNumber() + amountOfGoldToIssue).to.equal(totalSupplyAfterMinting.toNumber());
    }

    async function shouldNotAllowToMint(mintFunction: (address: string, amount: number) => Promise<any>) {
        const amount: number = 1000;
        const aliceAddress: string = await alice.getAddress();
        const mintTxPromise: Promise<any> = mintFunction(aliceAddress, amount);

        await expect(mintTxPromise)
            .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'");
    }

    async function shouldNotAllowToMintToTheZeroAddress(mintFunction: (address: string, amount: number) => Promise<any>) {
        const amount: number = 1000;
        const mintTxPromise: Promise<any> = mintFunction(ethers.constants.AddressZero, amount);

        await expect(mintTxPromise)
            .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'ERC721: mint to the zero address'");
    }

    it("Should allow for owner to mint gold", async function () {
      shouldAllowToMint(GOLD, GOLD_INITIAL_SUPPLY, hommItems.mintGold);
    });

    it("Should allow for owner to mint wood", async function () {
      shouldAllowToMint(WOOD, WOOD_INITIAL_SUPPLY, hommItems.mintWood);
    });

    it("Should allow for owner to mint mercury", async function () {
      shouldAllowToMint(MERCURY, MERCURY_INITIAL_SUPPLY, hommItems.mintMercury);
    });

    it("Should allow for owner to mint artifact", async function () {
        const metadataFile: string = "random";
        const expectedTokenId: number = 6;
        const aliceAddress: string = await alice.getAddress();

        const isTokenExists: boolean = await hommItems.exists(expectedTokenId);
        expect(false).to.equal(isTokenExists);

        const mintTx: any = await hommItems.mintArtifact(aliceAddress, metadataFile);
        const mintTxReceipt: any = await mintTx.wait();

        expect(1, mintTxReceipt.events.length);
        assertTransferSingleEvent(mintTxReceipt.events[0], ethers.constants.AddressZero, aliceAddress, expectedTokenId, 1);

        const balanceOfToken: BigNumber = await hommItems.balanceOf(aliceAddress, expectedTokenId);
        expect(1).to.be.equal(balanceOfToken.toNumber());
    });

    it("Should allow for owner to mint many artifacts", async function () {
        const metadataFiles: string[] = ["random", "random"];
        const expectedTokenIds: number[] = [6, 7];
        const aliceAddress: string = await alice.getAddress();

        let isTokenExists: boolean = await hommItems.exists(expectedTokenIds[0]);
        expect(false).to.equal(isTokenExists);

        isTokenExists = await hommItems.exists(expectedTokenIds[1]);
        expect(false).to.equal(isTokenExists);

        const mintTx: any = await hommItems.mintManyArtifacts(aliceAddress, metadataFiles);
        const mintTxReceipt: any = await mintTx.wait();

        expect(1, mintTxReceipt.events.length);
        assertTransferBatchEvent(
            mintTxReceipt.events[0], ethers.constants.AddressZero, aliceAddress, expectedTokenIds, [1, 1]
        );

        let balanceOfToken: BigNumber = await hommItems.balanceOf(aliceAddress, expectedTokenIds[0]);
        expect(1).to.be.equal(balanceOfToken.toNumber());

        balanceOfToken = await hommItems.balanceOf(aliceAddress, expectedTokenIds[1]);
        expect(1).to.be.equal(balanceOfToken.toNumber());
    });

    it("Should allow for owner to mint gold, wood and mercury", async function() {
        const amountOfGoldToIssue: number = 1000;
        const amountOfWoodToIssue: number = 20;
        const amountOfMercuryToIssue: number = 10;
        const amounts: number[] = [amountOfGoldToIssue, amountOfWoodToIssue, amountOfMercuryToIssue];
        const aliceAddress: string = await alice.getAddress();

        const aliceGoldBalanceBeforeMinting: BigNumber = await hommItems.balanceOf(aliceAddress, GOLD);
        expect(GOLD_INITIAL_SUPPLY).to.equal(aliceGoldBalanceBeforeMinting.toNumber());

        const aliceWoodBalanceBeforeMinting: BigNumber = await hommItems.balanceOf(aliceAddress, WOOD);
        expect(WOOD_INITIAL_SUPPLY).to.equal(aliceWoodBalanceBeforeMinting.toNumber());

        const aliceMercuryBalanceBeforeMinting: BigNumber = await hommItems.balanceOf(aliceAddress, MERCURY);
        expect(MERCURY_INITIAL_SUPPLY).to.equal(aliceMercuryBalanceBeforeMinting.toNumber());

        const totalSupplyOfGoldBeforeMinting: BigNumber = await hommItems.totalSupply(GOLD);
        expect(GOLD_INITIAL_SUPPLY).to.equal(totalSupplyOfGoldBeforeMinting.toNumber());

        const totalSupplyOfWoodBeforeMinting: BigNumber = await hommItems.totalSupply(WOOD);
        expect(WOOD_INITIAL_SUPPLY).to.equal(totalSupplyOfWoodBeforeMinting.toNumber());

        const totalSupplyOfMercuryBeforeMinting: BigNumber = await hommItems.totalSupply(MERCURY);
        expect(MERCURY_INITIAL_SUPPLY).to.equal(totalSupplyOfMercuryBeforeMinting.toNumber());

        const mintTx: any = await hommItems.mintGoldWoodAndMercury(
            aliceAddress, amountOfGoldToIssue, amountOfWoodToIssue, amountOfMercuryToIssue
        );
        const mintTxReceipt: any = await mintTx.wait();

        expect(1, mintTxReceipt.events.length);
        assertTransferBatchEvent(
            mintTxReceipt.events[0], ethers.constants.AddressZero, aliceAddress, [GOLD, WOOD, MERCURY], amounts
        );

        const aliceGoldBalanceAfterMinting: BigNumber = await hommItems.balanceOf(aliceAddress, GOLD);
        expect(aliceGoldBalanceBeforeMinting.toNumber() + amountOfGoldToIssue).to.equal(aliceGoldBalanceAfterMinting.toNumber());

        const aliceWoodBalanceAfterMinting: BigNumber = await hommItems.balanceOf(aliceAddress, WOOD);
        expect(aliceWoodBalanceBeforeMinting.toNumber() + amountOfWoodToIssue).to.equal(aliceWoodBalanceAfterMinting.toNumber());

        const aliceMercuryBalanceAfterMinting: BigNumber = await hommItems.balanceOf(aliceAddress, MERCURY);
        expect(aliceMercuryBalanceBeforeMinting.toNumber() + amountOfMercuryToIssue).to.equal(aliceMercuryBalanceAfterMinting.toNumber());

        const totalSupplyOfGoldAfterMinting: BigNumber = await hommItems.totalSupply(GOLD);
        expect(totalSupplyOfGoldBeforeMinting.toNumber() + amountOfGoldToIssue).to.equal(totalSupplyOfGoldAfterMinting.toNumber());

        const totalSupplyOfWoodAfterMinting: BigNumber = await hommItems.totalSupply(WOOD);
        expect(totalSupplyOfWoodBeforeMinting.toNumber() + amountOfWoodToIssue).to.equal(totalSupplyOfWoodAfterMinting.toNumber());

        const totalSupplyOfMercuryAfterMinting: BigNumber = await hommItems.totalSupply(MERCURY);
        expect(totalSupplyOfMercuryBeforeMinting.toNumber() + amountOfMercuryToIssue).to.equal(totalSupplyOfMercuryAfterMinting.toNumber());
    });

    it("Should not allow for non-owner to mint gold", async function () {
      shouldNotAllowToMint(hommItems.connect(bob).mintGold);
    });

    it("Should not allow for non-owner to mint wood", async function () {
      shouldNotAllowToMint(hommItems.connect(bob).mintWood);
    });

    it("Should not allow for non-owner to mint mercury", async function () {
      shouldNotAllowToMint(hommItems.connect(bob).mintMercury);
    });

    it("Should not allow for non-owner to mint gold, wood and mercury", async function() {
        const amountOfGoldToIssue: number = 1000;
        const amountOfWoodToIssue: number = 20;
        const amountOfMercuryToIssue: number = 10;
        const aliceAddress: string = await alice.getAddress();

        const mintTxPromise: Promise<any> = hommItems.connect(bob).mintGoldWoodAndMercury(
            aliceAddress, amountOfGoldToIssue, amountOfWoodToIssue, amountOfMercuryToIssue
        );

        await expect(mintTxPromise)
            .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'");
    });

    it("Should allow for non-owner to mint many artifacts", async function () {
        const metadataFiles: string[] = ["random", "random"];
        const aliceAddress: string = await alice.getAddress();

        const mintTxPromise: Promise<any> = hommItems.connect(bob).mintManyArtifacts(aliceAddress, metadataFiles);

        await expect(mintTxPromise)
            .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'");
    });

    it("Should not allow for non-owner to mint artifact", async function () {
      const metadataFile: string = "random";
      const aliceAddress: string = await alice.getAddress();
      const mintTxPromise: Promise<any> = hommItems.connect(bob).mintArtifact(aliceAddress, metadataFile);

      await expect(mintTxPromise)
          .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'");
    });

    it("Should not allow minting gold to the zero address", async function () {
      shouldNotAllowToMintToTheZeroAddress(hommItems.mintGold);
    });

    it("Should not allow minting wood to the zero address", async function () {
      shouldNotAllowToMintToTheZeroAddress(hommItems.mintWood);
    });

    it("Should not allow minting mercury to the zero address", async function () {
      shouldNotAllowToMintToTheZeroAddress(hommItems.mintMercury);
    });

    it("Should not allow minting artifact to the zero address", async function () {
      const metadataFile: string = "random";
      const mintTxPromise: Promise<any> = hommItems.mintArtifact(ethers.constants.AddressZero, metadataFile);

      await expect(mintTxPromise)
          .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'ERC1155: mint to the zero address'");
    });

    it("Should not allow minting many artifact to the zero address", async function () {
      const metadataFiles: string[] = ["random", "random"];
      const mintTxPromise: Promise<any> = hommItems.mintManyArtifacts(ethers.constants.AddressZero, metadataFiles);

      await expect(mintTxPromise)
          .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'ERC1155: mint to the zero address'");
    });

    it("Should not allow minting gold, wood and mercury to the zero address", async function () {
      const amountOfGoldToIssue: number = 1000;
      const amountOfWoodToIssue: number = 20;
      const amountOfMercuryToIssue: number = 10;

      const mintTxPromise: Promise<any> = hommItems.mintGoldWoodAndMercury(
            ethers.constants.AddressZero, amountOfGoldToIssue, amountOfWoodToIssue, amountOfMercuryToIssue
      );

      await expect(mintTxPromise)
        .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'ERC1155: mint to the zero address'");
    });

     it("Should not allow to mint with empty metadataFile", async function () {
        const aliceAddress: string = await alice.getAddress();
        const artifactCID: string = "";

        const mintTxPromise: Promise<any> = hommItems.mintArtifact(aliceAddress, artifactCID);
        await expect(mintTxPromise).to.be.revertedWith("metadataFile is empty");
     });

     it("Should not allow to mint with empty metadataFiles names", async function () {
         const aliceAddress: string = await alice.getAddress();
         const artifactCIDs: string[] = [""];

         const mintTxPromise: Promise<any> = hommItems.mintManyArtifacts(aliceAddress, artifactCIDs);
         await expect(mintTxPromise).to.be.revertedWith("metadataFile is empty");
     });

     it("Should not allow to mint with empty metadataFiles array", async function () {
        const aliceAddress: string = await alice.getAddress();
        const artifactCIDs: string[] = [];

        const mintTxPromise: Promise<any> = hommItems.mintManyArtifacts(aliceAddress, artifactCIDs);
        await expect(mintTxPromise).to.be.revertedWith("metadataFiles are empty");
     });
  });

  describe("burning", async function() {
    it("Should allow to burn belonging tokens", async function () {
      const amountToBurn: number = 500;
      const aliceAddress: string = await alice.getAddress();

      const aliceBalanceOfGoldBeforeBurning: BigNumber = await hommItems.balanceOf(aliceAddress, GOLD);
      expect(GOLD_INITIAL_SUPPLY).to.equal(aliceBalanceOfGoldBeforeBurning.toNumber());

      const totalSupplyOfGoldBeforeBurning: BigNumber = await hommItems.totalSupply(GOLD);
      expect(GOLD_INITIAL_SUPPLY).to.equal(totalSupplyOfGoldBeforeBurning.toNumber());

      const burnTx: any = await hommItems.burn(aliceAddress, GOLD, amountToBurn);
      const burnTxReceipt: any = await burnTx.wait();

      expect(1, burnTxReceipt.events.length)
      assertTransferSingleEvent(burnTxReceipt.events[0], aliceAddress, ethers.constants.AddressZero, GOLD, amountToBurn);

      const aliceBalanceOfGoldAfterBurning: BigNumber = await hommItems.balanceOf(aliceAddress, GOLD);
      expect(aliceBalanceOfGoldBeforeBurning.toNumber() - amountToBurn).to.equal(aliceBalanceOfGoldAfterBurning.toNumber());

      const totalSupplyOfGoldAfterBurning: BigNumber = await hommItems.totalSupply(GOLD);
      expect(totalSupplyOfGoldBeforeBurning.toNumber() - amountToBurn).to.equal(totalSupplyOfGoldAfterBurning.toNumber());
    });

    it("Should not allow to burn non-belonging tokens", async function () {
      const amountToBurn: number = 500;
      const aliceAddress: string = await alice.getAddress();
      const burnTxPromise: Promise<any> = hommItems.connect(bob).burn(aliceAddress, GOLD, amountToBurn);

      await expect(burnTxPromise)
        .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'ERC1155: caller is not owner nor approved'");
    });

    it("Should allow to burn approved tokens", async function () {
        const amountToBurn: number = 500;
        const aliceAddress: string = await alice.getAddress();
        const bobAddress: string = await bob.getAddress();

        const aliceBalanceOfGoldBeforeBurning: BigNumber = await hommItems.balanceOf(aliceAddress, GOLD);
        expect(GOLD_INITIAL_SUPPLY).to.equal(aliceBalanceOfGoldBeforeBurning.toNumber());

        const totalSupplyOfGoldBeforeBurning: BigNumber = await hommItems.totalSupply(GOLD);
        expect(GOLD_INITIAL_SUPPLY).to.equal(totalSupplyOfGoldBeforeBurning.toNumber());

        const approvalTx: any = await hommItems.setApprovalForAll(bobAddress, true)
        const approvalTxReceipt: any = await approvalTx.wait();

        expect(1, approvalTxReceipt.events.length)
        assertApprovalForAllEvent(approvalTxReceipt.events[0], bobAddress, aliceAddress, true);

        const burnTx: any = await hommItems.connect(bob).burn(aliceAddress, GOLD, amountToBurn);
        const burnTxReceipt: any = await burnTx.wait();

        //todo arefev: test operator!!
        expect(1, burnTxReceipt.events.length)
        assertTransferSingleEvent(burnTxReceipt.events[0], aliceAddress, ethers.constants.AddressZero, GOLD, amountToBurn);

        const aliceBalanceOfGoldAfterBurning: BigNumber = await hommItems.balanceOf(aliceAddress, GOLD);
        expect(aliceBalanceOfGoldBeforeBurning.toNumber() - amountToBurn).to.equal(aliceBalanceOfGoldAfterBurning.toNumber());

        const totalSupplyOfGoldAfterBurning: BigNumber = await hommItems.totalSupply(GOLD);
        expect(totalSupplyOfGoldBeforeBurning.toNumber() - amountToBurn).to.equal(totalSupplyOfGoldAfterBurning.toNumber());
    });
  });

    /*
    transfer(function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data)):
        Should allow to transfer belonging token
        Should allow to transfer approved token
        Should not allow to transfer unapproved token
    */
  /*describe("transfer", async function() {
    it("Should allow to transfer belonging token", async function () {
      const tokenId: number = 0;
      const aliceAddress: string = await alice.getAddress();
      const bobAddress: string = await bob.getAddress();

      let balanceOfBob = await hommItems.balanceOf(bobAddress);
      let balanceOfAlice = await hommItems.balanceOf(aliceAddress);
      let tokenOwner = await hommItems.ownerOf(tokenId);

      expect(0).to.be.equal(balanceOfBob);
      expect(1).to.be.equal(balanceOfAlice);
      expect(aliceAddress).to.be.equal(tokenOwner);

      const transferTx: any = await hommItems.transferFrom(aliceAddress, bobAddress, tokenId);
      const transferTxReceipt: any = await transferTx.wait();

      expect(2, transferTxReceipt.events.length)
      assertApprovalEvent(transferTxReceipt.events[0], aliceAddress, ethers.constants.AddressZero, tokenId);
      assertTransferEvent(transferTxReceipt.events[1], aliceAddress, bobAddress, tokenId);
      
      balanceOfBob = await hommItems.balanceOf(bobAddress);
      balanceOfAlice = await hommItems.balanceOf(aliceAddress);
      tokenOwner = await hommItems.ownerOf(tokenId);

      expect(1).to.be.equal(balanceOfBob);
      expect(0).to.be.equal(balanceOfAlice);
      expect(bobAddress).to.be.equal(tokenOwner);
    });

    it("Should allow to transfer approved token", async function () {
      const tokenId: number = 0;
      const aliceAddress: string = await alice.getAddress();
      const bobAddress: string = await bob.getAddress();

      let balanceOfBob = await hommItems.balanceOf(bobAddress);
      let balanceOfAlice = await hommItems.balanceOf(aliceAddress);
      let tokenOwner = await hommItems.ownerOf(tokenId);

      expect(0).to.be.equal(balanceOfBob);
      expect(1).to.be.equal(balanceOfAlice);
      expect(aliceAddress).to.be.equal(tokenOwner);

      const approveTx: any = await hommItems.approve(bobAddress, tokenId);
      const approveTxReceipt: any = await approveTx.wait();

      expect(1, approveTxReceipt.events.length)
      assertApprovalEvent(approveTxReceipt.events[0], aliceAddress, bobAddress, tokenId);

      const transferTx: any = await hommItems.connect(bob).transferFrom(aliceAddress, bobAddress, tokenId);
      const transferTxReceipt: any = await transferTx.wait();

      expect(2, transferTxReceipt.events.length)
      assertApprovalEvent(transferTxReceipt.events[0], aliceAddress, ethers.constants.AddressZero, tokenId);
      assertTransferEvent(transferTxReceipt.events[1], aliceAddress, bobAddress, tokenId);
      
      balanceOfBob = await hommItems.balanceOf(bobAddress);
      balanceOfAlice = await hommItems.balanceOf(aliceAddress);
      tokenOwner = await hommItems.ownerOf(tokenId);

      expect(1).to.be.equal(balanceOfBob);
      expect(0).to.be.equal(balanceOfAlice);
      expect(bobAddress).to.be.equal(tokenOwner);
    });

    it("Should not allow to transfer unapproved token", async function () {
      const tokenId: number = 0;
      const aliceAddress: string = await alice.getAddress();
      const bobAddress: string = await bob.getAddress();

      const transferTxPromise: any = hommItems.connect(bob).transferFrom(aliceAddress, bobAddress, tokenId);

      await expect(transferTxPromise)
        .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'ERC721: transfer caller is not owner nor approved'");
    });
  }); */

  describe("misc", async function() {
    it("Should construct a valid uri", async function() {
        const aliceAddress: string = await alice.getAddress();
        const artifactCID: string = "random";
        const expectedTokenId: number = 6;

        await hommItems.mintArtifact(aliceAddress, artifactCID);

        const isTokenExists: boolean = await hommItems.exists(expectedTokenId);
        expect(true).to.equal(isTokenExists);

        const tokenUri: string = await hommItems.uri(expectedTokenId);
        expect("https://random.ipfs.dweb.link").to.equal(tokenUri);
    });

    it("Should not allow to get uri for non-existent token", async function() {
        const tokenId: number = 6;
        const isTokenExists: boolean = await hommItems.exists(tokenId);
        expect(false).to.equal(isTokenExists);

        const uriTxPromise: Promise<any> =  hommItems.uri(tokenId);
        await expect(uriTxPromise).to.be.revertedWith("No token with such id");
    });

    it('Should correctly check supported interfaces', async function() {
      const ierc165Selector = extractSelector("supportsInterface(bytes4)");
      const ierc1155MetadataURISelector = extractSelector("uri(uint256)");
      const ierc1155Selector = extractSelector(
        "balanceOf(address,uint256)",
        "balanceOfBatch(address[],uint256[])",
        "setApprovalForAll(address,bool)",
        "isApprovedForAll(address,address)",
        "safeTransferFrom(address,address,uint256,uint256,bytes)",
        "safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)"
      );

      const supportsIERC165 = await hommItems.supportsInterface(ierc165Selector);
      const supportsIERC1155 = await hommItems.supportsInterface(ierc1155Selector);
      const supportsIERC1155MetadataURI = await hommItems.supportsInterface(ierc1155MetadataURISelector);

      expect(true).to.equal(supportsIERC165);
      expect(true).to.equal(supportsIERC1155);
      expect(true).to.equal(supportsIERC1155MetadataURI);
    });
  });
});
