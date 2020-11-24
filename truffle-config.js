const path = require("path");

const dotenv = require('dotenv');
dotenv.config();

const HDWalletProvider = require('@truffle/hdwallet-provider');

const infuraKey = process.env.INFURA_KEY;

const mnemonic = process.env.MNEMONIC_KEY;


module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  compilers: {
    solc: {
      version: "0.6.12",
    }
  },
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 7545
    },
    goerli: {
      provider: () => new HDWalletProvider(mnemonic, `https://goerli.infura.io/v3/${infuraKey}`),
      network_id: 5,       // Görli's id
      gas: 5500000,
    },
  }
};
