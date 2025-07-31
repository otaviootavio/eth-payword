import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { deployEthPaymentChannel } from "../utils/deployEthPaymentChannel";
import { expect } from "chai";
import { parseEther, keccak256, encodePacked } from "viem";

describe("Close Channel", function () {
  describe("Channel balance", function () {
    it("Should close channel with valid signature and transfer funds correctly", async function () {
      const {
        ethPaymentChannel,
        otherAccount,
        owner,
        publicClient,
        depositAmount,
      } = await loadFixture(deployEthPaymentChannel);

      const amountToTransfer = parseEther("0.5"); // Transfer half the deposit

      // Create the message hash that needs to be signed
      const messageHash = keccak256(
        encodePacked(
          ["address", "uint256"],
          [ethPaymentChannel.address, amountToTransfer]
        )
      );

      // Create the Ethereum signed message hash
      const ethSignedMessageHash = keccak256(
        encodePacked(
          ["string", "bytes32"],
          ["\x19Ethereum Signed Message:\n32", messageHash]
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

      const closeTx = await ethPaymentChannel.write.closeChannel(
        [amountToTransfer, signature],
        {
          account: otherAccount.account,
        }
      );

      const transaction = await publicClient.getTransactionReceipt({
        hash: closeTx,
      });

      console.log(
        `Closed channel with ${amountToTransfer} ETH transfer, used ${transaction.gasUsed} gas`
      );

      // Check that the channel balance is now 0
      expect(
        await publicClient.getBalance({ address: ethPaymentChannel.address })
      ).to.equal(0n);

      // Check that the recipient received the specified amount
      // Note: The recipient pays gas fees for the transaction, so we need to account for that
      const finalRecipientBalance = await publicClient.getBalance({
        address: otherAccount.account.address,
      });
      
      // Calculate gas cost (gas used * gas price)
      const gasCost = transaction.gasUsed * transaction.effectiveGasPrice;
      
      // The recipient should have: initial balance + transferred amount - gas cost
      expect(finalRecipientBalance).to.equal(
        initialRecipientBalance + amountToTransfer - gasCost
      );
    });
  });
}); 