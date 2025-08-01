// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract EthWordPayChanHub {
    error InvalidRecipient();
    error InvalidDeposit();
    error InvalidWordCount();
    error ZeroTip();
    error ChannelNotActive();
    error OnlyRecipientCanClose();
    error WordCountExceedsAvailable();
    error InvalidChannel();
    error InvalidWordOrCount();
    error TransferFailed();

    struct WordPaymentChannel {
        address payable recipient;
        address sender;
        uint256 balance;
        uint256 totalWordCount;
        bytes32 channelTip;
    }

    mapping(bytes32 => WordPaymentChannel) public channels;
    uint256 private _nonce;

    event ChannelCreated(
        bytes32 indexed channelId, 
        address indexed sender, 
        address indexed recipient, 
        uint256 amount,
        uint256 wordCount,
        bytes32 tip
    );
    event ChannelClosed(bytes32 indexed channelId, address indexed recipient, uint256 amount, uint256 wordCount);

    function createChannel(
        address payable _recipient, 
        uint256 _wordCount, 
        bytes32 _tip
    ) external payable returns (bytes32) {
        if (_recipient == address(0)) revert InvalidRecipient();
        if (msg.value == 0) revert InvalidDeposit();
        if (_wordCount == 0) revert InvalidWordCount();
        if (_tip == 0) revert ZeroTip();
        
        _nonce++;
        bytes32 channelId = keccak256(abi.encodePacked(msg.sender, _recipient, ++_nonce));
        
        channels[channelId] = WordPaymentChannel({
            recipient: _recipient,
            sender: msg.sender,
            balance: msg.value,
            totalWordCount: _wordCount,
            channelTip: _tip
        });

        emit ChannelCreated(channelId, msg.sender, _recipient, msg.value, _wordCount, _tip);
        return channelId;
    }

    function closeChannel(
        bytes32 channelId,
        bytes32 _word,
        uint256 _wordCount
    ) external {
        WordPaymentChannel storage channel = channels[channelId];
        if (channel.balance == 0) revert ChannelNotActive();
        if (msg.sender != channel.recipient) revert OnlyRecipientCanClose();
        if (_wordCount > channel.totalWordCount) revert WordCountExceedsAvailable();

        bool isValid = validateChannelClosure(_word, _wordCount, channel.channelTip);
        if (!isValid) revert InvalidWordOrCount();

        // Calculate amount to withdraw
        uint256 remainingWords = channel.totalWordCount - _wordCount;
        uint256 amountToWithdraw;
        if (remainingWords == 0) {
            amountToWithdraw = channel.balance;
        } else {
            uint256 initialWordPrice = channel.balance / channel.totalWordCount;
            amountToWithdraw = initialWordPrice * _wordCount;
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
        channel.channelTip = _word;
        channel.totalWordCount -= _wordCount;

        emit ChannelClosed(channelId, channel.recipient, amountToWithdraw, _wordCount);
    }

    function validateChannelClosure(
        bytes32 _word,
        uint256 _wordCount,
        bytes32 _channelTip
    ) private pure returns (bool) {
        bytes32 wordScratch = keccak256(abi.encodePacked(_word));

        for (uint256 i = 1; i < _wordCount; i++) {
            wordScratch = keccak256(abi.encodePacked(wordScratch));
        }

        return wordScratch == _channelTip;
    }
} 