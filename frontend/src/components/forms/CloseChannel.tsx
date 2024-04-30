import { useState } from "react";
import { BinaryValidator } from "./BinaryValidator";
import { BigIntInput } from "./BigIntInput";
import {
  useReadEthWordSimulateCloseChannel,
  useWriteEthWordCloseChannel,
} from "../../generated";
import { useAccount } from "wagmi";

export function CloseChannel() {
  const address = import.meta.env.VITE_CONTRACT_ADDRESS;
  const account = useAccount();
  const [hexValue, setHexValue] = useState<`0x${string}`>("0x0");
  const [bigIntValue, setBigIntValue] = useState<bigint>(0n);

  const {
    writeContractAsync,
    status: statusWrite,
    error: errorWrite,
  } = useWriteEthWordCloseChannel();

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (data) {
      // TODO
      // DISPLAY THE ERROS TO USER
      // send error to fix the error
      if (data[1]) {
        // send the transaction
        writeContractAsync({
          address,
          args: [hexValue, bigIntValue],
          account: account.address,
        });
      } else {
        // show error
      }
    }
  };

  const {
    data,
    status: statusEth,
    error: errorEth,
  } = useReadEthWordSimulateCloseChannel({
    address,
    args: [hexValue, bigIntValue],
    account: account.address,
  });

  return (
    <div>
      <p>{statusEth}</p>
      <p>{errorEth?.message}</p>
      <p>{JSON.stringify(data?.toString())}</p>
      <p>{statusWrite}</p>
      <p>{errorWrite?.message}</p>
      <form onSubmit={handleSubmit}>
        <BinaryValidator onValid={setHexValue} />
        <BigIntInput onBigIntChange={setBigIntValue} />
        <input type="submit" value="Gooo!" />
      </form>
    </div>
  );
}
