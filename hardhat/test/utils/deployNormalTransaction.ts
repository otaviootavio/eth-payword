import hre from "hardhat";
import { parseEther } from "viem";

const chainSize: number = 50;
const transferAmount: bigint = parseEther("1");

export async function deployNormalTransaction() {
  // Get wallet clients
  const [sender, recipient] = await hre.viem.getWalletClients();
  
  const publicClient = await hre.viem.getPublicClient();
  
  // Get initial balances
  const senderInitialBalance = await publicClient.getBalance({ 
    address: sender.account.address 
  });
  const recipientInitialBalance = await publicClient.getBalance({ 
    address: recipient.account.address 
  });

  return {
    sender,
    recipient,
    transferAmount,
    chainSize,
    senderInitialBalance,
    recipientInitialBalance,
    publicClient,
  };
} 