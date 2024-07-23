import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { bytesToHex } from "viem";
import { deployEthWordMerkle, hashM } from "../utils/deployEthWordMerkle";

describe("CloseChannel", function () {
  describe("Channel Balance", function () {
    it("Should close the channel after sending the full amount and set balance to 0", async function () {
      const { ethWordMerkle, chainSize, otherAccount, publicClient, hashChain } =
        await loadFixture(deployEthWordMerkle);

      await ethWordMerkle.write.closeChannel(
        [bytesToHex(hashChain[0], { size: 32 }), BigInt(chainSize)],
        { account: otherAccount.account }
      );

      expect(
        await publicClient.getBalance({ address: ethWordMerkle.address })
      ).to.equal(0n);
    });
  });
});
