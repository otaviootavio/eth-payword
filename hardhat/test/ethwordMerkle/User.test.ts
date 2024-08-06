import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { bytesToHex } from "viem";
import { deployEthWordMerkle, createMerkleTree, createHashchain } from "../utils/deployEthWordMerkle";

describe("EthWordMerkle", function() {
  it("Should close the channel with valid Merkle proof and withdraw correctly", async function() {
    const {
      ethWordMerkle,
      publicClient,
      otherAccount,
      amount,
      chainSize,
      secret,
    } = await loadFixture(deployEthWordMerkle);

    const initialOtherBalance = await publicClient.getBalance({
      address: otherAccount.account.address,
    });

    const leaves = createHashchain(secret, chainSize + 1);
    const [merkleTree, merkleRoot] = createMerkleTree(leaves);
    const proofIndex = chainSize - 1; 
    const proof = merkleTree.slice(proofIndex, proofIndex + 1); 

    const txResponseId = await ethWordMerkle.write.closeChannel(
      BigInt(1), 
      BigInt(0), 
      proof.map(hash => `0x${bytesToHex(hash, { size: 32 })}`)
      { account: otherAccount.account }
    );

    const txReceipt = await publicClient.getTransactionReceipt({
      hash: txResponseId,
    });

    const gasUsed = BigInt(txReceipt.gasUsed.toString());
    const gasPriceUsed = BigInt(txReceipt.effectiveGasPrice);

    const actualFee = gasUsed * gasPriceUsed;

    const finalOtherBalance = await publicClient.getBalance({
      address: otherAccount.account.address,
    });

    const amountToWithdraw = (BigInt(1) * amount) / BigInt(chainSize);

    expect(finalOtherBalance).to.equal(
      initialOtherBalance + amountToWithdraw - actualFee
    );
  });
});
