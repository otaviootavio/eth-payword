import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import {
  parseEther,
  keccak256,
  bytesToHex,
  stringToBytes,
  toBytes,
  pad,
} from "viem";
import {
  createHashchain,
  createMerkleTree,
} from "../utils/deployEthWordMerkle";

const chainSize: number = 1000;
const secret: Uint8Array = stringToBytes("secret");
const amount: bigint = parseEther("1");

async function deployEthWordMerkle() {
  const [owner, otherAccount] = await hre.viem.getWalletClients();
  const channelTimeout = BigInt(24 * 60 * 60);
  const wordCount = 10n;
  const defaultRecipient: `0x${string}` = otherAccount.account.address;
  console.log(defaultRecipient);

  const leaves = createHashchain(secret, chainSize + 1);
  const [merkleTree, merkleRoot] = createMerkleTree(leaves);

  const ethWordMerkle = await hre.viem.deployContract(
    "EthWordMerkle",
    [defaultRecipient, channelTimeout, bytesToHex(merkleRoot), wordCount],
    { value: amount }
  );

  const publicClient = await hre.viem.getPublicClient();

  return {
    chainSize,
    merkleTree,
    ethWordMerkle,
    secret,
    wordCount,
    publicClient,
    merkleRoot: bytesToHex(merkleRoot),
    amount,
    owner,
    otherAccount,
  };
}

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
    const { ethWordMerkle, merkleRoot } = await loadFixture(
      deployEthWordMerkle
    );
    console.log("fc do contrato ", await ethWordMerkle.read.root());

    expect((await ethWordMerkle.read.root()).toUpperCase()).to.equal(
      merkleRoot.toUpperCase()
    );
  });

  it("Should deploy correctly with correct initial balance", async function () {
    const { publicClient, ethWordMerkle, owner } = await loadFixture(
      deployEthWordMerkle
    );

    expect(
      await publicClient.getBalance({ address: ethWordMerkle.address })
    ).to.equal(parseEther("1"));
  });
});
