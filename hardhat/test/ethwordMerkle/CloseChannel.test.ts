import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import {
  bytesToHex,
  encodePacked,
  Hex,
  keccak256,
  size,
  stringToBytes,
  toBytes,
  toHex,
} from "viem";
import {
  deployEthWordMerkle,
  createHashchain,
} from "../utils/deployEthWordMerkle";

describe("CloseChannel", function () {
  describe("Channel Balance", function () {
    it("Should close the channel after sending the full amount and set balance to 0", async function () {
      const {
        ethWordMerkle,
        otherAccount,
        publicClient,
        merkleTree,
        merkleLeafsFromSecret,
      } = await loadFixture(deployEthWordMerkle);

      const indexOfLeaf = 7;
      const myLeaf = merkleTree.getHexLeaves()[indexOfLeaf] as `0x${string}`;
      const merkleProofForMyLeaf: `0x${string}`[] = merkleTree.getHexProof(
        myLeaf
      ) as `0x${string}`[];

      await ethWordMerkle.write.closeChannel(
        [merkleProofForMyLeaf, myLeaf, BigInt(indexOfLeaf)],
        {
          account: otherAccount.account,
        }
      );

      expect(
        await publicClient.getBalance({ address: ethWordMerkle.address })
      ).to.equal(0n);
    });
  });
});
