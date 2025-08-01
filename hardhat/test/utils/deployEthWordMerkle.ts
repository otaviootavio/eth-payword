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

export async function deployEthWordMerkle() {
  const [owner, otherAccount] = await hre.viem.getWalletClients();
  const wordCount = 8;
  const amountInEth = "8";
  const defaultRecipient: `0x${string}` = otherAccount.account.address;

  //Create the secret
  const secret = stringToBytes("secret");

  //Use the secret to create the data
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

  const ethWordMerkle = await hre.viem.deployContract(
    "EthWordMerkle",
    [defaultRecipient, root, BigInt(wordCount)],
    { value: parseEther(amountInEth) }
  );

  const publicClient = await hre.viem.getPublicClient();

  return {
    merkleTree,
    ethWordMerkle,
    secret,
    wordCount,
    publicClient,
    amountInEth,
    merkleLeafsFromSecret,
    owner,
    otherAccount,
  };
}
