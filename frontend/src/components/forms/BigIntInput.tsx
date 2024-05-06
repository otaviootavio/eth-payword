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
    <div>
      <label>BigInt Input: </label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Enter a valid BigInt"
      />
    </div>
  );
}
