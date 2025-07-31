// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract EthPaymentChannel {
    address payable public sender;
    address payable public recipient;

    constructor(address payable _recipient) payable {
        require(_recipient != address(0), "Recipient cannot be zero address");
        require(msg.value > 0, "Deposit must be positive");
        
        sender = payable(msg.sender);
        recipient = _recipient;
    }

    function closeChannel(
        uint256 amount,
        bytes memory signature
    ) external {
        require(msg.sender == recipient, "Only recipient can close");
        require(amount <= address(this).balance, "Amount cannot exceed balance");

        // Verify signature using the same format as reference contract
        bytes32 messageHash = keccak256(abi.encodePacked(address(this), amount));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        address signer = recoverSigner(ethSignedMessageHash, signature);
        require(signer == sender, "Invalid signature");

        // Transfer funds to recipient
        (bool sentToRecipient, ) = recipient.call{value: amount}("");
        require(sentToRecipient, "Failed to send to recipient");

        // Transfer remaining funds to sender
        uint256 remainingAmount = address(this).balance;
        if (remainingAmount > 0) {
            (bool sentToSender, ) = sender.call{value: remainingAmount}("");
            require(sentToSender, "Failed to send remaining funds to sender");
        }
    }

    function recoverSigner(bytes32 ethSignedMessageHash, bytes memory signature) public pure returns (address) {
        require(signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        if (v < 27) v += 27;
        require(v == 27 || v == 28, "Invalid signature 'v' value");

        return ecrecover(ethSignedMessageHash, v, r, s);
    }
} 