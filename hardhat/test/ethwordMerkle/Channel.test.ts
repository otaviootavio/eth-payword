import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { deployEthWordMerkle } from "../utils/deployEthWordMerkle";
import { expect } from "chai";

describe("Close Channel", function () {
  describe("Channel balance", function () {
    it("Should send one of n hashes and update the balance correctly", async function () {
      const {
        ethWordMerkle,
        otherAccount,
        publicClient,
        merkleTree,
        wordCount,
      } = await loadFixture(deployEthWordMerkle);

      const indexOfLeaf = wordCount - 1;
      const myLeaf = merkleTree.getHexLeaves()[indexOfLeaf] as `0x${string}`;
      const merkleProofForMyLeaf: `0x${string}`[] = merkleTree.getHexProof(
        myLeaf
      ) as `0x${string}`[];

      const closeTx = await ethWordMerkle.write.closeChannel(
        [merkleProofForMyLeaf, myLeaf, BigInt(indexOfLeaf)],
        {
          account: otherAccount.account,
        }
      );

      const transaction = await publicClient.getTransactionReceipt({
        hash: closeTx,
      });

      console.log(
        `Withdraw ${indexOfLeaf} of ${wordCount} tokens  used ${transaction.gasUsed} gas`
      );

      expect(
        await publicClient.getBalance({ address: ethWordMerkle.address })
      ).to.equal(0n);
    });
  });
});
