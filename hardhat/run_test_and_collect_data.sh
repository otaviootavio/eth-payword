#!/bin/bash

# Create or clear the output file
echo "chainSize,deployGas,closeChannelGas,merkleDeployGas,merkleCloseChannelGas,paymentChannelDeployGas,paymentChannelCloseGas,normalTransactionGas" > gas_data.csv

# Array of chain sizes to test
CHAIN_SIZES=(2 4 8 16 32 64 128 256 512 1024 2048 4096)

# Save original files
cp test/utils/deployEthWord.ts test/utils/deployEthWord.ts.backup
cp test/utils/deployEthWordMerkle.ts test/utils/deployEthWordMerkle.ts.backup
cp test/utils/deployEthPaymentChannel.ts test/utils/deployEthPaymentChannel.ts.backup
cp test/utils/deployNormalTransaction.ts test/utils/deployNormalTransaction.ts.backup

for size in "${CHAIN_SIZES[@]}"; do
    echo "Testing chain size: $size"
    
    # Replace chain size in the deployment files
    sed -i "s/const chainSize: number = [0-9]\+/const chainSize: number = $size/" test/utils/deployEthWord.ts
    sed -i "s/const wordCount = [0-9]\+/const wordCount = $size/" test/utils/deployEthWordMerkle.ts
    sed -i "s/const depositAmount = parseEther(\"[0-9]\+\")/const depositAmount = parseEther(\"$size\")/" test/utils/deployEthPaymentChannel.ts
    sed -i "s/const chainSize: number = [0-9]\+/const chainSize: number = $size/" test/utils/deployNormalTransaction.ts
    
    
    # Run EthWord tests and capture output
    RESULT_ETHWORD=$(npx hardhat test test/ethword/Channel.test.ts 2>&1)
    
    # Run EthWordMerkle tests and capture output
    RESULT_MERKLE=$(npx hardhat test test/ethwordMerkle/Channel.test.ts 2>&1)
    
    # Run EthPaymentChannel tests and capture output
    RESULT_PAYMENTCHANNEL=$(npx hardhat test test/ethpaymentchannel/Channel.test.ts 2>&1)
    
    # Run NormalTransaction tests and capture output
    RESULT_NORMAL=$(npx hardhat test test/normalTransaction/Transaction.test.ts 2>&1)
    
    # Extract gas values for EthWord
    DEPLOY_GAS=$(echo "$RESULT_ETHWORD" | grep "EthWord" | grep -oP "·\s+\K[0-9]+" | head -n1)
    CLOSE_GAS=$(echo "$RESULT_ETHWORD" | grep "FULL_CLOSE_GAS:" | grep -oP "\d+" | head -n1)
    
    # Extract gas values for EthWordMerkle
    MERKLE_DEPLOY_GAS=$(echo "$RESULT_MERKLE" | grep "EthWordMerkle" | grep -oP "·\s+\K[0-9]+" | head -n1)
    MERKLE_CLOSE_GAS=$(echo "$RESULT_MERKLE" | grep "Withdraw" | grep -oP "used \K[0-9]+" | head -n1)
    
    # Extract gas values for EthPaymentChannel
    PAYMENTCHANNEL_DEPLOY_GAS=$(echo "$RESULT_PAYMENTCHANNEL" | grep "EthPaymentChannel" | grep -oP "·\s+\K[0-9]+" | head -n1)
    PAYMENTCHANNEL_CLOSE_GAS=$(echo "$RESULT_PAYMENTCHANNEL" | grep "Closed channel" | grep -oP "used \K[0-9]+" | head -n1)
    
    # Extract gas values for NormalTransaction
    NORMAL_GAS=$(echo "$RESULT_NORMAL" | grep "NormalTransaction" | grep -oP "·\s+\K[0-9]+" | head -n1)
    
    # Write to CSV
    echo "$size,$DEPLOY_GAS,$CLOSE_GAS,$MERKLE_DEPLOY_GAS,$MERKLE_CLOSE_GAS,$PAYMENTCHANNEL_DEPLOY_GAS,$PAYMENTCHANNEL_CLOSE_GAS,$NORMAL_GAS" >> gas_data.csv
    
    echo "Completed test for chain size: $size"
done

# Restore original files
mv test/utils/deployEthWord.ts.backup test/utils/deployEthWord.ts
mv test/utils/deployEthWordMerkle.ts.backup test/utils/deployEthWordMerkle.ts
mv test/utils/deployEthPaymentChannel.ts.backup test/utils/deployEthPaymentChannel.ts
mv test/utils/deployNormalTransaction.ts.backup test/utils/deployNormalTransaction.ts

echo -e "\nResults:"
cat gas_data.csv