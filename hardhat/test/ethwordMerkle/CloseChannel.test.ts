import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { bytesToHex, stringToBytes, toHex } from "viem";
import { deployEthWordMerkle, createHashchain } from "../utils/deployEthWordMerkle";

describe("CloseChannel", function () {
  describe("Channel Balance", function () {
    it("Should close the channel after sending the full amount and set balance to 0", async function () {
      const { ethWordMerkle, chainSize, otherAccount, publicClient } =
        await loadFixture(deployEthWordMerkle);

      const secret = stringToBytes("secret");
      const hashChain = createHashchain(secret, chainSize + 1);
      const proof = hashChain.slice(1); 
      const hexProof = proof.map(hash => bytesToHex(hash, { size: 32 }));
      const hexHash = toHex(hashChain[0], { size: 32 });
      
      const amount = await publicClient.getBalance({ address: ethWordMerkle.address });
      const bigAmount = BigInt(amount);

      await ethWordMerkle.write.closeChannel(
        [bigAmount,
        hexHash,
        hexProof],
        {account: otherAccount.account}
      );

      expect(
        await publicClient.getBalance({ address: ethWordMerkle.address })
      ).to.equal(0n);
    });
  });
});
