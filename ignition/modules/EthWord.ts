import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther, keccak256 } from "viem";

function toHex(str: string): `0x${string}` {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16);
  }
  return `0x${hex}`;
}

function createHashchain(secret: string, length: number): string[] {
  let currentHash = keccak256(toHex(secret));
  const hashChain = [currentHash];

  for (let i = 1; i < length; i++) {
    currentHash = keccak256(`0x${currentHash.slice(2)}`);
    hashChain.push(currentHash);
  }

  return hashChain;
}

const defaultRecipient = "0xaE4AD8b8d35dbB74259cc1Be3090A33a5Ee4999f";
const hashChain = createHashchain("secret", 20);
const tip = hashChain[19];
const wordCount = 20;
const initialBalance = parseEther("0.0001");

const EthWordModule = buildModule("EthWord", (m) => {
  const recipient = m.getParameter("recipient", defaultRecipient);
  const wordCountParam = m.getParameter("wordCount", wordCount);
  const tipParam = m.getParameter("tip", tip);

  const ethWord = m.contract("EthWord", [recipient, wordCountParam, tipParam], {
    value: initialBalance,
  });

  console.log("Receipient:" + JSON.stringify(recipient.defaultValue));
  console.log("Word count:" + JSON.stringify(wordCountParam.defaultValue));
  console.log("Tip:" + JSON.stringify(tipParam.defaultValue));
  console.log("Hashchain: " + hashChain);

  return { ethWord };
});

export default EthWordModule;
