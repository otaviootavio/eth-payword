import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { bytesToHex } from "viem";
import { deployEthWordMerkle, hashM } from "../utils/deployEthWordMerkle";

describe("EthWordMerkle", function () {
  async function deployFixture() {
    const {
      chainSize,
      merkleTree,
      ethWordMerkle,
      publicClient,
      secret,
      amount,
      owner,
      otherAccount
    } = await loadFixture(deployEthWordMerkle);

    return { chainSize, merkleTree, ethWordMerkle, publicClient, secret, amount, owner, otherAccount };
  }

  describe("Channel balance", function () {
    it("Should close the channel after sending the full amount and set balance to 0", async function () {
      const { chainSize, merkleTree, ethWordMerkle, otherAccount, publicClient } = await deployFixture();

      await ethWordMerkle.write.closeChannel(
        [bytesToHex(merkleTree[0], { size: 32 }), BigInt(chainSize)],
        { account: otherAccount.account }
      );

      expect(
        await publicClient.getBalance({ address: ethWordMerkle.address })
      ).to.equal(0n);
    });

    it("Should close the channel partially and adjust the balance accordingly", async function () {
      const { chainSize, merkleTree, ethWordMerkle, amount, otherAccount } = await deployFixture();

      await ethWordMerkle.write.closeChannel(
        [bytesToHex(merkleTree[chainSize - 1], { size: 32 }), BigInt(1)],
        { account: otherAccount.account }
      );

      expect(
        await publicClient.getBalance({ address: ethWordMerkle.address })
      ).to.equal(amount - amount / BigInt(chainSize));
    });

    it("Should close the channel with partial amount and adjust the balance", async function () {
      const { chainSize, merkleTree, ethWordMerkle, amount, otherAccount } = await deployFixture();

      await ethWordMerkle.write.closeChannel(
        [bytesToHex(merkleTree[chainSize - hashM], { size: 32 }), BigInt(hashM)],
        { account: otherAccount.account }
      );

      expect(
        await publicClient.getBalance({ address: ethWordMerkle.address })
      ).to.equal(amount - (BigInt(hashM) * amount) / BigInt(chainSize));
    });
  });

  describe("Channel hash tip and total word count", function () {
    it("Should change hash tip to initial hash and word count to 0 after closing channel", async function () {
      const { chainSize, merkleTree, ethWordMerkle, otherAccount } = await deployFixture();

      await ethWordMerkle.write.closeChannel(
        [bytesToHex(merkleTree[0], { size: 32 }), BigInt(chainSize)],
        { account: otherAccount.account }
      );

      const totalWordCount = await ethWordMerkle.read.totalWordCount();
      const channelTip = await ethWordMerkle.read.channelTip();

      expect(totalWordCount).to.equal(0n);
      expect(channelTip).to.equal(bytesToHex(merkleTree[0]));
    });

    it("Should change hash tip to the last hash and decrease word count by 1", async function () {
      const { chainSize, merkleTree, ethWordMerkle, otherAccount } = await deployFixture();

      await ethWordMerkle.write.closeChannel(
        [bytesToHex(merkleTree[chainSize - 1], { size: 32 }), BigInt(1)],
        { account: otherAccount.account }
      );

      const totalWordCount = await ethWordMerkle.read.totalWordCount();
      const channelTip = await ethWordMerkle.read.channelTip();

      expect(totalWordCount).to.equal(BigInt(chainSize - 1));
      expect(channelTip).to.equal(bytesToHex(merkleTree[chainSize - 1]));
    });

    it("Should change hash tip to the correct hash after partial close and adjust word count", async function () {
      const { chainSize, merkleTree, ethWordMerkle, otherAccount } = await deployFixture();

      await ethWordMerkle.write.closeChannel(
        [bytesToHex(merkleTree[chainSize - hashM], { size: 32 }), BigInt(hashM)],
        { account: otherAccount.account }
      );

      const totalWordCount = await ethWordMerkle.read.totalWordCount();
      const channelTip = await ethWordMerkle.read.channelTip();

      expect(totalWordCount).to.equal(BigInt(chainSize - hashM));
      expect(channelTip).to.equal(bytesToHex(merkleTree[chainSize - hashM]));
    });
  });

  describe("Simulate close channel", function () {
    it("Should simulate closing the channel successfully with valid proof", async function () {
      const { chainSize, merkleTree, ethWordMerkle, otherAccount } = await deployFixture();

      const [isValid, amountToWithdraw] = await ethWordMerkle.read.simulateCloseChannel(
        [bytesToHex(merkleTree[chainSize - 1], { size: 32 }), BigInt(1)],
        { account: otherAccount.account }
      );

      expect(isValid).to.be.true;
      expect(amountToWithdraw).to.equal(amount.div(BigInt(chainSize)));
    });

    it("Should fail simulation with invalid Merkle proof", async function () {
      const { ethWordMerkle, otherAccount } = await deployFixture();

      const [isValid, amountToWithdraw] = await ethWordMerkle.read.simulateCloseChannel(
        [bytesToHex("0x0", { size: 32 }), BigInt(1)],
        { account: otherAccount.account }
      );

      expect(isValid).to.be.false;
      expect(amountToWithdraw).to.equal(0);
    });
  });
});
