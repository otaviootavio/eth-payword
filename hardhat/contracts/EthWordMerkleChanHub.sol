// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract EthWordMerkleChanHub {
    error InvalidRecipient();
    error InvalidDeposit();
    error InvalidWordCount();
    error ChannelNotActive();
    error OnlyRecipientCanClose();
    error InvalidMerkleProof();
    error TransferFailed();

    struct WordMerklePaymentChannel {
        address payable recipient;
        address sender;
        uint256 balance;
        uint256 totalWordCount;
        bytes32 root;
    }

    mapping(bytes32 => WordMerklePaymentChannel) public channels;
    uint256 private _nonce;

    event ChannelCreated(
        bytes32 indexed channelId, 
        address indexed sender, 
        address indexed recipient, 
        uint256 amount,
        uint256 wordCount,
        bytes32 root
    );
    event ChannelClosed(bytes32 indexed channelId, address indexed recipient, uint256 amount, uint256 wordCount);

    function createChannel(
        address payable _recipient, 
        uint256 _wordCount, 
        bytes32 _root
    ) external payable returns (bytes32) {
        if (_recipient == address(0)) revert InvalidRecipient();
        if (msg.value == 0) revert InvalidDeposit();
        if (_wordCount == 0) revert InvalidWordCount();
        
        _nonce++;
        bytes32 channelId = keccak256(abi.encodePacked(msg.sender, _recipient, ++_nonce));
        
        channels[channelId] = WordMerklePaymentChannel({
            recipient: _recipient,
            sender: msg.sender,
            balance: msg.value,
            totalWordCount: _wordCount,
            root: _root
        });

        emit ChannelCreated(channelId, msg.sender, _recipient, msg.value, _wordCount, _root);
        return channelId;
    }

    function closeChannel(
        bytes32 channelId,
        bytes32[] calldata proof,
        bytes32 secret,
        uint256 index
    ) external {
        WordMerklePaymentChannel storage channel = channels[channelId];
        if (channel.balance == 0) revert ChannelNotActive();
        if (msg.sender != channel.recipient) revert OnlyRecipientCanClose();

        // Validate the merkle proof
        bool isValid = verify(proof, channel.root, secret);
        if (!isValid) revert InvalidMerkleProof();

        // Calculate amount to withdraw
        uint256 wordCount = index + 1;
        uint256 remainingWords = channel.totalWordCount - wordCount;
        uint256 amountToWithdraw;
        if (remainingWords == 0) {
            amountToWithdraw = channel.balance;
        } else {
            uint256 initialWordPrice = channel.balance / channel.totalWordCount;
            amountToWithdraw = initialWordPrice * wordCount;
        }

        // Transfer funds to recipient
        (bool sentToRecipient, ) = channel.recipient.call{value: amountToWithdraw}("");
        if (!sentToRecipient) revert TransferFailed();

        // Transfer remaining funds to sender
        uint256 remainingAmount = channel.balance - amountToWithdraw;
        if (remainingAmount > 0) {
            (bool sentToSender, ) = payable(channel.sender).call{value: remainingAmount}("");
            if (!sentToSender) revert TransferFailed();
        }

        // Update channel state
        channel.balance = 0;
        channel.totalWordCount -= wordCount;

        emit ChannelClosed(channelId, channel.recipient, amountToWithdraw, wordCount);
    }

    function verify(
        bytes32[] calldata _proof,
        bytes32 _root,
        bytes32 _leaf
    ) private pure returns (bool) {
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
} 