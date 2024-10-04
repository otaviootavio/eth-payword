import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther, keccak256, toHex } from "viem";

function createHashchain(secret: string, length: number): string[] {
  let currentHash = keccak256(toHex(secret));
  const hashChain = [currentHash];

  for (let i = 1; i < length; i++) {
    currentHash = keccak256(`0x${currentHash.slice(2)}`);
    hashChain.push(currentHash);
  }

  return hashChain;
}

function hashPair(left: Uint8Array, right: Uint8Array): Uint8Array {
  const concatenatedHash = Uint8Array.from([...left, ...right]);
  return keccak256(concatenatedHash, "bytes");
}

function createMerkleTree(leaves: Uint8Array[]): [Uint8Array[], Uint8Array] {
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


const defaultRecipient = "0xdD2FD4581271e230360230F9337D5c0430Bf44C0";
const hashChain = createHashchain("secret", 21);
const tip = hashChain[20];
const wordCount = 20;
const initialBalance = parseEther("20");

const EthWordMerkleModule = buildModule("EthWordMerkle", (m) => {
  const recipient = m.getParameter("recipient", defaultRecipient);
  const wordCountParam = m.getParameter("wordCount", wordCount);
  const tipParam = m.getParameter("tip", tip);
  const timeoutParam = m.getParameter("timeout", 86400);

  const leaves = hashChain.map((hash) => Buffer.from(hash.slice(2), 'hex'));
  const [tree, root] = createMerkleTree(leaves);

  const rootHex = Buffer.from(root).toString('hex');

  const ethWordMerkle = m.contract("EthWordMerkle", [recipient, timeoutParam, `0x${rootHex}`, wordCountParam], {
    value: initialBalance,
  });
  
  console.log("Receipient:" + JSON.stringify(recipient.defaultValue));
  console.log("Word count:" + JSON.stringify(wordCountParam.defaultValue));
  console.log("Tip:" + JSON.stringify(tipParam.defaultValue));
  console.log("Timeout:" + JSON.stringify(timeoutParam.defaultValue));
  console.log("Hashchain: " + hashChain);

  return { ethWordMerkle };
});

export default EthWordMerkleModule;
