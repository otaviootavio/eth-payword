import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { deployEthWordMerkleChanHub } from "../utils/deployEthWordMerkleChanHub";

describe("EthWordMerkleChanHub Event Tests", function () {
  describe("Channel creation events", function () {
    it("Should emit ChannelCreated event with correct parameters", async function () {
      const {
        ethWordMerkleChanHub,
        otherAccount,
        owner,
        publicClient,
        amount,
        wordCount,
        root,
      } = await loadFixture(deployEthWordMerkleChanHub);

      const channelDeposit = amount;
      const wordCountBigInt = BigInt(wordCount);

      // CREATE CHANNEL
      const createChannelTx = await ethWordMerkleChanHub.write.createChannel(
        [otherAccount.account.address, wordCountBigInt, root],
        {
          account: owner.account,
          value: channelDeposit,
        }
      );

      const createChannelReceipt = await publicClient.getTransactionReceipt({
        hash: createChannelTx,
      });

      // Get the ChannelCreated event
      const createChannelLogs = await publicClient.getLogs({
        address: ethWordMerkleChanHub.address,
        event: {
          type: "event",
          name: "ChannelCreated",
          inputs: [
            { type: "bytes32", name: "channelId", indexed: true },
            { type: "address", name: "sender", indexed: true },
            { type: "address", name: "recipient", indexed: true },
            { type: "uint256", name: "amount", indexed: false },
            { type: "uint256", name: "wordCount", indexed: false },
            { type: "bytes32", name: "root", indexed: false },
          ],
        },
        fromBlock: createChannelReceipt.blockNumber,
        toBlock: createChannelReceipt.blockNumber,
      });

      expect(createChannelLogs).to.have.length(1);
      const event = createChannelLogs[0];
      
      expect(event.args?.sender?.toLowerCase()).to.equal(owner.account.address.toLowerCase());
      expect(event.args?.recipient?.toLowerCase()).to.equal(otherAccount.account.address.toLowerCase());
      expect(event.args?.amount).to.equal(channelDeposit);
      expect(event.args?.wordCount).to.equal(wordCountBigInt);
      expect(event.args?.root).to.equal(root);
    });
  });

  describe("Channel closure events", function () {
    it("Should emit ChannelClosed event with correct parameters", async function () {
      const {
        ethWordMerkleChanHub,
        otherAccount,
        owner,
        publicClient,
        amount,
        wordCount,
        merkleTree,
      } = await loadFixture(deployEthWordMerkleChanHub);

      const channelDeposit = amount;
      const wordCountBigInt = BigInt(wordCount);

      // Create channel first
      const createChannelTx = await ethWordMerkleChanHub.write.createChannel(
        [otherAccount.account.address, wordCountBigInt, merkleTree.getHexRoot() as `0x${string}`],
        {
          account: owner.account,
          value: channelDeposit,
        }
      );

      const createChannelReceipt = await publicClient.getTransactionReceipt({
        hash: createChannelTx,
      });

      // Get the channel ID from the creation event
      const createChannelLogs = await publicClient.getLogs({
        address: ethWordMerkleChanHub.address,
        event: {
          type: "event",
          name: "ChannelCreated",
          inputs: [
            { type: "bytes32", name: "channelId", indexed: true },
            { type: "address", name: "sender", indexed: true },
            { type: "address", name: "recipient", indexed: true },
            { type: "uint256", name: "amount", indexed: false },
            { type: "uint256", name: "wordCount", indexed: false },
            { type: "bytes32", name: "root", indexed: false },
          ],
        },
        fromBlock: createChannelReceipt.blockNumber,
        toBlock: createChannelReceipt.blockNumber,
      });

      const channelId = createChannelLogs[0]?.args?.channelId;
      if (!channelId) {
        throw new Error("Channel ID not found in logs");
      }

      // Close channel with Merkle proof
      const indexOfLeaf = wordCount - 1;
      const myLeaf = merkleTree.getHexLeaves()[indexOfLeaf] as `0x${string}`;
      const merkleProofForMyLeaf: `0x${string}`[] = merkleTree.getHexProof(
        myLeaf
      ) as `0x${string}`[];

      const closeChannelTx = await ethWordMerkleChanHub.write.closeChannel(
        [channelId, merkleProofForMyLeaf, myLeaf, BigInt(indexOfLeaf)],
        {
          account: otherAccount.account,
        }
      );

      const closeChannelReceipt = await publicClient.getTransactionReceipt({
        hash: closeChannelTx,
      });

      // Get the ChannelClosed event
      const closeChannelLogs = await publicClient.getLogs({
        address: ethWordMerkleChanHub.address,
        event: {
          type: "event",
          name: "ChannelClosed",
          inputs: [
            { type: "bytes32", name: "channelId", indexed: true },
            { type: "address", name: "recipient", indexed: true },
            { type: "uint256", name: "amount", indexed: false },
            { type: "uint256", name: "wordCount", indexed: false },
          ],
        },
        fromBlock: closeChannelReceipt.blockNumber,
        toBlock: closeChannelReceipt.blockNumber,
      });

      expect(closeChannelLogs).to.have.length(1);
      const event = closeChannelLogs[0];
      
      expect(event.args?.channelId).to.equal(channelId);
      expect(event.args?.recipient?.toLowerCase()).to.equal(otherAccount.account.address.toLowerCase());
      expect(event.args?.wordCount).to.equal(BigInt(indexOfLeaf + 1));
    });
  });
}); 