// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract EthWordMerkle is ReentrancyGuard {
    address payable public channelSender;
    address payable public channelRecipient;
    uint public totalWordCount;
    bytes32 public merkleRoot;

    constructor(address to, uint wordCount, bytes32 root) payable {
        require(to != address(0), "Recipient cannot be the zero address");
        require(wordCount > 0, "Word count must be positive");
        require(root != 0, "Initial root cannot be zero");

        channelRecipient = payable(to);
        channelSender = payable(msg.sender);
        totalWordCount = wordCount;
        merkleRoot = root;
    }

    function closeChannel(bytes32[] calldata proof, bytes32 leaf, uint _wordCount) public nonReentrant {
        require(msg.sender == channelRecipient, "Only the recipient can close the channel");
        require(_wordCount <= totalWordCount, "Word count exceeds available words");

        bool isValid = MerkleProof.verify(proof, merkleRoot, leaf);
        require(isValid, "Invalid proof or WordCount!");

        uint amountToWithdraw = calculateWithdrawAmount(_wordCount);
        (bool sent, ) = channelRecipient.call{value: amountToWithdraw}("");
        require(sent, "Failed to send Ether");

        totalWordCount -= _wordCount;
    }

    function simulateCloseChannel(
        bytes32[] calldata proof,
        bytes32 leaf,
        uint _wordCount
    ) public view returns (bool, uint) {
        require(
            msg.sender == channelRecipient,
            "Only the recipient can simulate closing the channel"
        );

        bool isValid = validateChannelClosure(proof, leaf);
        if (!isValid) {
            return (false, 0);
        }

        uint amountToWithdraw = calculateWithdrawAmount(_wordCount);
        return (true, amountToWithdraw);
    }

    function validateChannelClosure(
        bytes32[] calldata proof,
        bytes32 leaf
    ) private view returns (bool) {
        return MerkleProof.verify(proof, merkleRoot, leaf);
    }

    function calculateWithdrawAmount(uint _wordCount) private view returns (uint) {
        uint remainingWords = totalWordCount - _wordCount;
        if (remainingWords == 0) {
            return address(this).balance;
        }
        uint initialWordPrice = address(this).balance / totalWordCount;
        return initialWordPrice * _wordCount;
    }
}
