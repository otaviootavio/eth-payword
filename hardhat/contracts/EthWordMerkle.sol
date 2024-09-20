// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;
import "hardhat/console.sol";

contract EthWordMerkle {
    address payable public immutable channelSender;
    address payable public immutable channelRecipient;
    uint256 public immutable startDate;
    uint256 public immutable channelTimeout;
    bytes32 public immutable root;
    uint256 public totalWordCount;

    constructor(
        address to,
        uint256 _timeout,
        bytes32 _root,
        uint256 wordCount
    ) payable {
        require(to != address(0), "Recipient address cannot be zero address.");
        require(wordCount > 0, "Word count must be positive.");

        channelRecipient = payable(to);
        channelSender = payable(msg.sender);
        startDate = block.timestamp;
        channelTimeout = _timeout;
        root = _root;
        totalWordCount = wordCount;
    }

    function closeChannel(
        bytes32[] calldata proof,
        bytes32 secret,
        uint256 index
    ) external {
        require(
            msg.sender == channelRecipient,
            "Only the channel recipient can close the channel."
        );

        // Compute hash of (secret + index)
        bytes32 computedHash = keccak256(abi.encodePacked(index, secret));

        // Assert if this hash matches with the last item of the merkle tree
        require(computedHash == proof[0], "Invalid secret or index");

        // Validate the merkle proof
        bool isValid = validateMerkleProof(proof);
        require(isValid, "Invalid Merkle proof.");

        // If we've reached here, the data is valid. Proceed with channel closure
        uint256 amountToWithdraw = calculateWithdrawAmount(index);

        (bool success, ) = channelRecipient.call{value: amountToWithdraw}("");
        require(success, "Transfer failed.");

        totalWordCount = totalWordCount - index;
    }

    function simulateCloseChannel(
        bytes32[] calldata proof,
        bytes32 secret,
        uint256 index
    ) external view returns (bool, uint256) {
        require(
            msg.sender == channelRecipient,
            "Only the channel recipient can simulate closing the channel."
        );

        // Compute hash of (secret + index)
        bytes32 computedHash = keccak256(abi.encodePacked(secret, index));

        // Check if this hash matches with the last item of the merkle tree
        if (computedHash != proof[proof.length - 1]) {
            return (false, 0);
        }

        // Validate the merkle proof
        bool isValid = validateMerkleProof(proof);
        if (!isValid) {
            return (false, 0);
        }

        uint256 amountToWithdraw = calculateWithdrawAmount(index);
        return (true, amountToWithdraw);
    }

    function validateMerkleProof(
        bytes32[] calldata proof
    ) private view returns (bool) {
        bytes32 computedHash = proof[0];
        console.log("Initial computed hash:");
        console.logBytes32(computedHash);

        for (uint256 i = 1; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            console.log("Proof element %d:", i);
            console.logBytes32(proofElement);

            computedHash = keccak256(
                abi.encodePacked(computedHash, proofElement)
            );
            console.log("Computed hash after element %d:", i);
            console.logBytes32(computedHash);
        }

        console.log("Final computed hash:");
        console.logBytes32(computedHash);
        console.log("Root:");
        console.logBytes32(root);

        bool isValid = computedHash == root;
        console.log("Is valid: %s", isValid ? "true" : "false");

        return isValid;
    }

    function calculateWithdrawAmount(
        uint256 _amount
    ) private view returns (uint256) {
        uint256 remainingWords = totalWordCount - _amount;
        if (remainingWords == 0) {
            return address(this).balance;
        }
        uint256 initialWordPrice = address(this).balance / totalWordCount;
        return initialWordPrice * _amount;
    }
}
