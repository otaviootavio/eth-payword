import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { parseEther, keccak256, encodePacked } from "viem";
import { deployEthPayChanHub } from "../utils/deployEthPayChanHub";

describe("EthPayChanHub Function Tests", function () {
  describe("Channel creation and closure functions", function () {
    it("Should create channel and log gas costs", async function () {
      const {
        ethPayChanHub,
        otherAccount,
        owner,
        publicClient,
      } = await loadFixture(deployEthPayChanHub);

      const channelDeposit = parseEther("1"); // 1 ETH deposit for the channel

      // CREATE CHANNEL
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

      console.log(`Channel creation gas used: ${createChannelReceipt.gasUsed}`);

      // Get the channel ID from the event
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
      console.log(`Channel ID: ${channelId}`);

      // Verify channel was created
      if (!channelId) {
        throw new Error("Channel ID not found in logs");
      }

      // Verify channel exists by checking the channels mapping
      const channelInfo = await ethPayChanHub.read.channels([channelId as `0x${string}`]) as any;
      expect(channelInfo[0].toLowerCase()).to.equal(otherAccount.account.address.toLowerCase()); // recipient
      expect(channelInfo[1].toLowerCase()).to.equal(owner.account.address.toLowerCase()); // sender
      expect(channelInfo[2]).to.equal(channelDeposit); // balance
    });

    it("Should close channel and log gas costs", async function () {
      const {
        ethPayChanHub,
        otherAccount,
        owner,
        publicClient,
      } = await loadFixture(deployEthPayChanHub);

      const channelDeposit = parseEther("1"); // 1 ETH deposit for the channel
      const amountToTransfer = parseEther("0.5"); // Transfer half the deposit

      // First create a channel
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

      // Get the channel ID from the event
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

      // CLOSE CHANNEL
      
      // Create the message hash that needs to be signed
      const messageHash = keccak256(
        encodePacked(
          ["bytes32", "uint256"],
          [channelId, amountToTransfer]
        )
      );

      // Sign the message with the owner's private key
      const signature = await owner.signMessage({
        message: { raw: messageHash },
      });

      // Get initial balances
      const initialRecipientBalance = await publicClient.getBalance({
        address: otherAccount.account.address,
      });

      const closeChannelTx = await ethPayChanHub.write.closeChannel(
        [channelId, amountToTransfer, signature],
        {
          account: otherAccount.account,
        }
      );

      const closeChannelReceipt = await publicClient.getTransactionReceipt({
        hash: closeChannelTx,
      });

      console.log(`Channel closure gas used: ${closeChannelReceipt.gasUsed}`);

      // Verify channel was closed by checking balance is 0
      const closedChannelInfo = await ethPayChanHub.read.channels([channelId as `0x${string}`]) as any;
      expect(closedChannelInfo[2]).to.equal(0n); // balance should be 0 (channel closed)

      // Check that the recipient received the specified amount
      const finalRecipientBalance = await publicClient.getBalance({
        address: otherAccount.account.address,
      });
      
      // Calculate gas cost (gas used * gas price)
      const gasCost = closeChannelReceipt.gasUsed * closeChannelReceipt.effectiveGasPrice;
      
      // The recipient should have: initial balance + transferred amount - gas cost
      expect(finalRecipientBalance).to.equal(
        initialRecipientBalance + amountToTransfer - gasCost
      );
    });
  });
}); 