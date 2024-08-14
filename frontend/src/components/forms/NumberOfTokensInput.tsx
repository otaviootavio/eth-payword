import React, { FC } from "react";

interface NumberOfTokensInputProps {
  setNumberOfTokens: React.Dispatch<React.SetStateAction<number>>;
}

const NumberOfTokensInput: FC<NumberOfTokensInputProps> = ({
  setNumberOfTokens,
}) => {
  return (
    <input
      type="number"
      className="border border-gray-300 rounded p-2"
      placeholder="Number of Tokens"
      onChange={(e) => setNumberOfTokens(Number(e.target.value))}
    />
  );
};

export default NumberOfTokensInput;
