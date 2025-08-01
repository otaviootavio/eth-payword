import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { deployEthWordPayChanHub } from "../utils/deployEthWordPayChanHub";

describe("EthWordPayChanHub Deployment", function () {
  it("Should deploy correctly and log gas cost", async function () {
    const { ethWordPayChanHub } = await loadFixture(
      deployEthWordPayChanHub
    );

    // Basic verification that the contract was deployed
    expect(ethWordPayChanHub.address).to.not.equal("0x0000000000000000000000000000000000000000");
  });
}); 