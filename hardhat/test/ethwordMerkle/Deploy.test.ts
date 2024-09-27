import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import {
  parseEther,
  stringToBytes,
  toHex,
} from "viem";
import {
  deployEthWordMerkle,
} from "../utils/deployEthWordMerkle";

describe("EthWordMerkle Deployment", function () {
  it("Should deploy correctly with the correct recipient", async function () {
    const { ethWordMerkle, otherAccount } = await loadFixture(
      deployEthWordMerkle
    );

    expect(
      (await ethWordMerkle.read.channelRecipient()).toUpperCase()
    ).to.equal(otherAccount.account.address.toUpperCase());
  });

  it("Should deploy correctly with the correct word count", async function () {
    const { ethWordMerkle, wordCount } = await loadFixture(deployEthWordMerkle);

    expect(await ethWordMerkle.read.totalWordCount()).to.equal(
      BigInt(wordCount)
    );
  });

  it("Should deploy correctly with the correct root", async function () {
    const { ethWordMerkle, merkleTree } = await loadFixture(
      deployEthWordMerkle
    );

    
    
    expect((await ethWordMerkle.read.root()).toUpperCase()).to.equal(
      merkleTree.getHexRoot().toUpperCase()
    );
  });

  it("Should deploy correctly with correct initial balance", async function () {
    const { publicClient, ethWordMerkle, amountInEth } = await loadFixture(
      deployEthWordMerkle
    );

    expect(
      await publicClient.getBalance({ address: ethWordMerkle.address })
    ).to.equal(parseEther(amountInEth));
  });
});
