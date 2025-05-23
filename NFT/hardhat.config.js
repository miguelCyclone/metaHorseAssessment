const ck = require('ckey');
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    polygonAmoy: {
      url: process.env.polygonAmoyURL,
      chainId: 80002,
      accounts: {
        mnemonic: process.env.seedPhrase,
      },
      gasPrice: 35000000000
    },
  }
};
