import { getBalance } from "viem/actions";
import {
  useReadEthWordChannelRecipient,
  useReadEthWordChannelSender,
  useReadEthWordChannelTip,
  useReadEthWordTotalWordCount,
} from "../generated";
import { config } from "./../wagmi.ts";
import { useState } from "react";
import { formatEther, parseEther } from "viem";

const ContractInfo = () => {
  const address = import.meta.env.VITE_CONTRACT_ADDRESS;
  const [balance, setBalance] = useState<bigint>(0n);

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

  getBalance(config.getClient(), {
    address: address,
  }).then((value) => {
    setBalance(value);
  });

  return (
    <div>
      <h2>Contract info</h2>
      <p>Channel recipient: {channelRecipient}</p>
      <p>Channel tip: {channelTip}</p>
      <p>Channel sender: {channelSender}</p>
      <p>Total word count: {totalWordCount?.toString()}</p>
      <p>balance: {formatEther(balance)}</p>
    </div>
  );
};

export default ContractInfo;
