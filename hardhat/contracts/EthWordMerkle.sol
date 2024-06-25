// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract EthWordMerkle is ReentrancyGuard {
        address public channelSender;
        address public channelRecipient;
        uint public startDate;
        uint public channelTimeout;
        bytes32 public root;
    
        constructor(address to, uint _timeout, bytes32 _root) payable public {
            channelRecipient = to;
            channelSender = msg.sender;
            startDate = now;
            channelTimeout = _timeout;
            root = _root;
        }
      function CloseChannel(uint256 _amount, uint256 _random, bytes32[] proof) public {
            require(msg.sender==channelRecipient);
            bytes32 computedHash = keccak256(_amount,_random);
            for (uint256 i = 0; i < proof.length; i++) {
              bytes32 proofElement = proof[i];
              if (computedHash < proofElement)
                computedHash = keccak256(computedHash, proofElement);
              else
                computedHash = keccak256(proofElement, computedHash);
              }
            require(computedHash==root);
            channelRecipient.transfer(_amount);
        }
        function ChannelTimeout() public {
            require(now >= startDate + channelTimeout);
        }
    }