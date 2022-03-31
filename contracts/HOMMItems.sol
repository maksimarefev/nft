// SPDX License Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

/**
 * @notice Represents some items from Heroes of Might and Magic III
 */
contract HOMMItems is ERC1155Supply, ERC1155Burnable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private tokenIdGenerator;

    //resources are fungible
    uint256 private constant GOLD = 0;
    uint256 private constant WOOD = 1;
    uint256 private constant MERCURY = 2;

    mapping(uint256 => string) private tokenIdToUri;

    constructor() public ERC1155("") {
        //artifacts are non-fungible
        uint256 hellstormHelmet = 3;
        uint256 sentinelsShield = 4;
        uint256 swordOfJudgement = 5;

        tokenIdToUri[GOLD] = _makeUri("bafybeic63dqdspawn3zbc7lzrfavf3ngxjl4uy7gr2anfqw7jyflmzmatu");
        tokenIdToUri[WOOD] = _makeUri("bafybeifupplppw2p7raij74uqxfougfjcbzxlrtxyf2xk2x5wn5oxcvsiy");
        tokenIdToUri[MERCURY] = _makeUri("bafybeibpzywcqtyvp2hphwbuo6cu4qosiqdi3g7ogtyrptwuuvlstx4g6u");

        tokenIdToUri[hellstormHelmet] = _makeUri("bafybeibht3aprjazvp6muep6bq3ecimwwspnh2szgx5vxoowfericgytce");
        tokenIdToUri[sentinelsShield] = _makeUri("bafybeibjveyhohvlfbojphsghayammwft4u3k25vobxouzpmwturhnnhyy");
        tokenIdToUri[swordOfJudgement] = _makeUri("bafybeifrn4kfsgpcjpziw7jnil64syjbhoeadc5c2d3gxe5kfw6x3khnsq");

        address msgSender = msg.sender;

        _mint(msgSender, GOLD, 10000, "");
        _mint(msgSender, WOOD, 20, "");
        _mint(msgSender, MERCURY, 10, "");

        _mint(msgSender, hellstormHelmet, 1, "");
        _mint(msgSender, sentinelsShield, 1, "");
        _mint(msgSender, swordOfJudgement, 1, "");

        //gonna shift the counter because we have already minted 6 items
        for (uint8 i = 0; i < 5; i++) {
            tokenIdGenerator.increment();
        }
    }

    /**
     * @notice mints the `amount` of gold (id == 0) to the `to` address
     * @param to is the recipient
     * @param amount is the amount of gold to mint
     */
    function mintGold(address to, uint256 amount) public onlyOwner {
        _mint(to, GOLD, amount, "");
    }

    /**
     * @notice mints the `amount` of wood (id == 1) to the `to` address
     * @param to is the recipient
     * @param amount is the amount of wood to mint
     */
    function mintWood(address to, uint256 amount) public onlyOwner {
        _mint(to, WOOD, amount, "");
    }

    /**
     * @notice mints the `amount` of mercury (id == 2) to the `to` address
     * @param to is the recipient
     * @param amount is the amount of mercury to mint
     */
    function mintMercury(address to, uint256 amount) public onlyOwner {
        _mint(to, MERCURY, amount, "");
    }

    /**
     * @notice mints the `amountOfGold` (id == 0), `amountOfWood` (id == 1), `amountOfMercury` (id == 2) to the `to` address
     * @param to is the recipient
     * @param amountOfGold is the amount of gold to mint
     * @param amountOfWood is the amount of wood to mint
     * @param amountOfMercury is the amount of mercury to mint
     */
    function mintGoldWoodAndMercury(
        address to,
        uint256 amountOfGold,
        uint256 amountOfWood,
        uint256 amountOfMercury
    ) public onlyOwner {
        uint256[] memory ids = new uint256[](3);
        uint256[] memory amounts = new uint256[](3);

        ids[0] = GOLD;
        ids[1] = WOOD;
        ids[2] = MERCURY;

        amounts[0] = amountOfGold;
        amounts[1] = amountOfWood;
        amounts[2] = amountOfMercury;

        _mintBatch(to, ids, amounts, "");
    }

    /**
     * @notice mints a new artifact with the `metadataCID` CID to the `to` address
     * @param to is the owner of artifact
     * @param metadataCID is the file CIDv1
     */
    function mintArtifact(address to, string memory metadataCID) public onlyOwner {
        _requireNonEmpty(metadataCID, "metadataCID is empty");

        tokenIdGenerator.increment();
        _mint(to, tokenIdGenerator.current(), 1, "");
        tokenIdToUri[tokenIdGenerator.current()] = _makeUri(metadataCID);
    }

    /**
     * @notice mints a bunch of new artifacts with the `metadataCIDs` to the `to` address
     * @param to is the owner of artifacts
     * @param metadataCIDs are the files' CIDv1s
     */
    function mintManyArtifacts(address to, string[] memory metadataCIDs) public onlyOwner {
        uint256 metadataCIDsCount = metadataCIDs.length;
        require(metadataCIDsCount > 0, "metadataCIDs are empty");

        uint256[] memory ids = new uint256[](metadataCIDsCount);
        uint256[] memory amounts = new uint256[](metadataCIDsCount);

        for(uint8 i = 0; i < metadataCIDsCount; i++) {
            _requireNonEmpty(metadataCIDs[i], "metadataCID is empty");
            tokenIdGenerator.increment();
            ids[i] = tokenIdGenerator.current();
            amounts[i] = 1;
            tokenIdToUri[tokenIdGenerator.current()] = _makeUri(metadataCIDs[i]);
        }

        _mintBatch(to, ids, amounts, "");
    }

    /**
     * @notice returns the metadata uri for specified `tokenId`
     * @param tokenId is the token id
     * @return the metadata uri for specified `tokenId`
     */
    function uri(uint256 tokenId) override public view returns (string memory) {
        _requireNonEmpty(tokenIdToUri[tokenId], "No token with such id");
        return (tokenIdToUri[tokenId]);
    }

    function _makeUri(string memory metadatFile) internal pure returns (string memory) {
        return string(abi.encodePacked("https://", metadatFile, ".ipfs.dweb.link"));
    }

    function _requireNonEmpty(string memory target, string memory error) internal pure {
        require(bytes(target).length > 0, error);
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
