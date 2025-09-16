// Hackathon submission update
const snarkjs = require("snarkjs");
const circomlib = require("circomlib");
const fs = require("fs");
const path = require("path");

/**
 * ChainFlow ZK Proof Generator
 * Generates and verifies zero-knowledge proofs for supply chain route optimization
 */
class ChainFlowProofGenerator {
    constructor() {
        this.circuitWasmPath = path.join(__dirname, "build/chainflow_js/chainflow.wasm");
        this.circuitZkeyPath = path.join(__dirname, "build/chainflow_0001.zkey");
        this.verificationKeyPath = path.join(__dirname, "build/verification_key.json");
        
        // Load verification key
        this.verificationKey = null;
        this.loadVerificationKey();
    }

    /**
     * Load verification key from file
     */
    loadVerificationKey() {
        try {
            if (fs.existsSync(this.verificationKeyPath)) {
                const vKeyData = fs.readFileSync(this.verificationKeyPath, 'utf8');
                this.verificationKey = JSON.parse(vKeyData);
                console.log('✅ Verification key loaded successfully');
            } else {
                console.warn('⚠️ Verification key not found. Run circuit compilation first.');
            }
        } catch (error) {
            console.error('❌ Error loading verification key:', error.message);
        }
    }

    /**
     * Generate ZK proof for supply chain verification
     * @param {Object} input - Circuit input parameters
     * @returns {Object} - Generated proof and public signals
     */
    async generateProof(input) {
        try {
            console.log('🔄 Generating ZK proof...');
            
            // Validate input
            this.validateInput(input);
            
            // Prepare circuit inputs
            const circuitInputs = this.prepareCircuitInputs(input);
            
            // Generate witness
            const { witness } = await snarkjs.groth16.fullProve(
                circuitInputs,
                this.circuitWasmPath,
                this.circuitZkeyPath
            );
            
            // Generate proof
            const proof = await snarkjs.groth16.prove(
                this.circuitZkeyPath,
                witness
            );
            
            console.log('✅ ZK proof generated successfully');
            
            return {
                proof: this.formatProof(proof.proof),
                publicSignals: proof.publicSignals,
                isValid: proof.publicSignals[0] === '1',
                trustScore: parseInt(proof.publicSignals[1]),
                routeEfficiency: parseInt(proof.publicSignals[2]),
                riskLevel: parseInt(proof.publicSignals[3])
            };
            
        } catch (error) {
            console.error('❌ Error generating proof:', error.message);
            throw new Error(`Proof generation failed: ${error.message}`);
        }
    }

    /**
     * Verify a ZK proof
     * @param {Object} proof - The proof to verify
     * @param {Array} publicSignals - Public signals
     * @returns {boolean} - Verification result
     */
    async verifyProof(proof, publicSignals) {
        try {
            if (!this.verificationKey) {
                throw new Error('Verification key not loaded');
            }
            
            console.log('🔍 Verifying ZK proof...');
            
            const isValid = await snarkjs.groth16.verify(
                this.verificationKey,
                publicSignals,
                proof
            );
            
            console.log(`${isValid ? '✅' : '❌'} Proof verification: ${isValid ? 'VALID' : 'INVALID'}`);
            
            return isValid;
            
        } catch (error) {
            console.error('❌ Error verifying proof:', error.message);
            return false;
        }
    }

    /**
     * Validate input parameters
     * @param {Object} input - Input to validate
     */
    validateInput(input) {
        const required = [
            'productId', 'productCategory', 'batchNumber', 'manufacturingDate',
            'supplierId', 'supplierTier', 'supplierTrustScore', 'supplierCertificationHash',
            'originLocation', 'destinationLocation', 'routeDistance', 'routeTime', 'routeCost', 'routeReliability',
            'historicalDeliveries', 'fraudIncidents', 'certificationCount', 'yearsActive',
            'manufacturerSignature', 'distributorSignature',
            'expectedProductHash', 'trustedSupplierRoot', 'routeOptimizationRoot',
            'verificationTimestamp', 'minTrustThreshold', 'maxRouteRisk'
        ];
        
        for (const field of required) {
            if (input[field] === undefined || input[field] === null) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        // Validate ranges
        if (input.supplierTier < 1 || input.supplierTier > 3) {
            throw new Error('Supplier tier must be between 1 and 3');
        }
        
        if (input.supplierTrustScore < 0 || input.supplierTrustScore > 100) {
            throw new Error('Supplier trust score must be between 0 and 100');
        }
        
        if (input.routeReliability < 0 || input.routeReliability > 100) {
            throw new Error('Route reliability must be between 0 and 100');
        }
    }

    /**
     * Prepare inputs for the circuit
     * @param {Object} input - Raw input data
     * @returns {Object} - Formatted circuit inputs
     */
    prepareCircuitInputs(input) {
        // Convert all inputs to strings (required by snarkjs)
        const circuitInputs = {};
        
        // Private inputs
        circuitInputs.productId = input.productId.toString();
        circuitInputs.productCategory = input.productCategory.toString();
        circuitInputs.batchNumber = input.batchNumber.toString();
        circuitInputs.manufacturingDate = input.manufacturingDate.toString();
        
        circuitInputs.supplierId = input.supplierId.toString();
        circuitInputs.supplierTier = input.supplierTier.toString();
        circuitInputs.supplierTrustScore = input.supplierTrustScore.toString();
        circuitInputs.supplierCertificationHash = input.supplierCertificationHash.toString();
        
        circuitInputs.originLocation = input.originLocation.toString();
        circuitInputs.destinationLocation = input.destinationLocation.toString();
        circuitInputs.routeDistance = input.routeDistance.toString();
        circuitInputs.routeTime = input.routeTime.toString();
        circuitInputs.routeCost = input.routeCost.toString();
        circuitInputs.routeReliability = input.routeReliability.toString();
        
        circuitInputs.historicalDeliveries = input.historicalDeliveries.toString();
        circuitInputs.fraudIncidents = input.fraudIncidents.toString();
        circuitInputs.certificationCount = input.certificationCount.toString();
        circuitInputs.yearsActive = input.yearsActive.toString();
        
        circuitInputs.manufacturerSignature = input.manufacturerSignature.toString();
        circuitInputs.distributorSignature = input.distributorSignature.toString();
        
        // Public inputs
        circuitInputs.expectedProductHash = input.expectedProductHash.toString();
        circuitInputs.trustedSupplierRoot = input.trustedSupplierRoot.toString();
        circuitInputs.routeOptimizationRoot = input.routeOptimizationRoot.toString();
        circuitInputs.verificationTimestamp = input.verificationTimestamp.toString();
        circuitInputs.minTrustThreshold = input.minTrustThreshold.toString();
        circuitInputs.maxRouteRisk = input.maxRouteRisk.toString();
        
        return circuitInputs;
    }

    /**
     * Format proof for easier handling
     * @param {Object} proof - Raw proof object
     * @returns {Object} - Formatted proof
     */
    formatProof(proof) {
        return {
            a: [proof.pi_a[0], proof.pi_a[1]],
            b: [[proof.pi_b[0][1], proof.pi_b[0][0]], [proof.pi_b[1][1], proof.pi_b[1][0]]],
            c: [proof.pi_c[0], proof.pi_c[1]]
        };
    }

    /**
     * Generate sample input for testing
     * @returns {Object} - Sample circuit input
     */
    generateSampleInput() {
        return {
            // Product data
            productId: 12345,
            productCategory: 1, // Electronics
            batchNumber: 67890,
            manufacturingDate: 1700000000,
            
            // Supplier data
            supplierId: 1001,
            supplierTier: 1, // Premium
            supplierTrustScore: 85,
            supplierCertificationHash: 999888777,
            
            // Route data
            originLocation: 1,
            destinationLocation: 2,
            routeDistance: 500,
            routeTime: 24,
            routeCost: 1000,
            routeReliability: 90,
            
            // Trust scoring features
            historicalDeliveries: 150,
            fraudIncidents: 0,
            certificationCount: 5,
            yearsActive: 8,
            
            // Signatures
            manufacturerSignature: 111222333,
            distributorSignature: 444555666,
            
            // Public parameters
            expectedProductHash: 123456789,
            trustedSupplierRoot: 987654321,
            routeOptimizationRoot: 555666777,
            verificationTimestamp: Math.floor(Date.now() / 1000),
            minTrustThreshold: 70,
            maxRouteRisk: 30
        };
    }

    /**
     * Test the proof generation and verification
     */
    async test() {
        try {
            console.log('🧪 Testing ChainFlow ZK Proof System...');
            
            const sampleInput = this.generateSampleInput();
            console.log('📝 Generated sample input');
            
            const result = await this.generateProof(sampleInput);
            console.log('🎯 Proof generation result:', {
                isValid: result.isValid,
                trustScore: result.trustScore,
                routeEfficiency: result.routeEfficiency,
                riskLevel: result.riskLevel
            });
            
            const isVerified = await this.verifyProof(result.proof, result.publicSignals);
            console.log(`🔍 Verification result: ${isVerified ? 'PASSED' : 'FAILED'}`);
            
            return { result, isVerified };
            
        } catch (error) {
            console.error('❌ Test failed:', error.message);
            throw error;
        }
    }
}

module.exports = ChainFlowProofGenerator;

// CLI usage
if (require.main === module) {
    const generator = new ChainFlowProofGenerator();
    generator.test().catch(console.error);
}