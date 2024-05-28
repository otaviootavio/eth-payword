import { getBalance } from "viem/actions";
import {
  useReadEthWordChannelRecipient,
  useReadEthWordChannelSender,
  useReadEthWordChannelTip,
  useReadEthWordTotalWordCount,
} from "../generated";
import { useBalance } from 'wagmi';
import { config } from "./../wagmi.ts";
import { formatEther } from "viem";

const ContractInfo = () => {
  const address = import.meta.env.VITE_CONTRACT_ADDRESS;

  const { data: channelRecipient } = useReadEthWordChannelRecipient({
    address,
  });

  const { data: channelTip } = useReadEthWordChannelTip({
    address,
  });

  const { data: channelSender } = useReadEthWordChannelSender({
    address,
  });

  const { data: totalWordCount } = useReadEthWordTotalWordCount({
    address,
  });
  const { data: balance } = useBalance({
    address,
  })

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Contract Info</h2>
      <p className="text-gray-700">
        <span className="font-semibold">Channel recipient:</span> {channelRecipient}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Channel tip:</span> {channelTip}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Channel sender:</span> {channelSender}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Total word count:</span> {totalWordCount?.toString()}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Balance:</span> {formatEther(balance?.value || 0n)}
      </p>
    </div>
  );
};

export default ContractInfo;
