// Hackathon submission update
pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/mux1.circom";

// ChainFlow - ETH-native ZK Circuit for Supply Chain Route Optimization
// Verifies product authenticity, route optimization, and trust scoring

template ChainFlowVerification() {
    // Product identification (private inputs)
    signal private input productId;
    signal private input productCategory;
    signal private input batchNumber;
    signal private input manufacturingDate;
    
    // Supplier verification (private inputs)
    signal private input supplierId;
    signal private input supplierTier;  // 1=Premium, 2=Standard, 3=Basic
    signal private input supplierTrustScore; // 0-100
    signal private input supplierCertificationHash;
    
    // Route optimization data (private inputs)
    signal private input originLocation;
    signal private input destinationLocation;
    signal private input routeDistance;
    signal private input routeTime;
    signal private input routeCost;
    signal private input routeReliability; // 0-100
    
    // Trust scoring ML features (private inputs)
    signal private input historicalDeliveries;
    signal private input fraudIncidents;
    signal private input certificationCount;
    signal private input yearsActive;
    
    // Authentication signatures (private inputs)
    signal private input manufacturerSignature;
    signal private input distributorSignature;
    
    // Public verification parameters
    signal input expectedProductHash;
    signal input trustedSupplierRoot;
    signal input routeOptimizationRoot;
    signal input verificationTimestamp;
    signal input minTrustThreshold; // Minimum trust score required
    signal input maxRouteRisk; // Maximum acceptable route risk
    
    // Public outputs
    signal output isValid;
    signal output trustScore;
    signal output routeEfficiency;
    signal output riskLevel;
    
    // Components for hashing
    component productHasher = Poseidon(4);
    component supplierHasher = Poseidon(4);
    component routeHasher = Poseidon(5);
    component trustCalculator = Poseidon(4);
    
    // Components for comparisons
    component trustThresholdCheck = GreaterEqualThan(8);
    component routeRiskCheck = LessEqualThan(8);
    component supplierTierCheck = LessEqualThan(8);
    component validityCheck = GreaterEqualThan(8);
    
    // 1. Product Identity Verification
    productHasher.inputs[0] <== productId;
    productHasher.inputs[1] <== productCategory;
    productHasher.inputs[2] <== batchNumber;
    productHasher.inputs[3] <== manufacturingDate;
    
    // Verify computed product hash matches expected
    component productHashCheck = IsEqual();
    productHashCheck.in[0] <== productHasher.out;
    productHashCheck.in[1] <== expectedProductHash;
    
    // 2. Supplier Credential Verification
    supplierHasher.inputs[0] <== supplierId;
    supplierHasher.inputs[1] <== supplierTier;
    supplierHasher.inputs[2] <== supplierTrustScore;
    supplierHasher.inputs[3] <== supplierCertificationHash;
    
    // Verify supplier tier is valid (1-3)
    supplierTierCheck.in[0] <== supplierTier;
    supplierTierCheck.in[1] <== 3;
    
    component supplierTierMin = GreaterEqualThan(8);
    supplierTierMin.in[0] <== supplierTier;
    supplierTierMin.in[1] <== 1;
    
    // 3. Route Optimization Verification
    routeHasher.inputs[0] <== originLocation;
    routeHasher.inputs[1] <== destinationLocation;
    routeHasher.inputs[2] <== routeDistance;
    routeHasher.inputs[3] <== routeTime;
    routeHasher.inputs[4] <== routeCost;
    
    // Calculate route efficiency score (0-100)
    // Efficiency = (reliability * 0.4) + ((10000 - distance) / 100 * 0.3) + ((500 - time) / 5 * 0.3)
    signal distanceScore <== (10000 - routeDistance) / 100;
    signal timeScore <== (500 - routeTime) / 5;
    signal reliabilityScore <== routeReliability;
    
    // Weighted efficiency calculation (simplified for circuit)
    signal efficiency1 <== reliabilityScore * 40;
    signal efficiency2 <== distanceScore * 30;
    signal efficiency3 <== timeScore * 30;
    signal totalEfficiency <== (efficiency1 + efficiency2 + efficiency3) / 100;
    
    // 4. ML Trust Scoring Calculation
    trustCalculator.inputs[0] <== historicalDeliveries;
    trustCalculator.inputs[1] <== fraudIncidents;
    trustCalculator.inputs[2] <== certificationCount;
    trustCalculator.inputs[3] <== yearsActive;
    
    // Calculate trust score based on ML features
    // Trust = base_score + (deliveries * 0.3) - (fraud * 10) + (certs * 5) + (years * 2)
    signal baseScore <== 50;
    signal deliveryBonus <== historicalDeliveries * 30 / 100; // Scale down
    signal fraudPenalty <== fraudIncidents * 10;
    signal certBonus <== certificationCount * 5;
    signal experienceBonus <== yearsActive * 2;
    
    signal calculatedTrust <== baseScore + deliveryBonus - fraudPenalty + certBonus + experienceBonus;
    
    // Ensure trust score is within bounds (0-100)
    component trustBoundCheck1 = LessEqualThan(8);
    trustBoundCheck1.in[0] <== calculatedTrust;
    trustBoundCheck1.in[1] <== 100;
    
    component trustBoundCheck2 = GreaterEqualThan(8);
    trustBoundCheck2.in[0] <== calculatedTrust;
    trustBoundCheck2.in[1] <== 0;
    
    // 5. Risk Assessment
    // Risk = (100 - trust) * 0.4 + (100 - efficiency) * 0.3 + supplier_risk * 0.3
    signal trustRisk <== (100 - calculatedTrust) * 40 / 100;
    signal efficiencyRisk <== (100 - totalEfficiency) * 30 / 100;
    signal supplierRisk <== (4 - supplierTier) * 30 / 3; // Higher tier = lower risk
    
    signal totalRisk <== trustRisk + efficiencyRisk + supplierRisk;
    
    // 6. Signature Verification (simplified)
    component sigHasher = Poseidon(3);
    sigHasher.inputs[0] <== productId;
    sigHasher.inputs[1] <== manufacturerSignature;
    sigHasher.inputs[2] <== distributorSignature;
    
    // Verify signatures are non-zero
    component sigCheck1 = IsZero();
    sigCheck1.in <== manufacturerSignature;
    
    component sigCheck2 = IsZero();
    sigCheck2.in <== distributorSignature;
    
    // 7. Final Validation Checks
    // Check trust score meets minimum threshold
    trustThresholdCheck.in[0] <== calculatedTrust;
    trustThresholdCheck.in[1] <== minTrustThreshold;
    
    // Check route risk is acceptable
    routeRiskCheck.in[0] <== totalRisk;
    routeRiskCheck.in[1] <== maxRouteRisk;
    
    // Overall validity check
    signal validityComponents[6];
    validityComponents[0] <== productHashCheck.out;
    validityComponents[1] <== supplierTierCheck.out;
    validityComponents[2] <== supplierTierMin.out;
    validityComponents[3] <== trustThresholdCheck.out;
    validityComponents[4] <== routeRiskCheck.out;
    validityComponents[5] <== (1 - sigCheck1.out) * (1 - sigCheck2.out); // Both sigs non-zero
    
    // All components must be 1 for validity
    signal validity1 <== validityComponents[0] * validityComponents[1];
    signal validity2 <== validity1 * validityComponents[2];
    signal validity3 <== validity2 * validityComponents[3];
    signal validity4 <== validity3 * validityComponents[4];
    signal finalValidity <== validity4 * validityComponents[5];
    
    // Assign outputs
    isValid <== finalValidity;
    trustScore <== calculatedTrust;
    routeEfficiency <== totalEfficiency;
    riskLevel <== totalRisk;
}

// Main component
component main = ChainFlowVerification();