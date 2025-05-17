const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("NFT MetaHorse", function () {
    
    // Constants for the test
    const metaHorseName = "MetaHorse"
    const metaHorseSymbol = "METH"
    const AliceAddress = "0xDFeA3AA339836650a6BCC7B64720aBA82EE5cafb"
    const tokenIdAlice = "123"
    const tokenTitleAlice = "FireHorse"
    const tokenUriAlice = "www.veryNiceUri.com"
    
    // deployed Smart Contract variable to be reused
    let nft
    
    // Fixture to dpeloy the NFT
    async function deployNFT() {
        const NFT = await ethers.getContractFactory("MetaHorseNFT");
        const nft = await NFT.deploy();
        return nft;
    }

    describe("Deployment", function () {
        it("Should deploy", async function () {
            nft = await loadFixture(deployNFT);

            const nftName = await nft.getName()
            const nftSymbol = await nft.getSymbol()

            expect(nftName).to.equal(metaHorseName);
            expect(nftSymbol).to.equal(metaHorseSymbol);
        });
    });

    describe("Mint - Anyone can mint", function () {
        it("Alice balance shall be 0", async function () {

            const aliceBalance = await nft.getBalances(AliceAddress)
            expect(aliceBalance).to.equal(0);
        });

        it("Should mint with user URI and title", async function () {

            const nftAlice = await nft.safeMint(AliceAddress, tokenIdAlice, tokenUriAlice, tokenTitleAlice)

            const nftOwnerCheck = await nft.getOwnerOf(tokenIdAlice)
            const nftIdChek = await nft.titles(tokenTitleAlice)

            expect(AliceAddress).to.equal(nftOwnerCheck);
            expect(tokenIdAlice).to.equal(nftIdChek);
        });

        it("Alice balance shall be 1", async function () {

            const aliceBalance = await nft.getBalances(AliceAddress)
            expect(aliceBalance).to.equal(1);
        });
    });

    describe("Mint - Shall fail", function () {
        it("Mint should fail with token ID already used", async function () {

            await expect(nft.safeMint(AliceAddress, tokenIdAlice, tokenUriAlice, tokenTitleAlice)).to.be.revertedWithCustomError(
                nft,
                'ERC721InvalidSender'
            );
            
            const aliceBalance = await nft.getBalances(AliceAddress)
            expect(aliceBalance).to.equal(1);
        });

        it("Mint should fail with token title already used", async function () {

            await expect(nft.safeMint(AliceAddress, 909, tokenUriAlice, tokenTitleAlice)).to.be.revertedWithCustomError(
                nft,
                'TitleAlreadyUsed'
            );
            
            const aliceBalance = await nft.getBalances(AliceAddress)
            expect(aliceBalance).to.equal(1);
        });

        it("Mint should fail with tokenID to 0", async function () {

            await expect(nft.safeMint(AliceAddress, 0, tokenUriAlice, tokenTitleAlice)).to.be.revertedWithCustomError(
                nft,
                'tokenIdPositive'
            );
            
            const aliceBalance = await nft.getBalances(AliceAddress)
            expect(aliceBalance).to.equal(1);
        });
    });
});
