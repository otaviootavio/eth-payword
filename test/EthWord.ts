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
  async function deployOneYearLockFixture() {
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

  describe("Deployment", function () {
    it("Should deploy it correctely the word count", async function () {
      const { ethWord, chainSize } = await loadFixture(
        deployOneYearLockFixture
      );

      expect(await ethWord.read.totalWordCount()).to.equal(BigInt(chainSize));
    });

    it("Should deploy it correctely the word tip", async function () {
      const { ethWord, hashChain, chainSize } = await loadFixture(
        deployOneYearLockFixture
      );

      expect(await ethWord.read.channelTip()).to.equal(
        bytesToHex(hashChain[chainSize - 1])
      );
    });

    it("Should deploy it correctely the balance", async function () {
      const { publicClient, ethWord, ammount } = await loadFixture(
        deployOneYearLockFixture
      );

      expect(
        await publicClient.getBalance({ address: ethWord.address })
      ).to.equal(ammount);
    });

    it("Should deploy it correctely the receipient", async function () {
      const { ethWord, otherAccount } = await loadFixture(
        deployOneYearLockFixture
      );

      expect(
        (await ethWord.read.channelRecipient()).toLocaleLowerCase()
      ).to.deep.equal(otherAccount.account.address);
    });
  });

  describe("Channel", function () {
    it("Should close the channel correctely", async function () {
      const { ethWord, owner, otherAccount, publicClient, hashChain } =
        await loadFixture(deployOneYearLockFixture);

      // await ethWord.write.closeChannel([hashChain[0], 10n], {
      //   account: otherAccount.account,
      // });

      await ethWord.write.closeChannel(
        [bytesToHex(hashChain[0], { size: 32 }), 10n],
        { account: otherAccount.account }
      );

      expect(
        await publicClient.getBalance({ address: ethWord.address })
      ).to.equal(0n);
    });

    // TODO
    // TEST IF THE SEND AMMOUNT IS CORRECT
    // TEST THE FAIL CASES
  });
});
