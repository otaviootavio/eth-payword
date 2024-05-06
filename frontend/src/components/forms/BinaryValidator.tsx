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
      <label>Hexadecimal Input: </label>
      <input type="text" value={value} onChange={handleChange} />
      {!isValid && (
        <p style={{ color: "red" }}>
          Input must be a valid 64-character hexadecimal starting with 0x.
        </p>
      )}
    </div>
  );
}
