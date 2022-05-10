const path = require("path");

const dotenv = require('dotenv');
dotenv.config();

const HDWalletProvider = require('@truffle/hdwallet-provider');

MNENOMIC = "defy doctor situate young cigar onion know banner sign bench jazz feel";
INFURA_API_KEY = "330029b4b3db43a0a763d11f3f29337e";


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
      host: "127.0.0.1", // Localhost (default: none)
      port: 7545, // Standard Ethereum port (default: none)
      network_id: '*'// Any network (default: none)
    },
    ropsten: {
      provider: () => new HDWalletProvider(MNENOMIC, `https://ropsten.infura.io/v3/${INFURA_API_KEY}`),
      network_id: 3,
      gas: 4612388
    },
  }
};
