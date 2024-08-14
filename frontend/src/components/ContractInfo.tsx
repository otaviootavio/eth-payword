import {
  useReadEthWordChannelRecipient,
  useReadEthWordChannelSender,
  useReadEthWordChannelTip,
  useReadEthWordTotalWordCount,
} from "../generated";
import { useBalance } from "wagmi";
import { formatEther } from "viem";

interface ContractInfoProps {
  address: `0x${string}` | undefined;
}

const ContractInfo: React.FC<ContractInfoProps> = ({ address }) => {
  const { data: channelRecipient } = useReadEthWordChannelRecipient({
    address,
  });
  const { data: channelTip } = useReadEthWordChannelTip({ address });
  const { data: channelSender } = useReadEthWordChannelSender({ address });
  const { data: totalWordCount } = useReadEthWordTotalWordCount({ address });
  const { data: balance } = useBalance({ address });

  if (!address) return <div>Insert the contract address</div>;
  if (
    !channelRecipient ||
    !channelTip ||
    !channelSender ||
    !totalWordCount ||
    !balance
  ) {
    return <div>Loading...</div>;
  }
  return (
    <div className="p-6 mx-auto bg-white space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Contract Info</h2>
      <p className="text-gray-700">
        <span className="font-semibold">Channel recipient:</span>{" "}
        {channelRecipient}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Channel tip:</span> {channelTip}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Channel sender:</span> {channelSender}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Total word count:</span>{" "}
        {totalWordCount?.toString()}
      </p>
      <p className="text-gray-700">
        <span className="font-semibold">Balance:</span>{" "}
        {formatEther(balance?.value || 0n)}
      </p>
    </div>
  );
};

export default ContractInfo;
