import { useState } from "react";
import { BigIntInput } from "./forms/BigIntInput";
import SmartContractInput from "./SmartContractInput";

const DeployContract = () => {
  const [amountEth, setAmountEth] = useState<bigint>(0n);
  const [numersOfToken, setNumberOfTokens] = useState<number>(0);
  const [toAddress, setToAddress] = useState<`0x${string}`>("0x0");

  return (
    <div className="p-6 w-1/2  mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">
        Deploy smart contract
      </h2>
      <div>
        <label className="text-gray-700">To address:</label>
        <input
          type="text"
          className="bg-white border border-gray-300 rounded-md p-2 w-full text-gray-700"
          placeholder="0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
          onChange={(e) => setToAddress(e.target.value as `0x${string}`)}
        />
      </div>
      <div>
        <label className="text-gray-700">Amount of ETH:</label>
        <BigIntInput onBigIntChange={setAmountEth} />
      </div>
      <div>
        <label className="text-gray-700">Number of tokens</label>
        <input
          type="number"
          className="bg-white border border-gray-300 rounded-md p-2 w-full text-gray-700"
          placeholder="Binary Validator"
          onChange={(e) => setNumberOfTokens(Number(e.target.value))}
        />
      </div>

      <SmartContractInput
        amountEth={amountEth}
        numersOfToken={numersOfToken}
        toAddress={toAddress}
      />
    </div>
  );
};

export default DeployContract;
