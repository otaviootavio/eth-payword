import hre from "hardhat";
import { parseEther, stringToBytes, keccak256, bytesToHex } from "viem";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";

export const hashM = 100;
const chainSize: number = 1000;
const secret: Uint8Array = stringToBytes("secret");
const amount: bigint = parseEther("1");

export function createHashchain(
  secret: Uint8Array,
  length: number
): Uint8Array[] {
  let currentHash: Uint8Array = keccak256(secret, "bytes");
  const hashChain: Uint8Array[] = [currentHash];

  for (let i = 1; i < length; i++) {
    currentHash = keccak256(currentHash, "bytes");
    hashChain.push(currentHash);
  }

  return hashChain;
}

function createMerkleTree(values: Uint8Array[]): Uint8Array {
  const tree = StandardMerkleTree.of(values, ["bytes", "uint8"]);

  fs.writeFileSync("tree.json", JSON.stringify(tree.dump()));
  return tree;
}

function getMerkleRoot(tree: Uint8Array): Uint8Array {
  const tree = StandardMerkleTree.load(JSON.parse(fs.readFileSync("tree.json", "uint8")));

  return tree.root;
}


export async function deployEthWordMerkle() {
  const [owner, otherAccount] = await hre.viem.getWalletClients();
  const defaultRecipient = `0x${otherAccount.account.address}`;

  let leaves: Uint8Array[] = [];

  leaves = createHashchain(secret, chainSize + 1);
  const root = getMerkleRoot(leaves);
  const wordCount = BigInt(chainSize);

  const merkleTree = createMerkleTree(leaves);
  const merkleRoot = getMerkleRoot(merkleTree);

  const ethWordMerkle = await hre.viem.deployContract(
    "EthWordMerkle",
    [defaultRecipient, bytesToHex(merkleRoot, { size: 32 })],
    { value: amount }
  );

  return {
    chainSize,
    merkleTree,
    ethWordMerkle,
    secret,
    amount,
    owner,
    otherAccount,
  };
}


