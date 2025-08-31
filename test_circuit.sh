#!/bin/bash

# Test script for SourceGuard ZK Circuit
echo "🔧 Testing SourceGuard ZK Circuit..."

# Check if nargo is available
if ! command -v nargo &> /dev/null; then
    echo "❌ Nargo not found. Please install Noir first."
    exit 1
fi

# Compile the circuit
echo "📦 Compiling circuit..."
nargo check
if [ $? -ne 0 ]; then
    echo "❌ Circuit compilation failed"
    exit 1
fi

echo "✅ Circuit compiled successfully"

# Generate test data for Prover.toml
echo "📝 Generating test data..."
cat > Prover.toml << EOF
# Test data for SourceGuard circuit
product_id = "12345"
manufacturer_id = "MFG001"
supplier_id = "SUP001"
product_category = "1"
timestamp = "1640995200"
supplier_tier = "1"
supplier_hash = "123456789012345678901234567890123456789012345678901234567890123"
root_hash = "987654321098765432109876543210987654321098765432109876543210987"
chain_path = ["1", "2", "3", "4", "5"]
signatures = ["111", "222", "333", "444", "555"]
EOF

echo "✅ Test data generated"

# Execute the circuit
echo "🚀 Executing circuit..."
nargo execute
if [ $? -ne 0 ]; then
    echo "❌ Circuit execution failed"
    exit 1
fi

echo "✅ Circuit executed successfully"
echo "🎉 All tests passed! SourceGuard ZK Circuit is working correctly."