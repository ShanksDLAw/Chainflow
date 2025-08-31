// scripts/generate-test-data.js
const { poseidon } = require("@noir-lang/backend_barretenberg");
const { randomBytes } = require("crypto");

async function generateTestData() {
  // Generate random values for testing (within BN254 field modulus)
  const generateFieldElement = () => {
    // Generate a smaller random number to ensure it's within field modulus
    const bytes = randomBytes(30); // Use 30 bytes instead of 32 to stay within field
    return "0x" + bytes.toString("hex");
  };

  // Generate mock supplier data
  const supplierPublicKeyX = generateFieldElement();
  const supplierPublicKeyY = generateFieldElement();
  
  // Generate mock signature components
  const signatureR8x = generateFieldElement();
  const signatureR8y = generateFieldElement();
  const signatureS = generateFieldElement();
  
  // Generate mock Merkle tree data
  const pathElements = Array(20).fill(0).map(generateFieldElement);
  const pathIndices = Array(20).fill(0).map(() => 
    Math.random() > 0.5 ? "1" : "0"
  );
  
  // Compute mock Merkle root (this would be computed from actual tree in real implementation)
  const mockMerkleRoot = generateFieldElement();
  
  const testData = {
    merkle_root: mockMerkleRoot,
    product_id: "12345",
    supplier_public_key_x: supplierPublicKeyX,
    supplier_public_key_y: supplierPublicKeyY,
    signature_r8x: signatureR8x,
    signature_r8y: signatureR8y,
    signature_s: signatureS,
    path_elements: pathElements,
    path_indices: pathIndices
  };
  
  console.log(JSON.stringify(testData, null, 2));
}

generateTestData().catch(console.error);