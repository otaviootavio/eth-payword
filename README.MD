## About this Project

dApp that supports `EthWord` payment, a micropayments channel.

## Frontend

```bash
├── index.html
├── package.json
├── README.md
├── src
│   ├── App.tsx          # Here is the file with the UI
│   ├── components
│   │   ├── [...]
│   ├── generated.ts     # Generated from wagmi-cli
│   ├── index.css
│   ├── main.tsx         # Main file, changes on it make changes on all components
│   ├── vite-env.d.ts
│   └── wagmi.ts         # wagmi config.ts file
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── wagmi.config.ts      # wagmi-cli config file
```

## Hardhat

The file system and the file names are self-explanatory.

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

### Local Development

First, ensure you are in the right folder:

```bash
cd hardhat
```

In one terminal, run the local blockchain:

```bash
npx hardhat node
```

In another terminal, deploy your contracts on the localhost network:

```bash
npx hardhat ignition deploy ignition/modules/EthWord.ts --network localhost
```

The output is the smart contract address. If you are using the Frontend, you need to manually set up this address in the `.env` file. The default first address of Hardhat is:

```
0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### API KEYS

In some cases, you will need to set up the `apikeys` in `hardhat/hardhat.config.ts`.

- `ALCHEMY_API_KEY` --> needed to deploy to any network
- `PRIVATE_KEY` --> needed to deploy to any network
- `COINMARKETCAP_API` --> needed to make the gas tests

To correctly set up these variables, use:

```
npx hardhat vars set ETHERSCAN_API_KEY
```

### Testing the Smart Contracts

## Measuring Gas and Code Coverage

The default configuration will always generate a report. This is configured in `hardhat.config.ts` to generate a JSON report:

```typescript
gasReporter: {
    enabled: true,
    currency: "USD",
    L1: "polygon",
    offline: false,
    // outputJSON: true,
    // outputJSONFile: "out.json",
}
```

To run tests and generate a gas report:

```bash
npx hardhat test
```

This outputs gas usage of each function in your smart contracts to the terminal. Some additional setup can be done, such as exporting the report to JSON.

## Script

The `run_test_and_collect_data.sh` script automates testing and capturing gas usage for various hash amounts in your smart contracts, saving the results to `gas_data.csv` for analysis. The script will iterate through predefined hash amounts, run the tests, and generate a CSV file (`gas_data.csv`) with the gas usage data.

### Prerequisites

- `jq` installed for JSON parsing

### Run the Script

```bash
./run_test_and_collect_data.sh
```
