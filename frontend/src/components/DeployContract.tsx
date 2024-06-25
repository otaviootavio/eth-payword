import { useState } from "react";
import { BigIntInput } from "./forms/BigIntInput";

const DeployContract = () => {
  const [bigIntValue, setBigIntValue] = useState<bigint>(0n);

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
        />
      </div>
      <div>
        <label className="text-gray-700">Amount of ETH:</label>
        <BigIntInput onBigIntChange={setBigIntValue} />
      </div>
      <div>
        <label className="text-gray-700">Number of tokens</label>
        <input
          type="number"
          className="bg-white border border-gray-300 rounded-md p-2 w-full text-gray-700"
          placeholder="Binary Validator"
        />
      </div>
      <button
        type="button"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
      >
        Deploy!
      </button>
    </div>
  );
};

export default DeployContract;
