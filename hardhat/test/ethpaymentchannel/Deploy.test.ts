import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { parseEther } from "viem";
import { deployEthPaymentChannel } from "../utils/deployEthPaymentChannel";

describe("EthPaymentChannel Deployment", function () {
  it("Should deploy correctly with the correct recipient", async function () {
    const { ethPaymentChannel, otherAccount } = await loadFixture(
      deployEthPaymentChannel
    );

    expect(
      (await ethPaymentChannel.read.r() as string).toUpperCase()
    ).to.equal(otherAccount.account.address.toUpperCase());
  });

  it("Should deploy correctly with the correct sender", async function () {
    const { ethPaymentChannel, owner } = await loadFixture(
      deployEthPaymentChannel
    );

    expect(
      (await ethPaymentChannel.read.s() as string).toUpperCase()
    ).to.equal(owner.account.address.toUpperCase());
  });

  it("Should deploy correctly with correct initial balance", async function () {
    const { publicClient, ethPaymentChannel, depositAmount } = await loadFixture(
      deployEthPaymentChannel
    );

    expect(
      await publicClient.getBalance({ address: ethPaymentChannel.address })
    ).to.equal(depositAmount);
  });
}); 