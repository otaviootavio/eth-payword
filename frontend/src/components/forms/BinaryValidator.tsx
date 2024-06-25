import { Dispatch, SetStateAction, useState } from "react";

export function BinaryValidator({
  onValid,
}: {
  onValid: Dispatch<SetStateAction<`0x${string}`>>;
}) {
  const [value, setValue] = useState("");
  const [isValid, setIsValid] = useState(true);

  const handleChange = (e: { target: { value: any } }) => {
    const newValue = e.target.value;
    const hexRegex = /^0x[a-fA-F0-9]{64}$/;
    const valid = hexRegex.test(newValue);
    setIsValid(valid);
    setValue(newValue);
    if (valid) onValid(newValue);
  };

  return (
    <div>
      <label className="text-gray-700">Hexadecimal Input: </label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        className="bg-white border border-gray-300 rounded-md p-2 w-full text-gray-700"
        placeholder="Binary Validator"
      />
      {!isValid && (
        <p style={{ color: "red" }}>
          Input must be a valid 64-character hexadecimal starting with 0x.
        </p>
      )}
    </div>
  );
}
