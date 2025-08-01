import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { keccak256, encodePacked, toHex } from "viem";
import { deployEthWordPayChanHub } from "../utils/deployEthWordPayChanHub";

describe("EthWordPayChanHub Function Tests", function () {
  describe("Channel creation and closure functions", function () {
    it("Should create channel and log gas costs", async function () {
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
      const lastHashChainItem = keccak256(encodePacked(["bytes32"], [toHex(secret)])); // Initial tip

      // CREATE CHANNEL
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

      console.log(`Channel creation gas used: ${createChannelReceipt.gasUsed}`);

      // Get the channel ID from the event
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
      console.log(`Channel ID: ${channelId}`);

      // Verify channel was created
      if (!channelId) {
        throw new Error("Channel ID not found in logs");
      }

      // Verify channel exists by checking the channels mapping
      const channelInfo = (await ethWordPayChanHub.read.channels([
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
      expect(channelInfo[4]).to.equal(lastHashChainItem); // channelTip
    });

    it("Should close channel and log gas costs", async function () {
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

      // First create a channel
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

      // Get the channel ID from the event
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

      // CLOSE CHANNEL

      // Use the test word directly - it should validate against the calculated tip
      const wordScratch = firstHashChainItem;

      // Get initial balances
      const initialRecipientBalance = await publicClient.getBalance({
        address: otherAccount.account.address,
      });

      const closeChannelTx = await ethWordPayChanHub.write.closeChannel(
        [channelId, wordScratch, wordsToConsume],
        {
          account: otherAccount.account,
        }
      );

      const closeChannelReceipt = await publicClient.getTransactionReceipt({
        hash: closeChannelTx,
      });

      console.log(`Channel closure gas used: ${closeChannelReceipt.gasUsed}`);

      // Verify channel was closed by checking balance is 0
      const closedChannelInfo = (await ethWordPayChanHub.read.channels([
        channelId as `0x${string}`,
      ])) as any;
      expect(closedChannelInfo[2]).to.equal(0n); // balance should be 0 (channel closed)

      // Check that the recipient received the correct amount
      const finalRecipientBalance = await publicClient.getBalance({
        address: otherAccount.account.address,
      });

      // Calculate gas cost (gas used * gas price)
      const gasCost =
        closeChannelReceipt.gasUsed * closeChannelReceipt.effectiveGasPrice;

      // Calculate expected amount (wordCount * price per word)
      const pricePerWord = channelDeposit / wordCountBigInt;
      const expectedAmount = pricePerWord * wordsToConsume;

      // The recipient should have: initial balance + transferred amount - gas cost
      expect(finalRecipientBalance).to.equal(
        initialRecipientBalance + expectedAmount - gasCost
      );
    });

    it("Should fail with invalid payword", async function () {
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

      // Create channel
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

      // Test with invalid word (should fail)
      const invalidWord = keccak256(encodePacked(["bytes32"], [toHex("notTheSecret", { size: 32 })]));

      try {
        await ethWordPayChanHub.write.closeChannel(
          [channelId, invalidWord, wordsToConsume],
          {
            account: otherAccount.account,
          }
        );
        expect.fail("Expected transaction to revert");
      } catch (error) {
        // Transaction should fail with InvalidWordOrCount error
        expect(error).to.be.instanceOf(Error);
      }
    });

    it("Should succeed with valid payword", async function () {
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

      // Create channel
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

      // Test with valid word - this should succeed
      await ethWordPayChanHub.write.closeChannel(
        [channelId, firstHashChainItem, wordsToConsume],
        {
          account: otherAccount.account,
        }
      );
    });
  });
});
