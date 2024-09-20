import hre from "hardhat";
import { parseEther, stringToBytes, keccak256, bytesToHex, toHex } from "viem";

const chainSize: number = 8;
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

export function hashPair(left: Uint8Array, right: Uint8Array): Uint8Array {
  const concatenatedHash = Uint8Array.from([...left, ...right]);
  return keccak256(concatenatedHash, "bytes");
}

export function createMerkleTree(
  leaves: Uint8Array[]
): [Uint8Array[], Uint8Array] {
  let level: Uint8Array[] = leaves;
  let tree: Uint8Array[] = [...leaves];

  while (level.length > 1) {
    let newLevel: Uint8Array[] = [];

    for (let i = 0; i < level.length; i += 2) {
      if (i + 1 < level.length) {
        const combined = hashPair(level[i], level[i + 1]);
        newLevel.push(combined);
      } else {
        newLevel.push(level[i]);
      }
    }

    tree = tree.concat(newLevel);
    level = newLevel;
  }

  const root = level[0];
  return [tree, root];
}

export function createMerkleProofByIndexFromLeafs(
  index: number,
  leafs: Uint8Array[]
): Uint8Array[] {
  if (index < 0 || index >= leafs.length) {
    throw new Error("Index out of bounds");
  }

  const [tree, _] = createMerkleTree(leafs);
  const proof: Uint8Array[] = [];
  let currentIndex = index;
  let levelSize = leafs.length;
  let treeIndex = 0;
  proof.push(leafs[index]);

  while (levelSize > 1) {
    const isLeft = currentIndex % 2 === 0;
    const siblingIndex = isLeft ? currentIndex + 1 : currentIndex - 1;

    if (siblingIndex < levelSize) {
      proof.push(hashPair(tree[treeIndex], tree[siblingIndex]));
    }

    treeIndex += levelSize;
    levelSize = Math.ceil(levelSize / 2);
    currentIndex = Math.floor(currentIndex / 2);
  }

  return proof;
}

export async function deployEthWordMerkle() {
  const [owner, otherAccount] = await hre.viem.getWalletClients();
  const channelTimeout = BigInt(24 * 60 * 60);
  const wordCount = 10n;
  const defaultRecipient: `0x${string}` = otherAccount.account.address;

  const leaves = createHashchain(secret, chainSize);

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
