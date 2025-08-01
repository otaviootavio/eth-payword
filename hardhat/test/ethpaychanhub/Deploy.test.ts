import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { deployEthPayChanHub } from "../utils/deployEthPayChanHub";

describe("EthPayChanHub Deployment", function () {
  it("Should deploy correctly and log gas cost", async function () {
    const { ethPayChanHub } = await loadFixture(
      deployEthPayChanHub
    );

    // Basic verification that the contract was deployed
    expect(ethPayChanHub.address).to.not.equal("0x0000000000000000000000000000000000000000");
  });
}); 