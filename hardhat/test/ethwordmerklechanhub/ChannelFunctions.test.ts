import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { deployEthWordMerkleChanHub } from "../utils/deployEthWordMerkleChanHub";

describe("EthWordMerkleChanHub Function Tests", function () {
  describe("Channel creation and closure functions", function () {
    it("Should create channel and log gas costs", async function () {
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

      console.log(`Channel creation gas used: ${createChannelReceipt.gasUsed}`);

      // Get the channel ID from the event
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
      console.log(`Channel ID: ${channelId}`);

      // Verify channel was created
      if (!channelId) {
        throw new Error("Channel ID not found in logs");
      }

      // Verify channel exists by checking the channels mapping
      const channelInfo = (await ethWordMerkleChanHub.read.channels([
        channelId as `0x${string}`,
      ])) as any;
      expect(channelInfo[0].toLowerCase()).to.equal(
        otherAccount.account.address.toLowerCase()
      ); // recipient
      expect(channelInfo[1].toLowerCase()).to.equal(
        owner.account.address.toLowerCase()
      ); // sender
      expect(channelInfo[2]).to.equal(channelDeposit); // balance
      expect(channelInfo[3]).to.equal(wordCountBigInt); // totalWordCount
      expect(channelInfo[4]).to.equal(root); // root
    });

    it("Should close channel and log gas costs", async function () {
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

      // Get the channel ID from the event
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

      console.log(`Channel closure gas used: ${closeChannelReceipt.gasUsed}`);

      // Verify channel was closed by checking balance
      const channelInfo = (await ethWordMerkleChanHub.read.channels([
        channelId as `0x${string}`,
      ])) as any;
      expect(channelInfo[2]).to.equal(0n); // balance should be 0
    });
  });

  describe("Partial withdrawal functions", function () {
    it("Should withdraw 1 word and log gas costs", async function () {
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

      // Get the channel ID from the event
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

      // Withdraw 1 word with Merkle proof
      const indexOfLeaf = 0; // First word
      const myLeaf = merkleTree.getHexLeaves()[indexOfLeaf] as `0x${string}`;
      const merkleProofForMyLeaf: `0x${string}`[] = merkleTree.getHexProof(
        myLeaf
      ) as `0x${string}`[];

      const withdrawTx = await ethWordMerkleChanHub.write.closeChannel(
        [channelId, merkleProofForMyLeaf, myLeaf, BigInt(indexOfLeaf)],
        {
          account: otherAccount.account,
        }
      );

      const withdrawReceipt = await publicClient.getTransactionReceipt({
        hash: withdrawTx,
      });

      console.log(`1 word withdrawal gas used: ${withdrawReceipt.gasUsed}`);

      // Verify channel was closed by checking balance (contract closes channel completely)
      const channelInfo = (await ethWordMerkleChanHub.read.channels([
        channelId as `0x${string}`,
      ])) as any;
      expect(channelInfo[2]).to.equal(0n); // balance should be 0 (channel closed)
      expect(channelInfo[3]).to.equal(wordCountBigInt - 1n); // remaining word count
    });

    it("Should withdraw 2 words and log gas costs", async function () {
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

      // Get the channel ID from the event
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

      // Withdraw 2 words with Merkle proof
      const indexOfLeaf = 1; // Second word (index 1)
      const myLeaf = merkleTree.getHexLeaves()[indexOfLeaf] as `0x${string}`;
      const merkleProofForMyLeaf: `0x${string}`[] = merkleTree.getHexProof(
        myLeaf
      ) as `0x${string}`[];

      const withdrawTx = await ethWordMerkleChanHub.write.closeChannel(
        [channelId, merkleProofForMyLeaf, myLeaf, BigInt(indexOfLeaf)],
        {
          account: otherAccount.account,
        }
      );

      const withdrawReceipt = await publicClient.getTransactionReceipt({
        hash: withdrawTx,
      });

      console.log(`2 word withdrawal gas used: ${withdrawReceipt.gasUsed}`);

      // Verify channel was closed by checking balance (contract closes channel completely)
      const channelInfo = (await ethWordMerkleChanHub.read.channels([
        channelId as `0x${string}`,
      ])) as any;
      expect(channelInfo[2]).to.equal(0n); // balance should be 0 (channel closed)
      expect(channelInfo[3]).to.equal(wordCountBigInt - 2n); // remaining word count
    });

    it("Should withdraw 3 words and log gas costs", async function () {
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

      // Get the channel ID from the event
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

      // Withdraw 3 words with Merkle proof
      const indexOfLeaf = 2; // Third word (index 2)
      const myLeaf = merkleTree.getHexLeaves()[indexOfLeaf] as `0x${string}`;
      const merkleProofForMyLeaf: `0x${string}`[] = merkleTree.getHexProof(
        myLeaf
      ) as `0x${string}`[];

      const withdrawTx = await ethWordMerkleChanHub.write.closeChannel(
        [channelId, merkleProofForMyLeaf, myLeaf, BigInt(indexOfLeaf)],
        {
          account: otherAccount.account,
        }
      );

      const withdrawReceipt = await publicClient.getTransactionReceipt({
        hash: withdrawTx,
      });

      console.log(`3 word withdrawal gas used: ${withdrawReceipt.gasUsed}`);

      // Verify channel was closed by checking balance (contract closes channel completely)
      const channelInfo = (await ethWordMerkleChanHub.read.channels([
        channelId as `0x${string}`,
      ])) as any;
      expect(channelInfo[2]).to.equal(0n); // balance should be 0 (channel closed)
      expect(channelInfo[3]).to.equal(wordCountBigInt - 3n); // remaining word count
    });
  });
}); 