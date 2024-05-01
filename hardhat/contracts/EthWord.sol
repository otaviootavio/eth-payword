// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract EthWord {
    address payable public channelSender;
    address payable public channelRecipient;
    uint public totalWordCount;
    bytes32 public channelTip;
    bool private isChannelClosed;

    constructor(address to, uint wordCount, bytes32 tip) payable {
        channelRecipient = payable(to);
        channelSender = payable(msg.sender);
        totalWordCount = wordCount;
        channelTip = tip;
        isChannelClosed = false;
    }

    modifier noReentrancy() {
        require(!isChannelClosed, "Channel already closed");
        isChannelClosed = true;
        _;
        isChannelClosed = false;
    }

    function closeChannel(bytes32 _word, uint _wordCount) public noReentrancy {
        require(
            msg.sender == channelRecipient,
            "Only the recipient can close the channel"
        );
        validateChannelClosure(_word, _wordCount);

        uint amountToWithdraw = calculateWithdrawAmount(_wordCount);
        (bool sent, ) = channelRecipient.call{value: amountToWithdraw}("");
        channelTip = _word;
        totalWordCount = totalWordCount - _wordCount;
        require(sent, "Failed to send Ether");
    }

    function simulateCloseChannel(
        bytes32 _word,
        uint _wordCount
    ) public view returns (bool, uint) {
        require(
            msg.sender == channelRecipient,
            "Only the recipient can simulate closing the channel"
        );
        if (isChannelClosed) {
            return (false, 0);
        }

        bool isValid = validateChannelClosure(_word, _wordCount);
        if (!isValid) {
            return (false, 0);
        }

        uint amountToWithdraw = calculateWithdrawAmount(_wordCount);
        return (true, amountToWithdraw);
    }

    function validateChannelClosure(
        bytes32 _word,
        uint _wordCount
    ) private view returns (bool) {
        bytes32 wordScratch = _word;
        for (uint i = 1; i < _wordCount; i++) {
            wordScratch = keccak256(abi.encodePacked(wordScratch));
        }
        return wordScratch == channelTip;
    }

    function calculateWithdrawAmount(
        uint _wordCount
    ) private view returns (uint) {
        uint remainingWords = totalWordCount - _wordCount;
        if (remainingWords == 0) {
            return address(this).balance;
        }
        uint initialWordPrice = address(this).balance / totalWordCount;
        return initialWordPrice * _wordCount;
    }
}
