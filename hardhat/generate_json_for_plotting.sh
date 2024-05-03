#!/bin/bash

# Start the JSON file
echo "{" > gas_usage.json
echo "  \"results\": [" >> gas_usage.json

# Read from the CSV and format into JSON
tail -n +2 gas_data.csv | while IFS=',' read -r hash_amount gas_usage
do
    echo "    {\"hash_amount\": ${hash_amount}, \"gas_usage\": ${gas_usage}}," >> gas_usage.json
done

# Correct JSON formatting by removing the last comma
sed -i '$ s/,$//' gas_usage.json

# Close JSON array and object
echo "  ]" >> gas_usage.json
echo "}" >> gas_usage.json

echo "JSON data ready in gas_usage.json for plotting."
