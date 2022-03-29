// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <=0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol"; //todo arefev: use it
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol"; //todo arefev: use it
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

//todo arefev: should i include another metadata?
contract BeautifulImage is ERC721Enumerable, ERC721URIStorage, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;

    //todo arefev: make configurable?
    string private baseURI = "https://ipfs.io/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn/";
    Counters.Counter private tokenIdGenerator;

    /* solhint-disable no-empty-blocks */
    constructor() public ERC721("Cats", "CTS") {
    }
    /* solhint-enable no-empty-blocks */

     /**
      * @notice Mints a new token with the `itemURI` to the `to` address
      * @param to is the recepient address
      * @param itemURI is the token URI
      */
    function mint(address to, string memory itemURI) public onlyOwner {
        _safeMint(to, tokenIdGenerator.current());
        _setTokenURI(tokenIdGenerator.current(), itemURI);
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

    /**
     * @return base URI
     */
    function getBaseURI() public view returns (string memory) {
        return baseURI;
    }

    /**
     * @dev Link to Contract metadata https://docs.opensea.io/docs/contract-level-metadata
     */
    function contractURI() public pure returns (string memory) {
        return "https://arweave.net/WG3HOwfkrRJnT-GYln3Q5Q3kAUYhqH-0hJMEv5838AM"; //todo arefev: upload to ipfs
    }

    function _baseURI() internal override view virtual returns (string memory) {
        return "https://ipfs.io/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn/";
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}
