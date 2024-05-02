import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { bytesToHex } from "viem";
import { deployEthWord } from "../utils/deployEthWord";

describe("User", function () {
  it("Should receive the full channel balance", async function () {
    const {
      ethWord,
      chainSize,
      otherAccount,
      publicClient,
      hashChain,
      ammount,
    } = await loadFixture(deployEthWord);

    const initialOtherBalance = await publicClient.getBalance({
      address: otherAccount.account.address,
    });

    const txResponseId = await ethWord.write.closeChannel(
      [bytesToHex(hashChain[0], { size: 32 }), BigInt(chainSize)],
      { account: otherAccount.account }
    );

    const txReceipt = await publicClient.getTransactionReceipt({
      hash: txResponseId,
    });

    const gasUsed = BigInt(txReceipt.gasUsed.toString());
    const gasPriceUsed = BigInt(txReceipt.effectiveGasPrice);

    const actualFee = gasUsed * gasPriceUsed;

    const finalOtherBalance = await publicClient.getBalance({
      address: otherAccount.account.address,
    });

    expect(finalOtherBalance).to.equal(
      initialOtherBalance + ammount - actualFee
    );
  });

  it("Should receive one hash of the channel balance", async function () {
    const {
      ethWord,
      chainSize,
      otherAccount,
      publicClient,
      hashChain,
      ammount,
    } = await loadFixture(deployEthWord);

    const initialOtherBalance = await publicClient.getBalance({
      address: otherAccount.account.address,
    });

    const txResponseId = await ethWord.write.closeChannel(
      [bytesToHex(hashChain[chainSize - 1], { size: 32 }), BigInt(1)],
      { account: otherAccount.account }
    );

    const txReceipt = await publicClient.getTransactionReceipt({
      hash: txResponseId,
    });

    const gasUsed = BigInt(txReceipt.gasUsed.toString());
    const gasPriceUsed = BigInt(txReceipt.effectiveGasPrice);

    const actualFee = gasUsed * gasPriceUsed;

    const finalOtherBalance = await publicClient.getBalance({
      address: otherAccount.account.address,
    });

    const ammountOneHash = ammount / BigInt(chainSize);

    expect(finalOtherBalance).to.equal(
      initialOtherBalance + ammountOneHash - actualFee
    );
  });

  it("Should receive M hash of the channel balance", async function () {
    const {
      ethWord,
      chainSize,
      otherAccount,
      publicClient,
      hashChain,
      ammount,
    } = await loadFixture(deployEthWord);

    const M = 4;

    const initialOtherBalance = await publicClient.getBalance({
      address: otherAccount.account.address,
    });

    const txResponseId = await ethWord.write.closeChannel(
      [bytesToHex(hashChain[chainSize - M], { size: 32 }), BigInt(M)],
      { account: otherAccount.account }
    );

    const txReceipt = await publicClient.getTransactionReceipt({
      hash: txResponseId,
    });

    const gasUsed = BigInt(txReceipt.gasUsed.toString());
    const gasPriceUsed = BigInt(txReceipt.effectiveGasPrice);

    const actualFee = gasUsed * gasPriceUsed;

    const finalOtherBalance = await publicClient.getBalance({
      address: otherAccount.account.address,
    });

    const ammountToMHashes = (BigInt(M) * ammount) / BigInt(chainSize);

    expect(finalOtherBalance).to.equal(
      initialOtherBalance + ammountToMHashes - actualFee
    );
  });
});
