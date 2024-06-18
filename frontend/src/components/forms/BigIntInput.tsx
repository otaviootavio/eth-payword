import { Dispatch, SetStateAction, useState } from "react";

export function BigIntInput({
  onBigIntChange,
}: {
  onBigIntChange: Dispatch<SetStateAction<bigint>>;
}) {
  const [value, setValue] = useState("");

  const handleChange = (e: { target: { value: any } }) => {
    const newValue = e.target.value;
    try {
      const bigIntValue = BigInt(newValue);
      onBigIntChange(bigIntValue);
      setValue(newValue);
    } catch (error) {
      console.error("Invalid BigInt value");
    }
  };

  return (
    <div className="w-full">
      <label>BigInt Input: </label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Enter a valid BigInt"
        className="bg-white border border-gray-300 rounded-md p-2 w-full text-black"
      />
    </div>
  );
}
