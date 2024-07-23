import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { keccak256, parseEther } from "viem";
import { deployEthWordMerkle, createMerkleRoot } from "../utils/deployEthWordMerkle";

describe("User", function () {
  it("Should receive the full channel balance on closing the channel with all words", async function () {
    const {
      ethWordMerkle,
      otherAccount,
      publicClient,
      wordCount,
      randomness,
      root,
    } = await loadFixture(deployEthWordMerkle);

    const words = Array.from({length: wordCount}, (_, i) => i + 1);
    const [computedRoot, proof] = createMerkleRoot(words, randomness);

    // Ensure the computed root matches the stored root to simulate valid channel closure
    expect(computedRoot).to.equal(root);

    const initialOtherBalance = await publicClient.getBalance({
      address: otherAccount.account.address,
    });

    const txResponseId = await ethWordMerkle.write.closeChannel(wordCount, randomness, proof, {
      account: otherAccount.account
    });

    const txReceipt = await publicClient.getTransactionReceipt({
      hash: txResponseId,
    });

    const gasUsed = BigInt(txReceipt.gasUsed.toString());
    const gasPriceUsed = BigInt(txReceipt.effectiveGasPrice);
    const actualFee = gasUsed * gasPriceUsed;
    const finalOtherBalance = await publicClient.getBalance({
      address: otherAccount.account.address,
    });

    // Here we assume that closing the channel with all words will allow the user to withdraw the full balance
    expect(finalOtherBalance).to.equal(initialOtherBalance + parseEther("1") - actualFee);
  });

  it("Should receive a fraction of the channel balance based on a valid subset of words", async function () {
    const {
      ethWordMerkle,
      otherAccount,
      publicClient,
      wordCount,
      randomness
    } = await loadFixture(deployEthWordMerkle);

    const wordsSubset = [1, 2, 3]; // Example subset of words for the test
    const [_, proofSubset] = createMerkleRoot(wordsSubset, randomness);

    const initialOtherBalance = await publicClient.getBalance({
      address: otherAccount.account.address,
    });

    const amountOfWordsToClose = wordsSubset.length;
    const txResponseId = await ethWordMerkle.write.closeChannel(amountOfWordsToClose, randomness, proofSubset, {
      account: otherAccount.account
    });

    const txReceipt = await publicClient.getTransactionReceipt({
      hash: txResponseId,
    });

    const gasUsed = BigInt(txReceipt.gasUsed.toString());
    const gasPriceUsed = BigInt(txReceipt.effectiveGasPrice);
    const actualFee = gasUsed * gasPriceUsed;

    const finalOtherBalance = await publicClient.getBalance({
      address: otherAccount.account.address,
    });

    const expectedAmount = (parseEther("1") * BigInt(amountOfWordsToClose)) / BigInt(wordCount);

    expect(finalOtherBalance).to.equal(initialOtherBalance + expectedAmount - actualFee);
  });
});
