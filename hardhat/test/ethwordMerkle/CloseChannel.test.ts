import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { bytesToHex, stringToBytes } from "viem";
import { deployEthWordMerkle, createHashchain } from "../utils/deployEthWordMerkle";

describe("CloseChannel", function () {
  describe("Channel Balance", function () {
    it("Should close the channel after sending the full amount and set balance to 0", async function () {
      const { ethWordMerkle, chainSize, otherAccount, publicClient } =
        await loadFixture(deployEthWordMerkle);

      const secret = stringToBytes("secret");
      const hashChain = createHashchain(secret, chainSize + 1);
      const proof = hashChain.slice(1); 
      
      const amount = await publicClient.getBalance({ address: ethWordMerkle.address });

      await ethWordMerkle.write.closeChannel(
        amount,
        0,
        proof.map(hash => bytesToHex(hash, { size: 32 })),
        { from: otherAccount.address }
      );

      expect(
        await publicClient.getBalance({ address: ethWordMerkle.address })
      ).to.equal(0n);
    });
  });
});
