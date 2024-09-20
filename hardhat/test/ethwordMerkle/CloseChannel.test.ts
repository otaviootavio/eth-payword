import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import {
  bytesToHex,
  encodePacked,
  Hex,
  keccak256,
  size,
  stringToBytes,
  toBytes,
  toHex,
} from "viem";
import {
  deployEthWordMerkle,
  createHashchain,
  createMerkleProofByIndexFromLeafs,
} from "../utils/deployEthWordMerkle";

describe("CloseChannel", function () {
  describe("Channel Balance", function () {
    it("Should close the channel after sending the full amount and set balance to 0", async function () {
      const { ethWordMerkle, chainSize, otherAccount, publicClient } =
        await loadFixture(deployEthWordMerkle);

      const secret = stringToBytes("secret");
      const chainOfSecrets: Uint8Array[] = createHashchain(secret, chainSize);

      type Token = {
        index: number;
        secret: Uint8Array;
      };

      const chainOfTokens: Token[] = chainOfSecrets.map(
        (secret: Uint8Array, index: number): Token => {
          return {
            index,
            secret,
          };
        }
      );

      const chainOfTokensHashes: Uint8Array[] = chainOfTokens.map(
        (token: Token): Uint8Array => {
          const tokenEncoded: Hex = encodePacked(
            ["uint256", "bytes"],
            [BigInt(token.index), toHex(token.secret, { size: 32 })]
          );
          return keccak256(tokenEncoded, "bytes");
        }
      );

      const proofForIndex0: `0x${string}`[] = createMerkleProofByIndexFromLeafs(
        0,
        chainOfTokensHashes
      ).map((hash) => bytesToHex(hash, { size: 32 }));

      const amount = await publicClient.getBalance({
        address: ethWordMerkle.address,
      });
      const bigAmount = BigInt(amount);

      console.log("proofForIndex0", proofForIndex0);
      console.log(
        "kekkac hash of index 0",
        toHex(
          keccak256(
            encodePacked(
              ["uint256", "bytes"],
              [
                BigInt(chainOfTokens[0].index),
                toHex(chainOfTokens[0].secret, { size: 32 }),
              ]
            ),
            "bytes"
          )
        )
      );
      await ethWordMerkle.write.closeChannel(
        [
          proofForIndex0,
          toHex(chainOfTokens[0].secret, { size: 32 }),
          BigInt(chainOfTokens[0].index),
        ],
        {
          account: otherAccount.account,
        }
      );

      expect(
        // await publicClient.getBalance({ address: ethWordMerkle.address })
        1n
      ).to.equal(0n);
    });
  });
});
