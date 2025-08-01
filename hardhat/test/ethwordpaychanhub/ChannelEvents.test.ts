import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { keccak256, encodePacked, toHex } from "viem";
import { deployEthWordPayChanHub } from "../utils/deployEthWordPayChanHub";

describe("EthWordPayChanHub Event Tests", function () {
  describe("Channel events", function () {
    it("Should emit ChannelCreated event with correct parameters", async function () {
      const {
        ethWordPayChanHub,
        otherAccount,
        owner,
        publicClient,
        amount,
        wordCount,
        wordsToConsume,
        secret,
      } = await loadFixture(deployEthWordPayChanHub);

      const channelDeposit = amount; // Use global amount parameter
      const wordCountBigInt = BigInt(wordCount); // Use global wordCount parameter

      // Create a test word and calculate the tip
      const firstHashChainItem = keccak256(
        encodePacked(["bytes32"], [toHex(secret)])
      );
      let lastHashChainItem = firstHashChainItem;
      for (let i = 0; i < Number(wordsToConsume); i++) {
        lastHashChainItem = keccak256(
          encodePacked(["bytes32"], [lastHashChainItem])
        );
      }

      // Create channel and get transaction receipt
      const createChannelTx = await ethWordPayChanHub.write.createChannel(
        [otherAccount.account.address, wordCountBigInt, lastHashChainItem],
        {
          account: owner.account,
          value: channelDeposit,
        }
      );

      const createChannelReceipt = await publicClient.getTransactionReceipt({
        hash: createChannelTx,
      });

      // Get the event logs
      const createChannelLogs = await publicClient.getLogs({
        address: ethWordPayChanHub.address,
        event: {
          type: "event",
          name: "ChannelCreated",
          inputs: [
            { type: "bytes32", name: "channelId", indexed: true },
            { type: "address", name: "sender", indexed: true },
            { type: "address", name: "recipient", indexed: true },
            { type: "uint256", name: "amount", indexed: false },
            { type: "uint256", name: "wordCount", indexed: false },
            { type: "bytes32", name: "tip", indexed: false },
          ],
        },
        fromBlock: createChannelReceipt.blockNumber,
        toBlock: createChannelReceipt.blockNumber,
      });

      // Verify event was emitted
      expect(createChannelLogs.length).to.equal(1);

      const eventArgs = createChannelLogs[0].args;
      expect(eventArgs?.sender?.toLowerCase()).to.equal(
        owner.account.address.toLowerCase()
      );
      expect(eventArgs?.recipient?.toLowerCase()).to.equal(
        otherAccount.account.address.toLowerCase()
      );
      expect(eventArgs?.amount).to.equal(channelDeposit);
      expect(eventArgs?.wordCount).to.equal(wordCountBigInt);
      expect(eventArgs?.tip).to.equal(lastHashChainItem);
    });

    it("Should emit ChannelClosed event when closing channel", async function () {
      const {
        ethWordPayChanHub,
        otherAccount,
        owner,
        publicClient,
        amount,
        wordCount,
        wordsToConsume,
        secret,
      } = await loadFixture(deployEthWordPayChanHub);

      const channelDeposit = amount; // Use global amount parameter
      const wordCountBigInt = BigInt(wordCount); // Use global wordCount parameter

      // Create a test word and calculate the tip
      const firstHashChainItem = keccak256(
        encodePacked(["bytes32"], [toHex(secret)])
      );
      let lastHashChainItem = firstHashChainItem;
      for (let i = 0; i < Number(wordsToConsume); i++) {
        lastHashChainItem = keccak256(
          encodePacked(["bytes32"], [lastHashChainItem])
        );
      }

      // Create channel first
      const createChannelTx = await ethWordPayChanHub.write.createChannel(
        [otherAccount.account.address, wordCountBigInt, lastHashChainItem],
        {
          account: owner.account,
          value: channelDeposit,
        }
      );

      const createChannelReceipt = await publicClient.getTransactionReceipt({
        hash: createChannelTx,
      });

      const createChannelLogs = await publicClient.getLogs({
        address: ethWordPayChanHub.address,
        event: {
          type: "event",
          name: "ChannelCreated",
          inputs: [
            { type: "bytes32", name: "channelId", indexed: true },
            { type: "address", name: "sender", indexed: true },
            { type: "address", name: "recipient", indexed: true },
            { type: "uint256", name: "amount", indexed: false },
            { type: "uint256", name: "wordCount", indexed: false },
            { type: "bytes32", name: "tip", indexed: false },
          ],
        },
        fromBlock: createChannelReceipt.blockNumber,
        toBlock: createChannelReceipt.blockNumber,
      });

      const channelId = createChannelLogs[0]?.args?.channelId;
      if (!channelId) {
        throw new Error("Channel ID not found in logs");
      }

      // Use the test word directly - it should validate against the calculated tip
      const wordScratch = firstHashChainItem;

      // Close channel and get transaction receipt
      const closeChannelTx = await ethWordPayChanHub.write.closeChannel(
        [channelId, wordScratch, wordsToConsume],
        {
          account: otherAccount.account,
        }
      );

      const closeChannelReceipt = await publicClient.getTransactionReceipt({
        hash: closeChannelTx,
      });

      // Get the event logs
      const closeChannelLogs = await publicClient.getLogs({
        address: ethWordPayChanHub.address,
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

      // Verify event was emitted
      expect(closeChannelLogs.length).to.equal(1);

      const eventArgs = closeChannelLogs[0].args;
      expect(eventArgs?.channelId).to.equal(channelId);
      expect(eventArgs?.recipient?.toLowerCase()).to.equal(
        otherAccount.account.address.toLowerCase()
      );
      expect(eventArgs?.wordCount).to.equal(wordsToConsume);

      // Calculate expected amount
      const pricePerWord = channelDeposit / wordCountBigInt;
      const expectedAmount = pricePerWord * wordsToConsume;
      expect(eventArgs?.amount).to.equal(expectedAmount);
    });

    it("Should recover channel ID from ChannelCreated event", async function () {
      const {
        ethWordPayChanHub,
        otherAccount,
        owner,
        publicClient,
        amount,
        wordCount,
        wordsToConsume,
        secret,
      } = await loadFixture(deployEthWordPayChanHub);

      const channelDeposit = amount; // Use global amount parameter
      const wordCountBigInt = BigInt(wordCount); // Use global wordCount parameter

      // Create a test word and calculate the tip
      const firstHashChainItem = keccak256(
        encodePacked(["bytes32"], [toHex(secret)])
      );
      let lastHashChainItem = firstHashChainItem;
      for (let i = 0; i < Number(wordsToConsume); i++) {
        lastHashChainItem = keccak256(
          encodePacked(["bytes32"], [lastHashChainItem])
        );
      }

      // Create channel and get transaction receipt
      const createChannelTx = await ethWordPayChanHub.write.createChannel(
        [otherAccount.account.address, wordCountBigInt, lastHashChainItem],
        {
          account: owner.account,
          value: channelDeposit,
        }
      );

      const createChannelReceipt = await publicClient.getTransactionReceipt({
        hash: createChannelTx,
      });

      // Get the event logs to recover channel ID
      const createChannelLogs = await publicClient.getLogs({
        address: ethWordPayChanHub.address,
        event: {
          type: "event",
          name: "ChannelCreated",
          inputs: [
            { type: "bytes32", name: "channelId", indexed: true },
            { type: "address", name: "sender", indexed: true },
            { type: "address", name: "recipient", indexed: true },
            { type: "uint256", name: "amount", indexed: false },
            { type: "uint256", name: "wordCount", indexed: false },
            { type: "bytes32", name: "tip", indexed: false },
          ],
        },
        fromBlock: createChannelReceipt.blockNumber,
        toBlock: createChannelReceipt.blockNumber,
      });

      // Verify event was emitted
      expect(createChannelLogs.length).to.equal(1);

      // Recover channel ID from the event
      const recoveredChannelId = createChannelLogs[0].args?.channelId;
      expect(recoveredChannelId).to.not.be.undefined;
      expect(recoveredChannelId).to.match(/^0x[a-fA-F0-9]{64}$/);

      // Verify the recovered channel ID is valid by checking other event parameters
      const eventArgs = createChannelLogs[0].args;
      expect(eventArgs?.sender?.toLowerCase()).to.equal(
        owner.account.address.toLowerCase()
      );
      expect(eventArgs?.recipient?.toLowerCase()).to.equal(
        otherAccount.account.address.toLowerCase()
      );
      expect(eventArgs?.amount).to.equal(channelDeposit);
      expect(eventArgs?.wordCount).to.equal(wordCountBigInt);
      expect(eventArgs?.tip).to.equal(lastHashChainItem);
    });

    it("Should emit multiple events for multiple channel operations", async function () {
      const {
        ethWordPayChanHub,
        otherAccount,
        owner,
        publicClient,
        amount,
        wordCount,
        wordsToConsume,
        secret,
      } = await loadFixture(deployEthWordPayChanHub);

      const channelDeposit = amount; // Use global amount parameter
      const wordCountBigInt = BigInt(wordCount); // Use global wordCount parameter

      // Create a test word and calculate the tip
      const firstHashChainItem = keccak256(
        encodePacked(["bytes32"], [toHex(secret)])
      );
      let lastHashChainItem = firstHashChainItem;
      for (let i = 0; i < Number(wordsToConsume); i++) {
        lastHashChainItem = keccak256(
          encodePacked(["bytes32"], [lastHashChainItem])
        );
      }

      // Create first channel
      const createChannel1Tx = await ethWordPayChanHub.write.createChannel(
        [otherAccount.account.address, wordCountBigInt, lastHashChainItem],
        {
          account: owner.account,
          value: channelDeposit,
        }
      );

      const createChannel1Receipt = await publicClient.getTransactionReceipt({
        hash: createChannel1Tx,
      });

      // Create second channel
      const createChannel2Tx = await ethWordPayChanHub.write.createChannel(
        [otherAccount.account.address, wordCountBigInt, lastHashChainItem],
        {
          account: owner.account,
          value: channelDeposit,
        }
      );

      const createChannel2Receipt = await publicClient.getTransactionReceipt({
        hash: createChannel2Tx,
      });

      // Get all ChannelCreated events
      const allCreateEvents = await publicClient.getLogs({
        address: ethWordPayChanHub.address,
        event: {
          type: "event",
          name: "ChannelCreated",
          inputs: [
            { type: "bytes32", name: "channelId", indexed: true },
            { type: "address", name: "sender", indexed: true },
            { type: "address", name: "recipient", indexed: true },
            { type: "uint256", name: "amount", indexed: false },
            { type: "uint256", name: "wordCount", indexed: false },
            { type: "bytes32", name: "tip", indexed: false },
          ],
        },
        fromBlock: createChannel1Receipt.blockNumber,
        toBlock: createChannel2Receipt.blockNumber,
      });

      // Verify two events were emitted
      expect(allCreateEvents.length).to.equal(2);

      // Verify both events have correct parameters
      allCreateEvents.forEach((event) => {
        const args = event.args;
        expect(args?.sender?.toLowerCase()).to.equal(
          owner.account.address.toLowerCase()
        );
        expect(args?.recipient?.toLowerCase()).to.equal(
          otherAccount.account.address.toLowerCase()
        );
        expect(args?.amount).to.equal(channelDeposit);
        expect(args?.wordCount).to.equal(wordCountBigInt);
        expect(args?.tip).to.equal(lastHashChainItem);
      });
    });
  });
});
