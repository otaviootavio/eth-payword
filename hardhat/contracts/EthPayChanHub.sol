// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract EthPayChanHub {
    using ECDSA for bytes32;

    error InvalidRecipient();
    error InvalidDeposit();
    error ChannelNotActive();
    error OnlyRecipientCanClose();
    error AmountExceedsBalance();
    error InvalidChannel();
    error InvalidSignature();
    error TransferFailed();

    struct PaymentChannel {
        address payable recipient;
        address sender;
        uint256 balance;
    }

    mapping(bytes32 => PaymentChannel) public channels;
    uint256 private _nonce;

    event ChannelCreated(
        bytes32 indexed channelId, 
        address indexed sender, 
        address indexed recipient, 
        uint256 amount
    );
    event ChannelClosed(bytes32 indexed channelId, address indexed recipient, uint256 amount);

    function createChannel(address payable _recipient) external payable returns (bytes32) {
        if (_recipient == address(0)) revert InvalidRecipient();
        if (msg.value == 0) revert InvalidDeposit();
        
        _nonce++;
        bytes32 channelId = keccak256(abi.encodePacked(msg.sender, _recipient, ++_nonce));
        
        channels[channelId] = PaymentChannel({
            recipient: _recipient,
            sender: msg.sender,
            balance: msg.value
        });

        emit ChannelCreated(channelId, msg.sender, _recipient, msg.value);
        return channelId;
    }

    function closeChannel(
        bytes32 channelId,
        uint256 amount,
        bytes memory signature
    ) external {
        PaymentChannel storage channel = channels[channelId];
        if (channel.balance == 0) revert ChannelNotActive();
        if (msg.sender != channel.recipient) revert OnlyRecipientCanClose();
        if (amount > channel.balance) revert AmountExceedsBalance();

        // Verify signature using OpenZeppelin's ECDSA library
        bytes32 messageHash = keccak256(abi.encodePacked(channelId, amount));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address signer = ECDSA.recover(ethSignedMessageHash, signature);
        if (signer != channel.sender) revert InvalidSignature();

        // Transfer funds to recipient
        (bool sentToRecipient, ) = channel.recipient.call{value: amount}("");
        if (!sentToRecipient) revert TransferFailed();

        // Transfer remaining funds to sender
        uint256 remainingAmount = channel.balance - amount;
        if (remainingAmount > 0) {
            (bool sentToSender, ) = payable(channel.sender).call{value: remainingAmount}("");
            if (!sentToSender) revert TransferFailed();
        }

        // Clear the channel
        channel.balance = 0;

        emit ChannelClosed(channelId, channel.recipient, amount);
    }
} 