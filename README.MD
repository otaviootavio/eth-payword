## About this project

dApp that support `EthWord` payment, a micropayments channel.

## Frontend

```bash
├── index.html
├── package.json
├── README.md
├── src
│   ├── App.tsx // Here is the file with the UI
│   ├── components
|   ├── ├── [...]
│   ├── generated.ts // Generated from wagmi-cli
│   ├── index.css
│   ├── main.tsx // Main file, changes on it make changes on all components
│   ├── vite-env.d.ts
│   └── wagmi.ts // wagmi config.ts file
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── wagmi.config.ts // wagmi-cli config file
```

### Hardhat

The file system and the files names are self-explanatory

```bash
.
├── contracts
│   └── EthWord.sol
├── generate_json_for_plotting.sh
├── hardhat.config.ts
├── ignition
│   └── modules
│       └── EthWord.ts
├── package.json
├── package-lock.json
├── README.md
├── run_test_and_collect_data.sh
├── test
│   ├── ethword
│   │   ├── Channel.test.ts
│   │   ├── CloseChannel.test.ts
│   │   ├── Deploy.test.ts
│   │   ├── PartialClose.test.ts
│   │   └── User.test.ts
│   └── utils
│       └── deployEthWord.ts
└── tsconfig.json
```

#### Local development

First, ensure you are at the right folder

```bash
cd hardhat
```

In one terminal, run the local blockchain

```bash
npx hardhat node
```

In other terminal, deploy your contracts on the localhost network

```bash
npx hardhat ignition deploy ignition/modules/EthWord.ts --network localhost
```

The output is the smart contract address. If you are using the Frontend,
you need manually to set up this address at `.env`.
The default first address is of hardhat is

```
0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### API KEYS

In some cases, you will need to set up the `apikeys` at `hardhat/hardhat.config.ts`

`ALCHEMY_API_KEY` --> needed to deploy at any network

`PRIVATE_KEY` --> Needed to deploy on at any network

`COINMARKETCAP_API` --> Need to make the gas tests

To correctly set up these variables, use:

```
npx hardhat vars set ETHERSCAN_API_KEY
```
