import React, { FC } from "react";

interface ToAddressInputProps {
  setToAddress: React.Dispatch<React.SetStateAction<`0x${string}`>>;
}

const ToAddressInput: FC<ToAddressInputProps> = ({ setToAddress }) => {
  return (
    <input
      type="text"
      className="border border-gray-300 rounded p-2"
      placeholder="To Address"
      onChange={(e) => setToAddress(e.target.value as `0x${string}`)}
    />
  );
};

export default ToAddressInput;
