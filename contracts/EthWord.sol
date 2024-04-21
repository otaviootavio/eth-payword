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
        bytes32 wordScratch = _word;
        for (uint i = 1; i <= _wordCount; i++) {
            wordScratch = keccak256(abi.encodePacked(wordScratch));
        }
        require(wordScratch == channelTip, "Incorrect word or word count");

        uint amountToWithdraw = calculateWithdrawAmount(_wordCount);
        channelRecipient.transfer(amountToWithdraw);
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
