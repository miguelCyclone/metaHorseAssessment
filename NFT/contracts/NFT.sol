// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

//import "@openzeppelin/contracts/access/Ownable.sol";

contract MetaHorseNFT is ERC721, ERC721URIStorage, ERC721Burnable {
    constructor() ERC721("MetaHorse", "METH") {}

    // Map the user title with the NFT uint ID
    mapping(string titles => uint256) public titles;

    // Custom error, title can only be used one time
    error TitleAlreadyUsed(string title);

    // Custom error, tokenId cannot be 0
    error tokenIdPositive();

    function safeMint(
        address to,
        uint256 tokenId,
        string memory uri,
        string memory title
    ) public {

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Check Token ID is not 0
        if (tokenId == 0){
            revert tokenIdPositive({});
        }

        // Check Token title has not been used
        if (titles[title] != 0) {
            revert TitleAlreadyUsed({title: title});
        }

        // Add token title to the list
        titles[title] = tokenId;
    }

    function getName() public view returns (string memory) {
        return name();
    }

    function getSymbol() public view returns (string memory) {
        return symbol();
    }

    function getOwnerOf(uint256 tokenId) public view returns (address) {
        return _ownerOf(tokenId);
    }

    function getBalances(address owner) public view returns (uint256) {
        return balanceOf(owner);
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
