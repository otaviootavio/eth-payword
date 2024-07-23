import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { parseEther, keccak256, bytesToHex } from "viem";

function createMerkleRoot(words: number[], randomness: number): [bytes32, bytes32[]] {
  let leafNodes = words.map((word, index) => keccak256(abi.encodePacked(word, randomness + index), "bytes32"));
  let proof = [];
  while (leafNodes.length > 1) {
    let temp = [];
    for (let i = 0; i < leafNodes.length; i += 2) {
      let left = leafNodes[i];
      let right = i + 1 < leafNodes.length ? leafNodes[i + 1] : left;
      temp.push(keccak256(abi.encodePacked(left, right), "bytes32"));
      if (right === left) proof.push(left);
      else proof.push(right);
    }
    leafNodes = temp;
  }
  return [leafNodes[0], proof];
}

async function deployEthWordMerkle() {
  const channelTimeout = 24 * 60 * 60; // 1 day
  const wordCount = 10;
  const randomness = 1234;

  const words = Array.from({length: wordCount}, (_, i) => i + 1);
  const [root, proof] = createMerkleRoot(words, randomness);

  const [owner, otherAccount] = await hre.viem.getWalletClients();

  const ethWordMerkle = await hre.viem.deployContract(
    "EthWordMerkle",
    [otherAccount.account.address, channelTimeout, root, wordCount],
    { value: parseEther("1") }
  );

  return {
    ethWordMerkle,
    wordCount,
    owner,
    otherAccount,
    proof,
    root,
    channelTimeout,
    randomness
  };
}

describe("EthWordMerkle Deployment", function () {
  it("Should deploy correctly with the correct recipient", async function () {
    const { ethWordMerkle, otherAccount } = await loadFixture(deployEthWordMerkle);

    expect(await ethWordMerkle.read.channelRecipient()).to.equal(otherAccount.account.address);
  });

  it("Should deploy correctly with the correct word count", async function () {
    const { ethWordMerkle, wordCount } = await loadFixture(deployEthWordMerkle);

    expect(await ethWordMerkle.read.totalWordCount()).to.equal(BigInt(wordCount));
  });

  it("Should deploy correctly with the correct root", async function () {
    const { ethWordMerkle, root } = await loadFixture(deployEthWordMerkle);

    expect(await ethWordMerkle.read.root()).to.equal(root);
  });

  it("Should deploy correctly with correct initial balance", async function () {
    const { publicClient, ethWordMerkle, owner } = await loadFixture(deployEthWordMerkle);

    expect(await publicClient.getBalance({ address: ethWordMerkle.address })).to.equal(parseEther("1"));
  });

  it("Should handle close channel with valid Merkle proof", async function () {
    const { ethWordMerkle, proof, wordCount } = await loadFixture(deployEthWordMerkle);
    const amountToClose = 5;
    const randomValue = 1235;

    const result = await ethWordMerkle.call.closeChannel(amountToClose, randomValue, proof);

    expect(result.success).to.be.true;
    expect(await ethWordMerkle.read.totalWordCount()).to.equal(BigInt(wordCount - amountToClose));
  });
});
