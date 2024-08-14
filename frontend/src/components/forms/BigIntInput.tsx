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
      console.error("Error parsing number to BigInt");
    }
  };

  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Enter a valid number"
        className="bg-white border border-gray-300 rounded-md p-2 w-full text-gray-700"
      />
    </div>
  );
}
