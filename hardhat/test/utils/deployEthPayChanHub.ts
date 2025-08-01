import hre from "hardhat";

export async function deployEthPayChanHub() {
  // Contracts are deployed using the first signer/account by default
  const [owner, otherAccount] = await hre.viem.getWalletClients();

  const ethPayChanHub = await hre.viem.deployContract("EthPayChanHub");
  
  const publicClient = await hre.viem.getPublicClient();

  return {
    ethPayChanHub,
    owner,
    otherAccount,
    publicClient,
  };
} 