import { useState } from "react";
import ContractInfo from "./ContractInfo";
import { type Address } from "viem";
import { CloseChannel } from "./forms/CloseChannel";

const QuerySmartContract = () => {
  const [address, setAddress] = useState<Address>();

  return (
    <div className="p-6 w-1/2 mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">
        Enter Contract Address
      </h1>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value as `0x${string}`)}
        className="w-full p-2 border border-gray-300 rounded text-gray-900"
        placeholder="Enter contract address"
      />
      {address && (
        <>
          <ContractInfo address={address} /> <CloseChannel address={address} />
        </>
      )}
    </div>
  );
};

export default QuerySmartContract;
