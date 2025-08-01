import hre from "hardhat";
import { MerkleTree } from "merkletreejs";
import {
  stringToBytes,
  keccak256,
  toHex,
  encodePacked,
  parseEther,
  Hex,
} from "viem";

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

export async function deployEthWordMerkleChanHub() {
  // Contracts are deployed using the first signer/account by default
  const [owner, otherAccount] = await hre.viem.getWalletClients();

  const ethWordMerkleChanHub = await hre.viem.deployContract("EthWordMerkleChanHub");

  const publicClient = await hre.viem.getPublicClient();

  // Merkle tree setup
  const wordCount = 2**8;
  const secret = stringToBytes("secret");
  const hashChainFromSecret: Uint8Array[] = createHashchain(secret, wordCount);

  type MerkleLeaf = { secret: Hex };

  const getHash = (leaf: MerkleLeaf): Hex =>
    keccak256(encodePacked(["bytes32"], [leaf.secret]));

  const createMerkleTree = (leaves: MerkleLeaf[]): MerkleTree =>
    new MerkleTree(leaves.map(getHash), keccak256, { sort: true });

  const merkleLeafsFromSecret = hashChainFromSecret.map((leaf) => ({
    secret: toHex(leaf, { size: 32 }),
  }));

  const merkleTree = createMerkleTree(merkleLeafsFromSecret);
  const root: `0x${string}` = merkleTree.getHexRoot() as `0x${string}`;

  // Global parameters
  const hashM = 20;
  const wordsToConsume: bigint = 4n;
  const amount: bigint = parseEther("1");

  return {
    ethWordMerkleChanHub,
    owner,
    otherAccount,
    publicClient,
    hashM,
    wordCount,
    wordsToConsume,
    secret,
    amount,
    merkleTree,
    root,
    merkleLeafsFromSecret,
  };
} 