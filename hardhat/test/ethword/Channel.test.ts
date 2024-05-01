import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { parseEther, stringToBytes, keccak256, bytesToHex } from "viem";

function createHashchain(secret: Uint8Array, length: number): Uint8Array[] {
  let currentHash: Uint8Array = keccak256(secret, "bytes");
  const hashChain: Uint8Array[] = [currentHash];

  for (let i = 1; i < length; i++) {
    currentHash = keccak256(currentHash, "bytes");
    hashChain.push(currentHash);
  }

  return hashChain;
}

describe("EthWord", function () {
  async function deployEthWord() {
    const chainSize: number = 10;
    const secret: Uint8Array = stringToBytes("segredo");
    const ammount: bigint = parseEther("3000");

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const defaultRecipient: `0x${string}` = otherAccount.account.address;

    const hashChain = createHashchain(secret, chainSize);
    const tip = hashChain[chainSize - 1];
    const wordCount = BigInt(chainSize);

    const ethWord = await hre.viem.deployContract(
      "EthWord",
      [defaultRecipient, wordCount, bytesToHex(tip, { size: 32 })],
      {
        value: ammount,
      }
    );

    const publicClient = await hre.viem.getPublicClient();
    return {
      chainSize,
      hashChain,
      ethWord,
      secret,
      ammount,
      owner,
      otherAccount,
      publicClient,
    };
  }

  describe("Channel", function () {
    it("Should close the channel after send h0 and change balance to 0", async function () {
      const { ethWord, chainSize, otherAccount, publicClient, hashChain } =
        await loadFixture(deployEthWord);

      await ethWord.write.closeChannel(
        [bytesToHex(hashChain[0], { size: 32 }), BigInt(chainSize)],
        { account: otherAccount.account }
      );

      expect(
        await publicClient.getBalance({ address: ethWord.address })
      ).to.equal(0n);
    });

    it("Should send one of n hash and change its balance", async function () {
      const {
        ethWord,
        chainSize,
        otherAccount,
        publicClient,
        hashChain,
        ammount,
      } = await loadFixture(deployEthWord);

      await ethWord.write.closeChannel(
        [bytesToHex(hashChain[chainSize - 1], { size: 32 }), BigInt(1)],
        { account: otherAccount.account }
      );

      expect(
        await publicClient.getBalance({ address: ethWord.address })
      ).to.equal(ammount - ammount / BigInt(chainSize));
    });

    it("Should send m of n hash and change its balance", async function () {
      const {
        ethWord,
        chainSize,
        otherAccount,
        publicClient,
        hashChain,
        ammount,
      } = await loadFixture(deployEthWord);

      const M = 8;

      await ethWord.write.closeChannel(
        [bytesToHex(hashChain[chainSize - M], { size: 32 }), BigInt(M)],
        { account: otherAccount.account }
      );

      expect(
        await publicClient.getBalance({ address: ethWord.address })
      ).to.equal(ammount - (BigInt(M) * ammount) / BigInt(chainSize));
    });
  });
});
