import hre from "hardhat";

import { parseEther, stringToBytes } from "viem";

const hashM = 20;
const wordCount: number = 1000;
const wordsToConsume: bigint = 800n;
const secret: Uint8Array = stringToBytes("segredo", { size: 32 });
const amount: bigint = parseEther("1");

export async function deployEthWordPayChanHub() {
  // Contracts are deployed using the first signer/account by default
  const [owner, otherAccount] = await hre.viem.getWalletClients();

  const ethWordPayChanHub = await hre.viem.deployContract("EthWordPayChanHub");

  const publicClient = await hre.viem.getPublicClient();

  return {
    ethWordPayChanHub,
    owner,
    otherAccount,
    publicClient,
    hashM,
    wordCount,
    wordsToConsume,
    secret,
    amount,
  };
}
