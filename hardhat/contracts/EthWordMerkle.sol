// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract EthWordMerkle is ReentrancyGuard {
        address public channelSender;
        address public channelRecipient;
        uint public startDate;
        uint public channelTimeout;
        bytes32 public root;
    
        constructor(address to, uint _timeout, bytes32 _root) public payable {
            require(msg.value>0);
            channelRecipient = to;
            channelSender = msg.sender;
            startDate = now;
            channelTimeout = _timeout;
            root = _root;
        }
        function AddBalance(bytes32 _newRoot) public payable {
          if (root < _newRoot)
              root = keccak256(root, _newRoot);
          else
              root = keccak256(_newRoot, root);
        }
      function CloseChannel(uint256 _amount, bytes32[] proof) public {
            require(msg.sender == channelRecipient);
            bytes32 computedHash = keccak256(_amount);
            require(verifyMerkle(root, computedHash, proof));
            channelRecipient.transfer(_amount);
            selfdestruct(channelSender);
        }
        function verifyMerkle (bytes32 root, bytes32 leaf, bytes32[] proof) public pure returns (bool) {
          bytes32 computedHash = leaf;
          for (uint256 i = 0; i < proof.length; i++) {
              if (computedHash < proof[i])
                computedHash = keccak256(computedHash, proof[i]);
              else
                computedHash = keccak256(proof[i], computedHash);
              }
            return computedHash==root;
        }
        function ChannelTimeout() public {
            require(now >= startDate + channelTimeout);
            selfdestruct(channelSender);
        }
    }