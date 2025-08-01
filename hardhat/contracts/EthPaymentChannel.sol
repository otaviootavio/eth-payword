// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract EthPaymentChannel {
    using ECDSA for bytes32;

    error InvalidRecipient();
    error InvalidDeposit();
    error OnlyRecipient();
    error AmountExceedsBalance();
    error InvalidSignature();
    error TransferFailed();

    address payable public s; // sender
    address payable public immutable r; // recipient

    constructor(address payable _recipient) payable {
        if (_recipient == address(0)) revert InvalidRecipient();
        if (msg.value == 0) revert InvalidDeposit();
        
        s = payable(msg.sender);
        r = _recipient;
    }

    function closeChannel(
        uint256 amount,
        bytes memory signature
    ) external {
        if (msg.sender != r) revert OnlyRecipient();
        if (amount > address(this).balance) revert AmountExceedsBalance();

        // Create message hash and recover signer using OpenZeppelin ECDSA
        bytes32 messageHash = keccak256(abi.encodePacked(address(this), amount));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address signer = ECDSA.recover(ethSignedMessageHash, signature);
        if (signer != s) revert InvalidSignature();

        // Transfer funds to recipient
        (bool sentToRecipient, ) = r.call{value: amount}("");
        if (!sentToRecipient) revert TransferFailed();

        // Transfer remaining funds to sender
        uint256 remaining = address(this).balance;
        if (remaining > 0) {
            (bool sentToSender, ) = s.call{value: remaining}("");
            if (!sentToSender) revert TransferFailed();
        }
    }
} 