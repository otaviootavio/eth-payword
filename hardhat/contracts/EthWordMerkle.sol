// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract EthWordMerkle is ReentrancyGuard {
    address public immutable channelSender;
    address public immutable channelRecipient;
    uint256 public immutable startDate;
    uint256 public immutable channelTimeout;
    bytes32 public immutable root;
    constructor(address to, uint256 _timeout, bytes32 _root) payable {
        require(to != address(0), "Recipient address cannot be zero address.");
        channelRecipient = to;
        channelSender = msg.sender;
        startDate = block.timestamp;
        channelTimeout = _timeout;
        root = _root;
    }

    function closeChannel(uint256 _amount, uint256 _random, bytes32[] calldata proof) external nonReentrant {
        require(msg.sender == channelRecipient, "Only the channel recipient can close the channel.");
        
        bytes32 computedHash = keccak256(abi.encodePacked(_amount, _random));
        
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            if (computedHash < proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        
        require(computedHash == root, "Invalid Merkle proof.");
        
        (bool success, ) = channelRecipient.call{value: _amount}("");
        require(success, "Transfer failed.");
    }

    // function channelTimeout() external nonReentrant {
    //     require(block.timestamp >= startDate + channelTimeout, "Channel timeout not reached.");
    //     require(msg.sender == channelSender, "Only the channel sender can reclaim the funds.");
        
    //     (bool success, ) = channelSender.call{value: address(this).balance}("");
    //     require(success, "Transfer failed.");
    // }
}
