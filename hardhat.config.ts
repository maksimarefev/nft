import "dotenv/config";
import "./tasks/beautifulImageMint.ts";
import "./tasks/hommItemsMintGold.ts";
import "./tasks/hommItemsMintWood.ts";
import "./tasks/hommItemsMintMercury.ts";
import "./tasks/hommItemsMintGoldWoodAndMercury.ts";
import "./tasks/hommItemsMintArtifact.ts";
import "./tasks/hommItemsMintManyArtifacts.ts";
import "solidity-coverage";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import { HardhatUserConfig } from "hardhat/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_API_KEY = process.env.INFURA_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
    solidity: "0.8.1",
    networks: {
        rinkeby: {
          url: "https://rinkeby.infura.io/v3/" + INFURA_API_KEY,
          accounts: [`0x${PRIVATE_KEY}`]
        },
        kovan: {
            url: "https://kovan.infura.io/v3/" + INFURA_API_KEY,
            accounts: [`0x${PRIVATE_KEY}`]
        }
    },
    etherscan: {
        apiKey: {
          rinkeby: ETHERSCAN_API_KEY,
          kovan: ETHERSCAN_API_KEY
        }
    }
};

export default config;