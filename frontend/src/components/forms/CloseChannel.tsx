import { useState } from "react";
import { BinaryValidator } from "./BinaryValidator";
import { BigIntInput } from "./BigIntInput";
import {
  useReadEthWordChannelSender,
  useReadEthWordChannelTip,
  useReadEthWordSimulateCloseChannel,
  useReadEthWordTotalWordCount,
  useWriteEthWordCloseChannel,
} from "../../generated";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";

export function CloseChannel() {
  const address = import.meta.env.VITE_CONTRACT_ADDRESS;
  const account = useAccount();
  const [hexValue, setHexValue] = useState<`0x${string}`>("0x0");
  const [bigIntValue, setBigIntValue] = useState<bigint>(0n);

  const { refetch: refetchChannelTip } = useReadEthWordChannelTip({ address });
  const { refetch: refetchChannelSender } = useReadEthWordChannelSender({
    address,
  });
  const { refetch: refetchTotalWordCount } = useReadEthWordTotalWordCount({
    address,
  });
  const { refetch: refetchBalance } = useBalance({ address });

  const {
    writeContractAsync,
    status: statusWrite,
    error: errorWrite,
  } = useWriteEthWordCloseChannel();

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (data) {
      // TODO
      // DISPLAY THE ERROS TO USER
      // send error to fix the error
      if (data[1]) {
        // send the transaction
        await writeContractAsync({
          address,
          args: [hexValue, bigIntValue],
          account: account.address,
        });
        refetchChannelSender();
        refetchBalance();
        refetchChannelTip();
        refetchTotalWordCount();
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
    <>
      <p className="text-gray-700">Status: {statusEth}</p>
      <p className="text-red-500">{errorEth?.message}</p>
      <p className="text-gray-700">
        Does it work?: {data && data[0] ? "Yes!!" : "Noo"}
      </p>
      <p className="text-gray-700">Balance: {data && formatEther(data[1])}</p>
      <p className="text-gray-700">Write Status: {statusWrite}</p>
      <p className="text-red-500">{errorWrite?.message}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <BinaryValidator onValid={setHexValue} />
        <BigIntInput onBigIntChange={setBigIntValue} />
        <input
          type="submit"
          value="Gooo!"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
        />
      </form>
    </>
  );
}
