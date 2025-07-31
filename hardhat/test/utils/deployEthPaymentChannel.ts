import hre from "hardhat";
import { parseEther } from "viem";

export async function deployEthPaymentChannel() {
  // Contracts are deployed using the first signer/account by default
  const [owner, otherAccount] = await hre.viem.getWalletClients();

  const defaultRecipient: `0x${string}` = otherAccount.account.address;
  const depositAmount = parseEther("1"); // 1 ETH deposit

  const ethPaymentChannel = await hre.viem.deployContract(
    "EthPaymentChannel",
    [defaultRecipient],
    {
      value: depositAmount,
    }
  );

  const publicClient = await hre.viem.getPublicClient();

  return {
    ethPaymentChannel,
    depositAmount,
    owner,
    otherAccount,
    publicClient,
  };
} 