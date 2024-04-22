import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { parseGwei, stringToBytes, keccak256 } from "viem";

function toHex(str: string): `0x${string}` {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16);
  }
  return `0x${hex}`;
}

function createHashchain(secret: string, length: number): `0x${string}`[] {
  let currentHash: `0x${string}` = keccak256(toHex(secret));
  const hashChain = [currentHash];

  for (let i = 1; i < length; i++) {
    currentHash = keccak256(`0x${currentHash.slice(2)}`);
    hashChain.push(currentHash);
  }

  return hashChain;
}

describe("EthWord", function () {
  async function deployOneYearLockFixture() {
    const secret = stringToBytes("segredo");
    const ammount = parseGwei("1");
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const defaultRecipient: `0x${string}` = otherAccount.account.address;

    const hashChain = createHashchain("secret", 10);
    const tip = hashChain[9];
    const wordCount = BigInt(10);

    const ethWord = await hre.viem.deployContract(
      "EthWord",
      [defaultRecipient, wordCount, tip],
      {
        value: ammount,
      }
    );

    const publicClient = await hre.viem.getPublicClient();
    return {
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
      const { ethWord, hashChain } = await loadFixture(
        deployOneYearLockFixture
      );

      expect(await ethWord.read.totalWordCount()).to.equal(10n);
    });

    it("Should deploy it correctely the word tip", async function () {
      const { ethWord, hashChain } = await loadFixture(
        deployOneYearLockFixture
      );

      expect(await ethWord.read.channelTip()).to.equal(hashChain[9]);
    });
  });

  describe("Channel", function () {
    it("Should close the channel correctely", async function () {
      const { ethWord, owner, otherAccount, publicClient, hashChain } =
        await loadFixture(deployOneYearLockFixture);

      await ethWord.write.closeChannel([hashChain[0], 10n], {
        account: otherAccount.account,
      });

      expect(
        await publicClient.getBalance({ address: ethWord.address })
      ).to.equal(0n);
    });
  });

  // describe("Deployment", function () {
  //   it("Should set the right unlockTime", async function () {
  //     const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);

  //     expect(await lock.read.unlockTime()).to.equal(unlockTime);
  //   });

  //   it("Should set the right owner", async function () {
  //     const { lock, owner } = await loadFixture(deployOneYearLockFixture);

  //     expect(await lock.read.owner()).to.equal(
  //       getAddress(owner.account.address)
  //     );
  //   });

  //   it("Should receive and store the funds to lock", async function () {
  //     const { lock, lockedAmount, publicClient } = await loadFixture(
  //       deployOneYearLockFixture
  //     );

  //     expect(
  //       await publicClient.getBalance({
  //         address: lock.address,
  //       })
  //     ).to.equal(lockedAmount);
  //   });

  //   it("Should fail if the unlockTime is not in the future", async function () {
  //     // We don't use the fixture here because we want a different deployment
  //     const latestTime = BigInt(await time.latest());
  //     await expect(
  //       hre.viem.deployContract("Lock", [latestTime], {
  //         value: 1n,
  //       })
  //     ).to.be.rejectedWith("Unlock time should be in the future");
  //   });
  // });

  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployOneYearLockFixture);

  //       await expect(lock.write.withdraw()).to.be.rejectedWith(
  //         "You can't withdraw yet"
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We retrieve the contract with a different account to send a transaction
  //       const lockAsOtherAccount = await hre.viem.getContractAt(
  //         "Lock",
  //         lock.address,
  //         { client: { wallet: otherAccount } }
  //       );
  //       await expect(lockAsOtherAccount.write.withdraw()).to.be.rejectedWith(
  //         "You aren't the owner"
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.write.withdraw()).to.be.fulfilled;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount, publicClient } =
  //         await loadFixture(deployOneYearLockFixture);

  //       await time.increaseTo(unlockTime);

  //       const hash = await lock.write.withdraw();
  //       await publicClient.waitForTransactionReceipt({ hash });

  //       // get the withdrawal events in the latest block
  //       const withdrawalEvents = await lock.getEvents.Withdrawal();
  //       expect(withdrawalEvents).to.have.lengthOf(1);
  //       expect(withdrawalEvents[0].args.amount).to.equal(lockedAmount);
  //     });
  //   });
  // });
});
