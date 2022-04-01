// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <=0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

/**
 * @notice Represents a single collection
 */
contract BeautifulImage is ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private tokenIdGenerator;

    /**
     * @dev Link to Contract metadata https://docs.opensea.io/docs/contract-level-metadata
     */
    string public contractURI;
    string public baseURI;

    constructor(string memory _contractURI, string memory _baseURI) public ERC721("BeautifulImage", "BI") {
        contractURI = _contractURI;
        baseURI = _baseURI;
    }

     /**
      * @notice Mints a new token with the `tokenCID` to the `to` address
      * @param to is the recipient address
      * @param tokenCID is the content identifier of a token's metadata
      */
    function mint(address to, string memory tokenCID) public onlyOwner {
        _safeMint(to, tokenIdGenerator.current());
        _setTokenURI(tokenIdGenerator.current(), tokenCID);
        tokenIdGenerator.increment();
    }

    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns the Uniform Resource Identifier (URI) for `tokenId` token.
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function _baseURI() internal override view virtual returns (string memory) {
        return baseURI;
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}
