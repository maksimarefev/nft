## Overview
### BeautifulImage contract
The implementation of the ERC721 standard.
### HOMMItems
The implementation of the ERC1155 standard.</br>
Tracks items from Heroes of Might and Magic game: gold, wood, mercury and artifacts</br>
Gold, wood and mercury are fungible tokens, whereas artifacts are non-fungible tokens</br>
The contract initially mints 10000 of gold, 20 of wood and 10 of mercury tokens</br>
The contract initially mints 3 artifacts: the Hellstorm Helmet, the Sentinel's Shield and the Sword of Judgement</br>
Token ids and their metadata CIDs:</br>
* GOLD => 0, bafybeic63dqdspawn3zbc7lzrfavf3ngxjl4uy7gr2anfqw7jyflmzmatu
* WOOD => 1, bafybeifupplppw2p7raij74uqxfougfjcbzxlrtxyf2xk2x5wn5oxcvsiy
* MERCURY => 2, bafybeibpzywcqtyvp2hphwbuo6cu4qosiqdi3g7ogtyrptwuuvlstx4g6u
* Hellstorm Helmet => 3, bafybeibht3aprjazvp6muep6bq3ecimwwspnh2szgx5vxoowfericgytce
* Sentinel's Shield => 4, bafybeibjveyhohvlfbojphsghayammwft4u3k25vobxouzpmwturhnnhyy
* Sword of Judgement => 5, bafybeifrn4kfsgpcjpziw7jnil64syjbhoeadc5c2d3gxe5kfw6x3khnsq

## Configuring a secret
In the root folder create *.env* file and fill it the following properties:<br/>
```
{
    INFURA_API_KEY=[INFURA API KEY]
    PRIVATE_KEY=[YOUR ACCOUNT's PRIVATE KEY]
}
```

## How to deploy the BeautifulImage contract
1. From the root folder run ``` npx hardhat run --network rinkeby scripts/deploy_beautifulimage.ts ```
2. Save the contract address for future interactions

## How to deploy the HOMMItems contract
1. From the root folder run ``` npx hardhat run --network rinkeby scripts/deploy_hommitems.ts ```
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
| Task name              | Description                                                                                                   | Options                                                                                                                                                                                                                             |
|------------------------|---------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| mint                   | Mints a new token with the `tokenIdentifier` to the `to` address                                              | --contract-address => An address of a contract; --to => The recipient address; --tokenIdentifier => The content identifier of a token's metadata                                                                                    |
| mintGold               | Mints the `amount` of gold (id == 0) to the `to` address                                                      | --contract-address => An address of a contract; --amount => The amount of gold to mint; --to The recipient address                                                                                                                  |
| mintWood               | Mints the `amount` of wood (id == 1) to the `to` address                                                      | --contract-address => An address of a contract; --amount => The amount of wood to mint; --to The recipient address                                                                                                                  |
| mintMercury            | Mints the `amount` of mercury (id == 2) to the `to` address                                                   | --contract-address => An address of a contract; --amount => The amount of mercury to mint; --to The recipient address                                                                                                               |
| mintArtifact           | Mints a new artifact with the `metadataCID` CID to the `to` address                                           | --contract-address => An address of a contract; --metadata-identifier => The file CIDv1; --to => The recipient address                                                                                                              |
| mintManyArtifacts      | Mints a bunch of new artifacts with the `metadataCIDs` to the `to` address                                    | --contract-address => An address of a contract; --metadata-identifiers => The artifacts metadata CIDs of v1; --to => The recipient address                                                                                          |
| mintGoldWoodAndMercury | Mints the `amountOfGold` (id == 0), `amountOfWood` (id == 1), `amountOfMercury` (id == 2) to the `to` address | --contract-address => An address of a contract; --amount-of-gold => The amount of gold to mint; --amount-of-mercury => The amount of mercury to mint; --amount-of-wood => The amount of wood to mint; --to => The recipient address |

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
      √ Should allow for owner to mint tokens (79ms)
      √ Should not allow for non-owner to mint tokens
      √ Should not allow minting to the zero address
    burning
      √ Should not allow to burn non-belonging tokens
      √ Should allow to burn belonging tokens (49ms)
    transfer
      √ Should allow to transfer belonging token (98ms)
      √ Should allow to transfer approved token (113ms)
      √ Should not allow to transfer unapproved token
    misc
      √ Should correctly check supported interfaces (67ms)
      √ Should return valid token owner (50ms)
      √ Should not allow to find owner for a non-existent token

HOMMItems
    minting
      √ Should allow for owner to mint gold
      √ Should allow for owner to mint wood
      √ Should allow for owner to mint mercury
      √ Should allow for owner to mint artifact
      √ Should allow for owner to mint many artifacts (94ms)
      √ Should allow for owner to mint gold, wood and mercury (206ms)
      √ Should not allow for non-owner to mint gold
      √ Should not allow for non-owner to mint wood
      √ Should not allow for non-owner to mint mercury
      √ Should not allow for non-owner to mint gold, wood and mercury
      √ Should allow for non-owner to mint many artifacts
      √ Should not allow for non-owner to mint artifact
      √ Should not allow minting gold to the zero address
      √ Should not allow minting wood to the zero address
      √ Should not allow minting mercury to the zero address
      √ Should not allow minting artifact to the zero address
      √ Should not allow minting many artifact to the zero address (46ms)
      √ Should not allow minting gold, wood and mercury to the zero address
      √ Should not allow to mint with empty metadataCID
      √ Should not allow to mint with empty metadataCIDs names
      √ Should not allow to mint with empty metadataCIDs array
    burning
      √ Should allow to burn belonging tokens (66ms)
      √ Should not allow to burn non-belonging tokens
      √ Should allow to burn approved tokens (96ms)
    transfer
      √ Should allow to transfer belonging token (66ms)
      √ Should allow to transfer approved token (94ms)
      √ Should not allow to transfer unapproved token
    misc
      √ Should construct a valid uri (68ms)
      √ Should not allow to get uri for non-existent token
      √ Should correctly check supported interfaces (49ms)
```
| File                  | % Stmts    | % Branch   | % Funcs    | % Lines    | Uncovered Lines  |
|-----------------------|------------|------------|------------|------------|------------------|
| contracts\            | 100        | 100        | 100        | 100        |                  |
| BeautifulImage.sol    | 100        | 100        | 100        | 100        |                  |
| HOMMItems.sol         | 100        | 100        | 100        | 100        |                  |
| --------------------- | ---------- | ---------- | ---------- | ---------- | ---------------- |
| All files             | 100        | 100        | 100        | 100        |                  |
| --------------------- | ---------- | ---------- | ---------- | ---------- | ---------------- |

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