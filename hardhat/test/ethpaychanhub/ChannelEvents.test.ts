import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { parseEther, keccak256, encodePacked } from "viem";
import { deployEthPayChanHub } from "../utils/deployEthPayChanHub";

describe("EthPayChanHub Event Tests", function () {
  describe("Channel events", function () {
    it("Should emit ChannelCreated event with correct parameters", async function () {
      const {
        ethPayChanHub,
        otherAccount,
        owner,
        publicClient,
      } = await loadFixture(deployEthPayChanHub);

      const channelDeposit = parseEther("0.5");

      // Create channel and get transaction receipt
      const createChannelTx = await ethPayChanHub.write.createChannel(
        [otherAccount.account.address],
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
        address: ethPayChanHub.address,
        event: {
          type: "event",
          name: "ChannelCreated",
          inputs: [
            { type: "bytes32", name: "channelId", indexed: true },
            { type: "address", name: "sender", indexed: true },
            { type: "address", name: "recipient", indexed: true },
            { type: "uint256", name: "amount", indexed: false }
          ]
        },
        fromBlock: createChannelReceipt.blockNumber,
        toBlock: createChannelReceipt.blockNumber,
      });

      // Verify event was emitted
      expect(createChannelLogs.length).to.equal(1);
      
      const eventArgs = createChannelLogs[0].args;
      expect(eventArgs?.sender?.toLowerCase()).to.equal(owner.account.address.toLowerCase());
      expect(eventArgs?.recipient?.toLowerCase()).to.equal(otherAccount.account.address.toLowerCase());
      expect(eventArgs?.amount).to.equal(channelDeposit);
    });

    it("Should emit ChannelClosed event when closing channel", async function () {
      const {
        ethPayChanHub,
        otherAccount,
        owner,
        publicClient,
      } = await loadFixture(deployEthPayChanHub);

      const channelDeposit = parseEther("1");
      const amountToTransfer = parseEther("0.3");

      // Create channel first
      const createChannelTx = await ethPayChanHub.write.createChannel(
        [otherAccount.account.address],
        {
          account: owner.account,
          value: channelDeposit,
        }
      );

      const createChannelReceipt = await publicClient.getTransactionReceipt({
        hash: createChannelTx,
      });

      const createChannelLogs = await publicClient.getLogs({
        address: ethPayChanHub.address,
        event: {
          type: "event",
          name: "ChannelCreated",
          inputs: [
            { type: "bytes32", name: "channelId", indexed: true },
            { type: "address", name: "sender", indexed: true },
            { type: "address", name: "recipient", indexed: true },
            { type: "uint256", name: "amount", indexed: false }
          ]
        },
        fromBlock: createChannelReceipt.blockNumber,
        toBlock: createChannelReceipt.blockNumber,
      });

      const channelId = createChannelLogs[0]?.args?.channelId;
      if (!channelId) {
        throw new Error("Channel ID not found in logs");
      }

      // Create signature
      const messageHash = keccak256(
        encodePacked(
          ["bytes32", "uint256"],
          [channelId, amountToTransfer]
        )
      );

      const signature = await owner.signMessage({
        message: { raw: messageHash },
      });

      // Close channel and get transaction receipt
      const closeChannelTx = await ethPayChanHub.write.closeChannel(
        [channelId, amountToTransfer, signature],
        {
          account: otherAccount.account,
        }
      );

      const closeChannelReceipt = await publicClient.getTransactionReceipt({
        hash: closeChannelTx,
      });

      // Get the event logs
      const closeChannelLogs = await publicClient.getLogs({
        address: ethPayChanHub.address,
        event: {
          type: "event",
          name: "ChannelClosed",
          inputs: [
            { type: "bytes32", name: "channelId", indexed: true },
            { type: "address", name: "recipient", indexed: true },
            { type: "uint256", name: "amount", indexed: false }
          ]
        },
        fromBlock: closeChannelReceipt.blockNumber,
        toBlock: closeChannelReceipt.blockNumber,
      });

      // Verify event was emitted
      expect(closeChannelLogs.length).to.equal(1);
      
      const eventArgs = closeChannelLogs[0].args;
      expect(eventArgs?.channelId).to.equal(channelId);
      expect(eventArgs?.recipient?.toLowerCase()).to.equal(otherAccount.account.address.toLowerCase());
      expect(eventArgs?.amount).to.equal(amountToTransfer);
    });

    it("Should recover channel ID from ChannelCreated event", async function () {
      const {
        ethPayChanHub,
        otherAccount,
        owner,
        publicClient,
      } = await loadFixture(deployEthPayChanHub);

      const channelDeposit = parseEther("0.5");

      // Create channel and get transaction receipt
      const createChannelTx = await ethPayChanHub.write.createChannel(
        [otherAccount.account.address],
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
        address: ethPayChanHub.address,
        event: {
          type: "event",
          name: "ChannelCreated",
          inputs: [
            { type: "bytes32", name: "channelId", indexed: true },
            { type: "address", name: "sender", indexed: true },
            { type: "address", name: "recipient", indexed: true },
            { type: "uint256", name: "amount", indexed: false }
          ]
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
      expect(eventArgs?.sender?.toLowerCase()).to.equal(owner.account.address.toLowerCase());
      expect(eventArgs?.recipient?.toLowerCase()).to.equal(otherAccount.account.address.toLowerCase());
      expect(eventArgs?.amount).to.equal(channelDeposit);
    });
  });
}); 