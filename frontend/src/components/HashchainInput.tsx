import React, { useState } from "react";

interface HashchainInputProps {
  fullHashChain: string[];
  setBigIntValue: React.Dispatch<React.SetStateAction<bigint>>;
  setHexValue: React.Dispatch<React.SetStateAction<string>>;
}

const HashchainInput: React.FC<HashchainInputProps> = ({
  fullHashChain,
  setBigIntValue,
  setHexValue,
}) => {
  const [hashIndex, setHashIndex] = useState<number>(100);
  const [hashItem, setHashItem] = useState<string>("");

  return (
    <>
      <label className="text-gray-700">Hashchain Index</label>
      <div className="flex flex-row gap-2 justify-between items-center">
        <div className="grow">
          <input
            type="number"
            className={`bg-white border rounded-md p-2 w-full text-gray-700 `}
            placeholder="Enter hashchain index"
            onChange={(e) => {
              setHashItem(fullHashChain[e.target.valueAsNumber - 1]);
              setHashIndex(
                fullHashChain.indexOf(fullHashChain[e.target.valueAsNumber]),
              );
              setBigIntValue(
                BigInt(fullHashChain.length - e.target.valueAsNumber - 1),
              );
              setHexValue(fullHashChain[e.target.valueAsNumber]);
              console.log(fullHashChain.length - e.target.valueAsNumber - 1);
              console.log(fullHashChain[e.target.valueAsNumber]);
            }}
            value={hashIndex}
          />
        </div>
      </div>

      <label className="text-gray-700">Hashchain Item</label>
      <div className="flex flex-row gap-2 justify-between items-center">
        <div className="grow">
          <input
            type="text"
            className={`bg-white border text-gray-800 rounded-md p-2 w-full}`}
            placeholder="0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
            value={hashItem}
          />
        </div>
      </div>
    </>
  );
};

export default HashchainInput;
