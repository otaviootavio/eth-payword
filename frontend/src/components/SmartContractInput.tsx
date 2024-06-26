import React, { useState } from "react";
import { Solc } from "solc-browserify";
import { useDeployContract } from "wagmi";
import { Abi } from "abitype";
import { type Address, type Hash, parseEther } from "viem";
import { config } from "../wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

interface SmartConractProps {
  amountEth: bigint;
  numersOfToken: number;
  toAddress: Address;
}

const SmartContractInput: React.FC<SmartConractProps> = ({
  amountEth,
  numersOfToken,
  toAddress,
}) => {
  const [byteCode, setByteCode] = useState("");
  const [abi, setAbi] = useState<Abi>();
  const { deployContractAsync } = useDeployContract();
  const [contractAddress, setContractAddress] = useState<Address>();
  const deployContract = async () => {
    if (!abi) return;
    const newTxHash: Hash = await deployContractAsync({
      abi: abi,
      bytecode: `0x${byteCode}`,
      args: [
        toAddress,
        numersOfToken,
        "0x9242f802e97c1ae892af1cf60a9aa49283ac8a2201bb98b543ac1a6fa7452fa2",
      ],
      value: parseEther(amountEth.toString()),
    });

    const x = await waitForTransactionReceipt(config, {
      hash: newTxHash,
      confirmations: 1,
    });

    if (!x.contractAddress) return; // Handle error

    setContractAddress(x.contractAddress);
  };

  async function compileSourceCode() {
    const contract = `// SPDX-License-Identifier: UNLICENSED
      pragma solidity ^0.8.19;

      contract EthWord {
          address payable public channelSender;
          address payable public channelRecipient;
          uint public totalWordCount;
          bytes32 public channelTip;

          constructor(address to, uint wordCount, bytes32 tip) payable {
              require(to != address(0), "Recipient cannot be the zero address");
              require(wordCount > 0, "Word count must be positive");
              require(tip != 0, "Initial tip cannot be zero");

              channelRecipient = payable(to);
              channelSender = payable(msg.sender);
              totalWordCount = wordCount;
              channelTip = tip;
          }

          function closeChannel(bytes32 _word, uint _wordCount) public {
              require(
                  msg.sender == channelRecipient,
                  "Only the recipient can close the channel"
              );
              require(
                  _wordCount <= totalWordCount,
                  "Word count exceeds available words"
              );
              bool isValid = validateChannelClosure(_word, _wordCount);
              require(isValid, "Word or WordCount not valid!");

              uint amountToWithdraw = calculateWithdrawAmount(_wordCount);

              (bool sent, ) = channelRecipient.call{value: amountToWithdraw}("");
              require(sent, "Failed to send Ether");

              channelTip = _word;
              totalWordCount = totalWordCount - _wordCount;
          }

          function simulateCloseChannel(
              bytes32 _word,
              uint _wordCount
          ) public view returns (bool, uint) {
              require(
                  msg.sender == channelRecipient,
                  "Only the recipient can simulate closing the channel"
              );

              bool isValid = validateChannelClosure(_word, _wordCount);
              if (!isValid) {
                  return (false, 0);
              }

              uint amountToWithdraw = calculateWithdrawAmount(_wordCount);
              return (true, amountToWithdraw);
          }

          function validateChannelClosure(
              bytes32 _word,
              uint _wordCount
          ) private view returns (bool) {
              if (_wordCount == 0) {
                  return false;
              }
              bytes32 wordScratch = keccak256(abi.encodePacked(_word));

              for (uint i = 1; i < _wordCount; i++) {
                  wordScratch = keccak256(abi.encodePacked(wordScratch));
              }
              return wordScratch == channelTip;
          }

          function calculateWithdrawAmount(
              uint _wordCount
          ) private view returns (uint) {
              uint remainingWords = totalWordCount - _wordCount;
              if (remainingWords == 0) {
                  return address(this).balance;
              }
              uint initialWordPrice = address(this).balance / totalWordCount;
              return initialWordPrice * _wordCount;
          }
    }`;

    const solc = new Solc();
    const compiledContracts: CompiledContracts = (await solc.compile(
      contract,
    )) as CompiledContracts;

    const outBytecode =
      compiledContracts.contracts.Compiled_Contracts.EthWord.evm.bytecode
        .object;

    const outAbi: Abi = compiledContracts.contracts.Compiled_Contracts.EthWord
      .abi as Abi;

    setByteCode(outBytecode);
    setAbi(outAbi);
  }

  return (
    <div className="grid gap-x-8 gap-y-4 grid-cols-3">
      <div>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
          onClick={compileSourceCode}
        >
          Compile
        </button>
      </div>
      {!!byteCode && (
        <div>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-blue-700 transition"
            onClick={deployContract}
          >
            Deploy!
          </button>
        </div>
      )}
      {!!contractAddress && (
        <div className="text-gray-900">{contractAddress}</div>
      )}
    </div>
  );
};

export default SmartContractInput;
