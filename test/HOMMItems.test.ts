import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, Event, BigNumber } from "ethers";
import { HOMMItems, HOMMItems__factory } from '../typechain-types';

/*todo arefev: create test cases
    events:
        TransferBatch
        TransferSingle
        ApprovalForAll
        URI

    functions:
        mintGold
        mintWood
        mintMercury
        mintGoldWoodAndMercury
        mintArtifact
        mintManyArtifacts
        supportsInterface
        uri

        balanceOf
        balanceOfBatch
        setApprovalForAll
        isApprovedForAll
        safeTransferFrom
        safeBatchTransferFrom

        totalSupply
        exists

        burn
        burnBatch
    scenarios:
        //function setApprovalForAll(address operator, bool approved) external;
         transfer:
         //function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data)
         //function safeBatchTransferFrom(address from, address to, uint256[] calldata ids, uint256[] calldata amounts, bytes calldata data)
         supportsInterface:
         misc:
            test uri

*/
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
      //todo arefev: should i test the operator?
      expect("TransferSingle").to.equal(event.event);
      expect(from).to.equal(event.args.from);
      expect(to).to.equal(event.args.to);
      expect(value).to.equal(event.args.value.toNumber());
      expect(id).to.equal(event.args.id.toNumber());
  }

  function assertTransferBatchEvent(event: Event, from: string, to: string, ids: number[], values: number[]) {
      //todo arefev: should i test the operator?
      expect("TransferBatch").to.equal(event.event);
      expect(from).to.equal(event.args.from);
      expect(to).to.equal(event.args.to);
      //expect(values).to.eql(event.args.values.map(value => value.toNumber())); //todo arefev: why aren't value populated?
      expect(ids).to.eql(event.args.ids.map(id => id.toNumber()));
  }

  function assertApprovalForAllEvent(event: Event, operator: string, account: string, approved: boolean) {
      expect("ApprovalForAll").to.equal(event.event);
      expect(operator).to.equal(event.args.operator);
      expect(account).to.equal(event.args.account);
      expect(approved).to.equal(event.args.approved);
  }

  //todo arefev: create utils module
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

  /* describe("metadata", async function() {
    it("Should return the valid symbol", async function () {
        const expectedSymbol: string = "CTS";

        const actualSymbol: string = await hommItems.symbol();
        
        expect(expectedSymbol).to.equal(actualSymbol);
    });

    it("Should return the valid name", async function () {
        const expectedName: string = "Cats";

        const actualName: string = await hommItems.name();
        
        expect(expectedName).to.equal(actualName);
    });

    it("Should return the valid tokenURI", async function () {
      const expectedTokenId: number = 0;
      const itemURI: string = "random";
      const aliceAddress: string = await alice.getAddress();
      const baseURI: string = await hommItems.getBaseURI();

      const mintTx: any = await hommItems.mint(aliceAddress, itemURI);
      const mintTxReceipt: any = await mintTx.wait();

      expect(1, mintTxReceipt.events.length)
      assertTransferEvent(mintTxReceipt.events[0], ethers.constants.AddressZero, aliceAddress, expectedTokenId);

      const tokenURI: string = await hommItems.tokenURI(expectedTokenId);
      expect(baseURI + itemURI).to.equal(tokenURI);
    });

    it("Should return the valid contract URI", async function () {
      const actualContractURI = await hommItems.contractURI();

      expect(contractURI).to.be.equal(actualContractURI);
    });

    it("Should return the valid base URI", async function () {
      const actualBaseURI = await hommItems.getBaseURI();

      expect(baseURI).to.be.equal(actualBaseURI);
    });
  }); */

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

        const mintTx: any = await hommItems.mintArtifact(aliceAddress, metadataFile);
        const mintTxReceipt: any = await mintTx.wait();

        expect(1, mintTxReceipt.events.length);
        assertTransferSingleEvent(mintTxReceipt.events[0], ethers.constants.AddressZero, aliceAddress, expectedTokenId, 1);

        const theOwner: string = await hommItems.ownerOf(expectedTokenId);
        expect(aliceAddress).to.be.equal(theOwner);
    });

    it("Should allow for owner to mint many artifacts", async function () {
        const metadataFiles: string[] = ["random", "random"];
        const expectedTokenIds: number[] = [6, 7];
        const aliceAddress: string = await alice.getAddress();

        const mintTx: any = await hommItems.mintManyArtifacts(aliceAddress, metadataFiles);
        const mintTxReceipt: any = await mintTx.wait();

        expect(1, mintTxReceipt.events.length);
        assertTransferBatchEvent(
            mintTxReceipt.events[0], ethers.constants.AddressZero, aliceAddress, expectedTokenIds, [1, 1]
        );

        let theOwner: string = await hommItems.ownerOf(expectedTokenIds[0]);
        expect(aliceAddress).to.be.equal(theOwner);

        theOwner = await hommItems.ownerOf(expectedTokenIds[1]);
        expect(aliceAddress).to.be.equal(theOwner);
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
  });

    /*todo arefev
     burn(function burnBatch(address account, uint256[] memory ids, uint256[] memory values)):
        should allow to batch burn belonging tokens
        should not allow to batch burn non-belonging tokens
        should allow to batch burn approved tokens
     */
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

  /* describe("transfer", async function() {
    beforeEach("Minting a token for Alice", async function () {
      const tokenURI: string = "random";
      const aliceAddress: string = await alice.getAddress();

      await hommItems.mint(aliceAddress, tokenURI);
    });

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

  /* describe("misc", async function() {
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

      const supportsIERC165 = await hommItems.supportsInterface(ierc165Selector);
      const supportsIERC721Metadata = await hommItems.supportsInterface(ierc721MetadataSelector);
      const supportsIERC721Enumerable = await hommItems.supportsInterface(ierc721EnumerableSelector);
      const supportsIERC721 = await hommItems.supportsInterface(ierc721Selector);

      expect(supportsIERC165).to.equal(true);
      expect(supportsIERC721Metadata).to.equal(true);
      expect(supportsIERC721Enumerable).to.equal(true);
      expect(supportsIERC721).to.equal(true);
    });

    it('Should return valid token owner', async function() {
      const expectedTokenId: number = 0;
      const itemURI: string = "random";
      const aliceAddress: string = await alice.getAddress();

      await hommItems.mint(aliceAddress, itemURI);

      const tokenOwner = await hommItems.ownerOf(expectedTokenId);
      expect(aliceAddress).to.equal(tokenOwner);
    });

    it('Should not allow to find owner for a non-existent token', async function() {
      const nonExistentTokenId = 1;

      const ownerOfPromise: any = hommItems.ownerOf(nonExistentTokenId);

      await expect(ownerOfPromise).to.be.revertedWith("ERC721: owner query for nonexistent token");
    });
  }); */
});
