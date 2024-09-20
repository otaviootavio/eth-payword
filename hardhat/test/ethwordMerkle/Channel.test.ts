import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { bytesToHex, stringToBytes, toHex } from "viem";
import {
  deployEthWordMerkle,
  createHashchain,
} from "../utils/deployEthWordMerkle";
import { expect } from "chai";

describe("Close Channel", function () {
  describe("Channel balance", function () {
    it("Should close the channel after send h0 and change balance to 0", async function () {
      const { ethWordMerkle, chainSize, otherAccount, publicClient } =
        await loadFixture(deployEthWordMerkle);

      const secret = stringToBytes("secret");
      const hashChain = createHashchain(secret, chainSize + 1);
      const proof = hashChain.slice(1);
      const hexProof = proof.map((hash) => bytesToHex(hash, { size: 32 }));
      const hexHash = toHex(hashChain[0], { size: 32 });

      const amount = await publicClient.getBalance({
        address: ethWordMerkle.address,
      });
      const bigAmount = BigInt(amount);

      await ethWordMerkle.write.closeChannel([bigAmount, hexHash, hexProof], {
        account: otherAccount.account,
      });

      expect(
        await publicClient.getBalance({ address: ethWordMerkle.address })
      ).to.equal(0n);
    });

    it("Should send one of n hashes and update the balance correctly", async function () {
      const { ethWordMerkle, chainSize, otherAccount, publicClient } =
        await loadFixture(deployEthWordMerkle);

      const secret = stringToBytes("secret");
      const hashChain = createHashchain(secret, chainSize + 1);
      const proofIndex = 2;
      const proof = hashChain.slice(proofIndex + 1);
      const hexProof = proof.map((hash) => bytesToHex(hash, { size: 32 }));
      const hexHash = toHex(hashChain[proofIndex], { size: 32 });

      const initialBalance = await publicClient.getBalance({
        address: ethWordMerkle.address,
      });
      const bigInitialBalance = BigInt(initialBalance);

      const wordCount = 1;
      const expectedWithdraw =
        (bigInitialBalance * BigInt(wordCount)) / BigInt(chainSize);

      await ethWordMerkle.write.closeChannel(
        [BigInt(wordCount), hexHash, hexProof],
        { account: otherAccount.account }
      );

      const finalBalance = await publicClient.getBalance({
        address: ethWordMerkle.address,
      });
      const bigFinalBalance = BigInt(finalBalance);

      expect(bigFinalBalance).to.equal(bigInitialBalance - expectedWithdraw);
    });
  });
});
