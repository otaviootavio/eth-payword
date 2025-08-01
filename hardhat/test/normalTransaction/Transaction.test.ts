import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { deployNormalTransaction } from "../utils/deployNormalTransaction";

describe("Normal Transaction", function () {
  describe("ETH Transfer", function () {
    it("Should execute N sequential ETH transfers and log total gas usage", async function () {
      const { 
        sender, 
        recipient, 
        transferAmount, 
        chainSize,
        senderInitialBalance, 
        recipientInitialBalance, 
        publicClient 
      } = await loadFixture(deployNormalTransaction);

      let totalGasUsed = 0n;

      // Execute N sequential transfers
      for (let i = 0; i < chainSize; i++) {
        const txResponse = await sender.sendTransaction({
          to: recipient.account.address,
          value: transferAmount,
        });

        const txReceipt = await publicClient.getTransactionReceipt({
          hash: txResponse,
        });

        totalGasUsed += txReceipt.gasUsed;
      }

      // Log total gas usage for N sequential transactions
      console.log("NormalTransaction", "·", totalGasUsed);

      // Verify final balances
      const senderFinalBalance = await publicClient.getBalance({ 
        address: sender.account.address 
      });
      const recipientFinalBalance = await publicClient.getBalance({ 
        address: recipient.account.address 
      });

      // Check that sender balance decreased by total transfer amount + gas fees
      expect(Number(senderFinalBalance)).to.be.lessThan(Number(senderInitialBalance - (transferAmount * BigInt(chainSize))));
      
      // Check that recipient balance increased by total transfer amount
      expect(recipientFinalBalance).to.equal(recipientInitialBalance + (transferAmount * BigInt(chainSize)));
      
      // Verify total gas used is reasonable (should be > 0 and = N * 21000 for standard transfers)
      expect(Number(totalGasUsed)).to.be.greaterThan(0);
      expect(totalGasUsed).to.equal(BigInt(chainSize) * 21000n);
    });

    it("Should handle multiple transfers and track cumulative gas", async function () {
      const { 
        sender, 
        recipient, 
        transferAmount, 
        publicClient 
      } = await loadFixture(deployNormalTransaction);

      let totalGasUsed = 0n;

      // Perform multiple transfers
      for (let i = 0; i < 3; i++) {
        const txResponse = await sender.sendTransaction({
          to: recipient.account.address,
          value: transferAmount,
        });

        const txReceipt = await publicClient.getTransactionReceipt({
          hash: txResponse,
        });

        totalGasUsed += txReceipt.gasUsed;
      }

      // Log total gas usage for multiple transactions
      console.log("MultipleTransfers", "·", totalGasUsed);

      // Verify final balances
      const senderFinalBalance = await publicClient.getBalance({ 
        address: sender.account.address 
      });
      const recipientFinalBalance = await publicClient.getBalance({ 
        address: recipient.account.address 
      });

      // Check that total gas used is reasonable (should be > 0)
      expect(Number(totalGasUsed)).to.be.greaterThan(0);
    });
  });
}); 