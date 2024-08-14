import { useState } from "react";
import { BigIntInput } from "./forms/BigIntInput";
import SmartContractInput from "./SmartContractInput";
import TailInput from "./TailInput";

const DeployContract = () => {
  const [amountEth, setAmountEth] = useState<bigint>(0n);
  const [numersOfToken, setNumberOfTokens] = useState<number>(0);
  const [toAddress, setToAddress] = useState<`0x${string}`>("0x0");
  const [tail, setTail] = useState<string>("0x0");

  return (
    <div className="p-6 w-1/2  mx-auto bg-white rounded-xl shadow-md space-y-4">
      <div className="flex flex-col gap-1">
        <div className="flex flex-row gap-1 justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Deploy smart contract
          </h2>
        </div>
        <div>
          <label className="text-gray-700">To address:</label>
          <input
            type="text"
            className="bg-white border border-gray-300 rounded-md p-2 w-full text-gray-700"
            placeholder="0xFABB0ac9d68B0B445fB7357272Ff202C5651694a"
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
        <div>
          <TailInput setTail={setTail} tail={tail} />
        </div>
        <div>
          <SmartContractInput
            tail={tail}
            amountEth={amountEth}
            numersOfToken={numersOfToken}
            toAddress={toAddress}
          />
        </div>
      </div>
    </div>
  );
};

export default DeployContract;
