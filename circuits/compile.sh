#!/bin/bash

# ChainFlow Circuit Compilation Script
# Compiles Circom circuit and generates proving/verification keys

echo "🔧 Compiling ChainFlow ZK Circuit..."

# Create build directory
mkdir -p build

# Compile the circuit
echo "📦 Compiling Circom circuit..."
circom chainflow.circom --r1cs --wasm --sym -o build/

if [ $? -ne 0 ]; then
    echo "❌ Circuit compilation failed!"
    exit 1
fi

echo "✅ Circuit compiled successfully!"

# Generate the witness calculator
echo "🔍 Generating witness calculator..."
cd build/chainflow_js
npm install
cd ../..

# Start the Powers of Tau ceremony
echo "🌟 Starting Powers of Tau ceremony..."
snarkjs powersoftau new bn128 14 build/pot14_0000.ptau -v

# Contribute to the ceremony
echo "🎲 Contributing to Powers of Tau..."
snarkjs powersoftau contribute build/pot14_0000.ptau build/pot14_0001.ptau --name="ChainFlow Contribution" -v

# Phase 2
echo "🔄 Preparing Phase 2..."
snarkjs powersoftau prepare phase2 build/pot14_0001.ptau build/pot14_final.ptau -v

# Generate zkey
echo "🔑 Generating proving key..."
snarkjs groth16 setup build/chainflow.r1cs build/pot14_final.ptau build/chainflow_0000.zkey

# Contribute to phase 2
echo "🎯 Contributing to Phase 2..."
snarkjs zkey contribute build/chainflow_0000.zkey build/chainflow_0001.zkey --name="ChainFlow Phase 2 Contribution" -v

# Export verification key
echo "📋 Exporting verification key..."
snarkjs zkey export verificationkey build/chainflow_0001.zkey build/verification_key.json

# Generate Solidity verifier
echo "📜 Generating Solidity verifier contract..."
snarkjs zkey export solidityverifier build/chainflow_0001.zkey ../contracts/ChainFlowVerifier.sol

echo "🎉 Circuit setup complete!"
echo "📁 Files generated:"
echo "   - build/chainflow.r1cs (R1CS constraint system)"
echo "   - build/chainflow_js/ (Witness calculator)"
echo "   - build/chainflow_0001.zkey (Proving key)"
echo "   - build/verification_key.json (Verification key)"
echo "   - ../contracts/ChainFlowVerifier.sol (Solidity verifier)"

echo "🚀 Ready to generate proofs!"