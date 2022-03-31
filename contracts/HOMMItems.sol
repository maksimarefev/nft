// SPDX License Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

//todo arefev: add docs
//todo arefev: add safeMint functions
//todo arefev: add mintBatch functions
//todo arefev: add instruction for uploading to readme
/**
 * @notice Represents some items from Heroes of Might and Magic III
 */
contract HOMMItems is ERC1155, ERC1155Holder, ERC1155Supply, ERC1155Burnable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private tokenIdGenerator;

    //resources are fungible
    uint256 private constant GOLD = 0;
    uint256 private constant WOOD = 1;
    uint256 private constant MERCURY = 2;

    //bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354 => CIDv1 of the folder
    string private baseURI = "https://bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354.ipfs.dweb.link/";

    mapping(uint256 => string) private tokenIdToUri;

    constructor() ERC1155(baseURI) {
        //artifacts are non-fungible
        uint256 HELLSTORM_HELMET = 3;
        uint256 SENTINELS_SHIELD = 4;
        uint256 SWORD_OF_JUDGEMENT = 5;

        tokenIdToUri[GOLD] = _makeUri("gold.json");
        tokenIdToUri[WOOD] = _makeUri("wood.json");
        tokenIdToUri[MERCURY] = _makeUri("mercury.json");

        tokenIdToUri[HELLSTORM_HELMET] = _makeUri("hellstorm_helmet.json");
        tokenIdToUri[SENTINELS_SHIELD] = _makeUri("sentinels_shield.json");
        tokenIdToUri[SWORD_OF_JUDGEMENT] = _makeUri("sword_of_judgement.json");

        _mint(to, GOLD, 10000, "");
        _mint(to, WOOD, 20, "");
        _mint(to, MERCURY, 10, "");

        _mint(to, HELLSTORM_HELMET, 1, "");
        _mint(to, SENTINELS_SHIELD, 1, "");
        _mint(to, SWORD_OF_JUDGEMENT, 1, "");

        //gonna shift the counter because we have already minted 6 items
        for (uint8 i = 0; i < 5; i++) {
            tokenIdGenerator.increment();
        }
    }

    function mintGold(address to, uint256 amount) external onlyOwner {
        _mint(to, GOLD, amount, "");
    }

    function mintWood(address to, uint256 amount) external onlyOwner {
        _mint(to, WOOD, amount, "");
    }

    function mintMercury(address to, uint256 amount) external onlyOwner {
        _mint(to, MERCURY, amount, "");
    }

    /**
     * @notice mints a new artifact
     * @param to is the owner of artifact
     * @param metadataFile is the file name put inside the bafybeiczsscdsbs7ffqz55asqdf3smv6klcw3gofszvwlyarci47bgf354 folder
     */
    function mintArtifact(address to, string memory metadataFile) external onlyOwner {
        tokenIdGenerator.increment();
        _mint(to, tokenIdGenerator.current(), 1, "");
        tokenIdToUri[tokenIdGenerator.current()] = _makeUri(metadataFile);
    }

    function uri(uint256 tokenId) override public view returns (string memory) {
        require(_uris[tokenId] != 0, "No token with such id");
        return (_uris[tokenId]);
    }

    function _makeUri(string memory metadatFile) internal returns (string memory) {
        return string(bytes.concat(bytes(baseURI), bytes(metadatFile)));
    }
}
