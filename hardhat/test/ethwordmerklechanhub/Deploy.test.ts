import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { deployEthWordMerkleChanHub } from "../utils/deployEthWordMerkleChanHub";

describe("EthWordMerkleChanHub Deployment", function () {
  it("Should deploy correctly and log gas cost", async function () {
    const { ethWordMerkleChanHub } = await loadFixture(
      deployEthWordMerkleChanHub
    );

    // Basic verification that the contract was deployed
    expect(ethWordMerkleChanHub.address).to.not.equal("0x0000000000000000000000000000000000000000");
  });
}); 