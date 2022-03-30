## Configuring a secret
In the root folder create *.env* file and fill it the following properties:<br/>
```
{
    INFURA_API_KEY=[INFURA API KEY]
    PRIVATE_KEY=[YOUR ACCOUNT's PRIVATE KEY]
}
```

## How to deploy the contract
1. From the root folder run ``` npx hardhat run --network rinkeby scripts/deploy.ts ```
2. Save the contract address for future interactions

## How to verify the contract
1. Add the following property to the *.env* file:<br/>
```
    ETHERSCAN_API_KEY=[YOUR ETHERSCAN APY KEY]
```
2. From the root folder run ``` npx hardhat verify --network rinkeby [contract address] [arguments separated by space] ```

## How to run a task
From the root folder run<br/>``` npx hardhat [task name] --network rinkeby --contract-address [contract address] --argument [argument value] ```<br/>Example:<br/>``` npx hardhat mint --network rinkeby --contract-address 0x7ce781adf55e0ebd1162e2165d95b3d56579f2b1 --to 0x12D8F31923Aa0ACC543b96733Bc0ed348Ef44970 --token-identifier QmRJUWeoTfKxfDpqfLQ2umUdEYNgxA6sNwAZcXn8Y94bVh ```

## The list of available tasks
| Task name | Description                                                      | Options                                                                                                                                          |
|-----------|------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| mint      | Mints a new token with the `tokenIdentifier` to the `to` address | --contract-address => An address of a contract; --to => The recipient address; --tokenIdentifier => The content identifier of a token's metadata |

## How to run tests and evaluate the coverage
From the root folder run ``` npx hardhat coverage ```
## Current test and coverage results for *i7-8550U 1.80GHz/16Gb RAM/WIN10 x64*
```
BeautifulImage
    metadata
      √ Should return the valid symbol
      √ Should return the valid name
      √ Should return the valid tokenURI (75ms)
      √ Should return the valid contract URI
      √ Should return the valid base URI
    minting
      √ Should allow for owner to mint tokens (87ms)
      √ Should not allow for non-owner to mint tokens (38ms)
      √ Should not allow minting to the zero address
    burning
      √ Should not allow to burn non-belonging tokens
      √ Should allow to burn belonging tokens (52ms)
    transfer
      √ Should allow to transfer belonging token (96ms)
      √ Should allow to transfer approved token (129ms)
      √ Should not allow to transfer unapproved token
    misc
      √ Should correctly check supported interfaces (62ms)
      √ Should return valid token owner (52ms)
      √ Should not allow to find owner for a non-existent toke
```
| File                  | % Stmts    | % Branch   | % Funcs    | % Lines    | Uncovered Lines  |
|-----------------------|------------|------------|------------|------------|------------------|
| contracts\            | 100        | 100        | 100        | 100        |                  |
| BeautifulImage.sol    | 100        | 100        | 100        | 100        |                  |
| --------------------- | ---------- | ---------- | ---------- | ---------- | ---------------- |
| All files             | 100        | 100        | 100        | 100        |                  |

## Project dependencies
* @nomiclabs/ethereumjs-vm#4.2.2",
* @nomiclabs/hardhat-ethers#2.0.5",
* @nomiclabs/hardhat-etherscan#3.0.3",
* @nomiclabs/hardhat-waffle#2.0.3",
* @nomiclabs/hardhat-web3#2.0.0",
* @openzeppelin/contracts#4.5.0",
* @typechain/ethers-v5#10.0.0",
* @typechain/hardhat#6.0.0",
* @types/chai#4.3.0",
* @types/mocha#9.1.0",
* @types/node#17.0.23",
* chai#4.3.6",
* dotenv#16.0.0",
* ethereum-waffle#3.4.4",
* hardhat#2.9.2",
* solhint#3.3.7",
* solidity-coverage#0.7.20",
* ts-node#10.7.0",
* typechain#8.0.0",
* typescript#4.6.3"
* @typescript-eslint/eslint-plugin#5.16.0",
* @typescript-eslint/parser#5.16.0",
* eslint#8.12.0"