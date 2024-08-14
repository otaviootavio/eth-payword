import { useState } from "react";
import {
  useReadEthWordChannelSender,
  useReadEthWordChannelTip,
  useReadEthWordSimulateCloseChannel,
  useReadEthWordTotalWordCount,
  useWriteEthWordCloseChannel,
} from "../../generated";
import { useAccount, useBalance } from "wagmi";
import { formatEther } from "viem";
import HashchainInput from "../HashchainInput";
import { useHashChainFromExtension } from "../../contexts/wallet/HashChainExtensionProvider";

interface CloseChannelProps {
  address: `0x${string}` | undefined;
}

export const CloseChannel: React.FC<CloseChannelProps> = ({ address }) => {
  const account = useAccount();
  const [hexValue, setHexValue] = useState<string>("0x0");
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

  const {
    data,
    status: statusEth,
    error: errorEth,
  } = useReadEthWordSimulateCloseChannel({
    address,
    args: [hexValue as `0x${string}`, bigIntValue as bigint],
    account: account.address,
  });

  const { fetchHashChain } = useHashChainFromExtension();
  const [fullHashChain, setFullHashChain] = useState<string[]>([]);

  if (!address) return;

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
          args: [hexValue as `0x${string}`, bigIntValue as bigint],
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

  const handleFetchHashChain = async () => {
    const hashChain = await fetchHashChain();
    setFullHashChain(hashChain);
    setBigIntValue(BigInt(hashChain.length - 1));
  };

  return (
    <div className="p-6 mx-auto bg-white space-y-4">
      <div className="flex flex-row gap-2 justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Close Channel</h2>
        </div>
        <div>
          <button
            onClick={handleFetchHashChain}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition flex w-auto items-center text-sm"
          >
            Fetch hash chain from wallet!
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <HashchainInput
          setBigIntValue={setBigIntValue}
          setHexValue={setHexValue}
          fullHashChain={fullHashChain}
        />
        <input
          type="submit"
          value="Gooo!"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-900 font-bold transition"
        />
      </form>
      <p className="text-gray-900 font-bold">
        Status: <span className="font-normal">{statusEth}</span>
      </p>
      <p className="text-red-500">{errorEth?.message}</p>
      <p className="text-gray-900 font-bold">
        Does it work?:{" "}
        {data && data[0] ? (
          <span className="font-normal text-blue-700">Yes!!</span>
        ) : (
          <span className="font-normal text-red-700">Noo!</span>
        )}
      </p>
      <p className="text-gray-900 font-bold">
        Balance:
        <span className="font-normal">{data && formatEther(data[1])}</span>
      </p>
      <p className="text-gray-900 font-bold">
        Write Status: <span className="font-normal">{statusWrite}</span>
      </p>
      <p className="text-red-500">{errorWrite?.message}</p>
    </div>
  );
};
