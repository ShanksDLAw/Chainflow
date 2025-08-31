// scripts/compute-merkle-root.js
const { createHash } = require('crypto');

// Simple hash function for demonstration (in real implementation, use proper cryptographic hash)
function simpleHash(inputs) {
  const combined = inputs.join('');
  return '0x' + createHash('sha256').update(combined).digest('hex').slice(0, 32);
}

// Compute Merkle root from leaf and path
function computeMerkleRoot(leaf, pathElements, pathIndices) {
  let currentHash = leaf;
  
  for (let i = 0; i < pathElements.length; i++) {
    if (pathElements[i] === '0x0000000000000000000000000000000000000000000000000000000000') {
      break; // Skip zero elements
    }
    
    const left = pathIndices[i] === '0' ? currentHash : pathElements[i];
    const right = pathIndices[i] === '0' ? pathElements[i] : currentHash;
    currentHash = simpleHash([left, right]);
  }
  
  return currentHash;
}

// Test data
const supplierPublicKeyX = '0xf3305a495ac8ed45c6d3ddf77a92828a028846e84c49a86380bf826b64da';
const supplierPublicKeyY = '0x5c6a330a6afc5a6e233e611ef092241e1001b8d25a7e12988abe2500307f';
const pathElements = [
  '0x220c8473560bebcdf40bc283c2699394f726aa4bab0451cc55e9878cc3f9',
  '0xd4254dea5228212a209bc2ca0807771357bd14a017d0ada8ee484c5629a6',
  '0x3d9c48e1d654e6f02f2d2c9578858193b33dc4b0a2a5ea988f40977efe1d'
];
const pathIndices = ['1', '0', '0'];

// Compute leaf hash
const leaf = simpleHash([supplierPublicKeyX, supplierPublicKeyY]);
console.log('Leaf hash:', leaf);

// Compute Merkle root
const merkleRoot = computeMerkleRoot(leaf, pathElements, pathIndices);
console.log('Computed Merkle root:', merkleRoot);

console.log('\nUpdate your Prover.toml with:');
console.log(`merkle_root = "${merkleRoot}"`);