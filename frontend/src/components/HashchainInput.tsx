import React, { useState } from "react";
import { z } from "zod";
import { useHashChain } from "../contexts/wallet/HashChainExtensionProvider";

// Schema to validate a hexadecimal hash string
const hashSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "Invalid hexadecimal hash");

// Schema to validate a bigint
const indexSchema = z.bigint().refine((value) => value >= 0n, {
  message: "Index must be a non-negative bigint",
});

interface HashchainInputProps {
  setHashchainIndex: (value: bigint) => void;
  setHashchainItem: (value: string) => void;
  hashchainIndex: bigint;
  hashchainItem: string;
}

const HashchainInput: React.FC<HashchainInputProps> = ({
  setHashchainIndex,
  setHashchainItem,
  hashchainIndex,
  hashchainItem,
}) => {
  const { sendH100Once, h100 } = useHashChain();
  const [errorIndex, setErrorIndex] = useState<string>("");
  const [errorHash, setErrorHash] = useState<string>("");

  const handleIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    try {
      const parsedValue = BigInt(newValue);
      indexSchema.parse(parsedValue);
      setErrorIndex("");
      setHashchainIndex(parsedValue);
    } catch (e: any) {
      setErrorIndex(e.errors[0].message);
    }
  };

  const handleHashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setHashchainItem(newValue);

    try {
      hashSchema.parse(newValue);
      setErrorHash("");
      setHashchainItem(newValue);
    } catch (e: any) {
      setErrorHash(e.errors[0].message);
    }
  };

  const handleFetchFromWallet = () => {
    sendH100Once();
    if (h100) {
      try {
        hashSchema.parse(h100);
        setErrorHash("");
        setHashchainItem(h100);
      } catch (e: any) {
        setErrorHash(e.errors[0].message);
      }
    }
  };

  return (
    <>
      <label className="text-gray-700">Hashchain Index</label>
      <div className="flex flex-row gap-2 justify-between items-center">
        <div className="grow">
          <input
            type="text"
            className={`bg-white border rounded-md p-2 w-full text-gray-700 ${errorIndex ? "border-red-500" : "border-gray-300"}`}
            placeholder="Enter hashchain index"
            value={hashchainIndex.toString()}
            onChange={handleIndexChange}
          />
        </div>
      </div>
      {errorIndex && <p className="text-red-500 text-sm mt-1">{errorIndex}</p>}

      <label className="text-gray-700">Hashchain Item</label>
      <div className="flex flex-row gap-2 justify-between items-center">
        <div className="grow">
          <input
            type="text"
            className={`bg-white border rounded-md p-2 w-full text-gray-700 ${errorHash ? "border-red-500" : "border-gray-300"}`}
            placeholder="0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
            value={hashchainItem}
            onChange={handleHashChange}
          />
        </div>
      </div>
      {errorHash && <p className="text-red-500 text-sm mt-1">{errorHash}</p>}
    </>
  );
};

export default HashchainInput;
