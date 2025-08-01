// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;
import "hardhat/console.sol";

contract EthWordMerkle {
    // Custom errors for gas optimization
    error ZeroAddress();
    error InvalidWordCount();
    error OnlyRecipient();
    error InvalidMerkleProof();
    error TransferFailed();

    address payable public immutable channelSender;
    address payable public immutable channelRecipient;
    uint256 public immutable startDate;
    bytes32 public immutable root;
    uint256 public totalWordCount;

    constructor(
        address to,
        bytes32 _root,
        uint256 wordCount
    ) payable {
        if (to == address(0)) revert ZeroAddress();
        if (wordCount == 0) revert InvalidWordCount();

        channelRecipient = payable(to);
        channelSender = payable(msg.sender);
        startDate = block.timestamp;
        root = _root;
        totalWordCount = wordCount;
    }

    function closeChannel(
        bytes32[] calldata proof,
        bytes32 secret,
        uint256 index
    ) external {
        if (msg.sender != channelRecipient) revert OnlyRecipient();
        // Validate the merkle proof
        bool isValid = verify(proof, root, secret);
        if (!isValid) revert InvalidMerkleProof();

        // If we've reached here, the data is valid. Proceed with channel closure
        uint256 amountToWithdraw = calculateWithdrawAmount(index + 1);

        (bool success, ) = channelRecipient.call{value: amountToWithdraw}("");
        if (!success) revert TransferFailed();
    }

    function verify(
        bytes32[] calldata _proof,
        bytes32 _root,
        bytes32 _leaf
    ) public pure returns (bool) {
        bytes32 computedHash = _leaf;

        for (uint256 i = 0; i < _proof.length; i++) {
            bytes32 proofElement = _proof[i];

            if (computedHash <= proofElement) {
                // Hash(current computed hash + current element of the proof)
                computedHash = keccak256(
                    abi.encodePacked(computedHash, proofElement)
                );
            } else {
                // Hash(current element of the proof + current computed hash)
                computedHash = keccak256(
                    abi.encodePacked(proofElement, computedHash)
                );
            }
        }

        // Check if the computed hash (root) is equal to the provided root
        return computedHash == _root;
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
