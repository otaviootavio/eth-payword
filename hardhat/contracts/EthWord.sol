// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract EthWord {
    // Custom errors for gas optimization
    error ZeroAddress();
    error InvalidWordCount();
    error ZeroTip();
    error Unauthorized();
    error WordCountExceedsAvailable();
    error InvalidWordOrCount();
    error TransferFailed();

    address payable public immutable channelRecipient;
    bytes32 public channelTip;
    uint public totalWordCount;

    constructor(address to, uint wordCount, bytes32 tip) payable {
        if (to == address(0)) revert ZeroAddress();
        if (wordCount == 0) revert InvalidWordCount();
        if (tip == 0) revert ZeroTip();

        channelRecipient = payable(to);
        totalWordCount = wordCount;
        channelTip = tip;
    }

    function closeChannel(bytes32 _word, uint _wordCount) external {
        if (msg.sender != channelRecipient) revert Unauthorized();
        if (_wordCount > totalWordCount) revert WordCountExceedsAvailable();
        
        bool isValid = validateChannelClosure(_word, _wordCount);
        if (!isValid) revert InvalidWordOrCount();

        // Inline calculateWithdrawAmount logic
        uint remainingWords = totalWordCount - _wordCount;
        uint amountToWithdraw;
        if (remainingWords == 0) {
            amountToWithdraw = address(this).balance;
        } else {
            uint initialWordPrice = address(this).balance / totalWordCount;
            amountToWithdraw = initialWordPrice * _wordCount;
        }

        (bool sent, ) = channelRecipient.call{value: amountToWithdraw}("");
        if (!sent) revert TransferFailed();

        channelTip = _word;
        unchecked {
            totalWordCount = totalWordCount - _wordCount;
        }
    }

    function validateChannelClosure(
        bytes32 _word,
        uint _wordCount
    ) private view returns (bool) {
        bytes32 wordScratch = keccak256(abi.encodePacked(_word));

        unchecked {
            for (uint i = 1; i < _wordCount; i++) {
                wordScratch = keccak256(abi.encodePacked(wordScratch));
            }
        }
        return wordScratch == channelTip;
    }
}
