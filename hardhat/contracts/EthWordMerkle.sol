    // SPDX-License-Identifier: UNLICENSED
    pragma solidity ^0.8.19;

    contract EthWordMerkle {
        address payable public immutable channelSender;
        address payable public immutable channelRecipient;
        uint256 public immutable startDate;
        uint256 public immutable channelTimeout;
        bytes32 public immutable root;
        uint256 public totalWordCount;

        constructor(address to, uint256 _timeout, bytes32 _root, uint256 wordCount) payable {
            require(to != address(0), "Recipient address cannot be zero address.");
            require(wordCount > 0, "Word count must be positive.");

            channelRecipient = payable(to);
            channelSender = payable(msg.sender);
            startDate = block.timestamp;
            channelTimeout = _timeout;
            root = _root;
            totalWordCount = wordCount;
        }

        function closeChannel(uint256 _amount, bytes32 hashChainItem, bytes32[] calldata proof) external {
            require(msg.sender == channelRecipient, "Only the channel recipient can close the channel.");
            
            bool isValid = validateChannelClosure(_amount, hashChainItem, proof);
            require(isValid, "Invalid Merkle proof.");

            uint256 amountToWithdraw = calculateWithdrawAmount(_amount);

            (bool success, ) = channelRecipient.call{value: amountToWithdraw}("");
            require(success, "Transfer failed.");
            
            totalWordCount = totalWordCount - _amount;
        }

        function simulateCloseChannel(uint256 _amount, bytes32 hashChainItem, bytes32[] calldata proof) external view returns (bool, uint256) {
            require(msg.sender == channelRecipient, "Only the channel recipient can simulate closing the channel.");
            
            bool isValid = validateChannelClosure(_amount, hashChainItem, proof);
            if (!isValid) {
                return (false, 0);
            }

            uint256 amountToWithdraw = calculateWithdrawAmount(_amount);
            return (true, amountToWithdraw);
        }

        // function channelTimeout() external nonReentrant {
        //     require(block.timestamp >= startDate + channelTimeout, "Channel timeout not reached.");
        //     require(msg.sender == channelSender, "Only the channel sender can reclaim the funds.");
            
        //     (bool success, ) = channelSender.call{value: address(this).balance}("");
        //     require(success, "Transfer failed.");
        // }

        function validateChannelClosure(uint256 _amount, bytes32 hashChainItem, bytes32[] calldata proof) private view returns (bool) {
            if (_amount == 0) {
                return false;
            }
            bytes32 computedHash = keccak256(abi.encodePacked(_amount, hashChainItem));
            for (uint256 i = 0; i < proof.length; i++) {
                bytes32 proofElement = proof[i];
                if (computedHash < proofElement) {
                    computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
                } else {
                    computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
                }
            }
            return computedHash == root;
        }
        
        function calculateWithdrawAmount(uint256 _amount) private view returns (uint256) {
            uint256 remainingWords = totalWordCount - _amount;
            if (remainingWords == 0) {
                return address(this).balance;
            }
            uint256 initialWordPrice = address(this).balance / totalWordCount;
            return initialWordPrice * _amount;
        }
    }
