// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract EthWordMerkle is ReentrancyGuard {
    address public channelSender;
    address public channelRecipient;
    uint public startDate;
    uint public channelTimeout;
    bytes32 public root;

    constructor(address to, uint _timeout, bytes32 _root) public payable {
        require(msg.value > 0, "Initial balance must be greater than 0");
        channelRecipient = to;
        channelSender = msg.sender;
        startDate = block.timestamp;
        channelTimeout = _timeout;
        root = _root;
    }

    function addBalance(bytes32 _newRoot) public payable {
        if (root < _newRoot)
            root = keccak256(abi.encodePacked(root, _newRoot));
        else
            root = keccak256(abi.encodePacked(_newRoot, root));
    }

    function closeChannel(uint256 _amount, bytes32[] calldata proof) public {
        require(msg.sender == channelRecipient, "Only the recipient can close the channel");
        bytes32 computedHash = keccak256(abi.encodePacked(_amount));
        require(MerkleProof.verify(proof, root, computedHash), "Invalid proof");
        payable(channelRecipient).transfer(_amount);
        selfdestruct(payable(channelSender));
    }

    function verifyMerkle(bytes32 root, bytes32 leaf, bytes32[] calldata proof) public pure returns (bool) {
        bytes32 computedHash = leaf;
        for (uint256 i = 0; i < proof.length; i++) {
            if (computedHash < proof[i])
                computedHash = keccak256(abi.encodePacked(computedHash, proof[i]));
            else
                computedHash = keccak256(abi.encodePacked(proof[i], computedHash));
        }
        return computedHash == root;
    }

    function channelTimeout() public {
        require(block.timestamp >= startDate + channelTimeout, "Channel timeout has not been reached");
        selfdestruct(payable(channelSender));
    }
}
