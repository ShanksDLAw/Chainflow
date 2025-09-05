// Consolidated ML Trust Service for ChainFlow
// Combines trust scoring, fraud detection, and pattern analysis
const crypto = require('crypto');
const SyntheticDataGenerator = require('./synthetic-data-generator');

class MLTrustService {
    constructor() {
        this.dataGenerator = new SyntheticDataGenerator();
        
        // Risk thresholds
        this.riskThresholds = {
            low: 75,
            medium: 50,
            high: 25
        };
        
        // Fraud detection patterns - initialize before training data
        this.fraudPatterns = {
            batchAnomalies: [
                /^[A-Z]{2}\d{4}[A-Z]{2}$/, // Fake batch format
                /^FAKE\d+$/,
                /^TEST\d+$/,
                /^[0-9]{8,}$/, // Suspicious all-numeric long batches
                /^[A-Z]{1,2}$/, // Too short batch codes
                /^.{20,}$/ // Suspiciously long batch codes
            ],
            supplierRisks: {
                'Unknown': 0.9,
                'Unverified': 0.8,
                'New Supplier': 0.6,
                'Blacklisted': 1.0,
                'Under Investigation': 0.85,
                'Pending Verification': 0.7
            },
            locationRisks: {
                'Unknown Location': 0.9,
                'High Risk Region': 0.7,
                'Unverified Location': 0.6,
                'Sanctioned Country': 0.95
            }
        };
        
        // Initialize training data and model after fraud patterns are set
        this.trainingData = this.generateTrainingData();
        this.model = this.trainModel();
        this.featureWeights = this.calculateFeatureWeights();
        
        console.log('🔧 ML Trust Service initialized with consolidated functionality');
    }

    /**
     * Main trust assessment function combining ML scoring and fraud detection
     * @param {Object} product - Product data
     * @param {Object} supplier - Supplier data
     * @param {Object} category - Product category
     * @param {Object} supplyChain - Supply chain data (optional)
     * @returns {Object} - Comprehensive trust assessment
     */
    assessProductTrust(product, supplier, category, supplyChain = null) {
        try {
            // Extract features for ML model
            const features = this.extractFeatures(supplier, product);
            
            // Calculate ML-based trust score
            const mlTrustScore = this.predict(features);
            
            // Perform fraud detection
            const fraudAnalysis = this.detectFraudPatterns(product, supplier);
            
            // Evaluate supplier trust
            const supplierTrust = this.evaluateSupplierTrust(supplier);
            
            // Evaluate product authenticity
            const productAuthenticity = this.evaluateProductAuthenticity(product);
            
            // Evaluate supply chain integrity if provided
            const supplyChainIntegrity = supplyChain ? 
                this.evaluateSupplyChainIntegrity(supplyChain) : 0.7;
            
            // Calculate weighted final score
            const finalTrustScore = this.calculateWeightedTrustScore({
                mlScore: mlTrustScore,
                supplierTrust,
                productAuthenticity,
                supplyChainIntegrity,
                fraudPenalty: fraudAnalysis.riskScore
            });
            
            // Generate comprehensive assessment
            return {
                trustScore: Math.round(finalTrustScore * 100) / 100,
                riskLevel: this.getRiskLevel(finalTrustScore),
                confidence: this.calculateConfidence(features),
                fraudFlags: fraudAnalysis.flags,
                riskFactors: this.identifyRiskFactors(supplier, product, features),
                recommendations: this.generateRecommendations(supplier, product, finalTrustScore),
                breakdown: {
                    mlScore: Math.round(mlTrustScore * 100) / 100,
                    supplierTrust: Math.round(supplierTrust * 100) / 100,
                    productAuthenticity: Math.round(productAuthenticity * 100) / 100,
                    supplyChainIntegrity: Math.round(supplyChainIntegrity * 100) / 100,
                    fraudPenalty: Math.round(fraudAnalysis.riskScore * 100) / 100
                },
                timestamp: new Date().toISOString(),
                processingTime: Date.now()
            };
        } catch (error) {
            console.error('Trust assessment error:', error);
            return this.getDefaultTrustAssessment(error.message);
        }
    }

    /**
     * Extract features for ML model
     */
    extractFeatures(supplier, product, delivery = null) {
        const features = {
            // Supplier features
            supplierAge: this.calculateSupplierAge(supplier.established_date),
            supplierRating: supplier.rating || 0,
            supplierCertifications: (supplier.certifications || []).length,
            supplierLocation: this.getLocationRisk(supplier.location),
            supplierSpecialties: (supplier.specialties || []).length,
            
            // Product features
            productPrice: product.price || 0,
            productCategory: this.getCategoryRisk(product.category),
            productComplexity: this.getProductComplexity(product),
            
            // Delivery features (if available)
            deliveryTime: delivery ? delivery.delivery_time : 0,
            deliveryDistance: delivery ? delivery.distance : 0,
            deliveryOnTime: delivery ? (delivery.on_time ? 1 : 0) : 0.5
        };
        
        return features;
    }

    /**
     * ML prediction using trained model
     */
    predict(features, weights = null) {
        const modelWeights = weights || this.featureWeights;
        let score = 0;
        
        for (const [feature, value] of Object.entries(features)) {
            if (modelWeights[feature]) {
                score += value * modelWeights[feature];
            }
        }
        
        // Normalize to 0-1 range
        return Math.max(0, Math.min(1, score));
    }

    /**
     * Detect fraud patterns
     */
    detectFraudPatterns(product, supplier) {
        const flags = [];
        let riskScore = 0;
        
        // Check batch number patterns
        if (product.batch_number && this.isSuspiciousBatch(product.batch_number)) {
            flags.push('Suspicious batch number pattern');
            riskScore += 0.3;
        }
        
        // Check supplier risk factors
        const supplierRisk = this.fraudPatterns.supplierRisks[supplier.status] || 0;
        if (supplierRisk > 0.5) {
            flags.push(`High-risk supplier status: ${supplier.status}`);
            riskScore += supplierRisk * 0.4;
        }
        
        // Check location risks
        const locationRisk = this.fraudPatterns.locationRisks[supplier.location] || 0;
        if (locationRisk > 0.5) {
            flags.push(`High-risk location: ${supplier.location}`);
            riskScore += locationRisk * 0.3;
        }
        
        return { flags, riskScore: Math.min(1, riskScore) };
    }

    /**
     * Evaluate supplier trustworthiness
     */
    evaluateSupplierTrust(supplier) {
        let trust = 0.5; // Base trust
        
        // Rating contribution
        if (supplier.rating) {
            trust += (supplier.rating / 5) * 0.3;
        }
        
        // Certifications contribution
        const certCount = (supplier.certifications || []).length;
        trust += Math.min(certCount * 0.1, 0.2);
        
        // Experience contribution
        const age = this.calculateSupplierAge(supplier.established_date);
        trust += Math.min(age / 10 * 0.2, 0.2);
        
        return Math.max(0, Math.min(1, trust));
    }

    /**
     * Evaluate product authenticity
     */
    evaluateProductAuthenticity(product) {
        let authenticity = 0.7; // Base authenticity
        
        // Check for required fields
        const requiredFields = ['id', 'name', 'batch_number', 'manufacturing_date'];
        const missingFields = requiredFields.filter(field => !product[field]);
        authenticity -= missingFields.length * 0.1;
        
        // Check manufacturing date consistency
        if (product.manufacturing_date) {
            const mfgDate = new Date(product.manufacturing_date);
            const now = new Date();
            const daysDiff = (now - mfgDate) / (1000 * 60 * 60 * 24);
            
            if (daysDiff < 0) {
                authenticity -= 0.3; // Future date
            } else if (daysDiff > 365 * 2) {
                authenticity -= 0.1; // Very old product
            }
        }
        
        return Math.max(0, Math.min(1, authenticity));
    }

    /**
     * Calculate weighted trust score
     */
    calculateWeightedTrustScore(scores) {
        const weights = {
            mlScore: 0.3,
            supplierTrust: 0.25,
            productAuthenticity: 0.25,
            supplyChainIntegrity: 0.2
        };
        
        let weightedScore = 0;
        for (const [component, score] of Object.entries(scores)) {
            if (weights[component] && typeof score === 'number') {
                weightedScore += score * weights[component];
            }
        }
        
        // Apply fraud penalty
        if (scores.fraudPenalty) {
            weightedScore *= (1 - scores.fraudPenalty);
        }
        
        return Math.max(0, Math.min(1, weightedScore));
    }

    /**
     * Generate training data for ML model
     */
    generateTrainingData() {
        const trainingData = [];
        const { suppliers, products, historical } = this.dataGenerator.exportData();
        
        historical.deliveries.forEach(delivery => {
            const supplier = suppliers.find(s => s.id === delivery.supplier_id);
            const product = products.find(p => p.id === delivery.product_id);
            
            if (supplier && product) {
                const features = this.extractFeatures(supplier, product, delivery);
                const label = this.calculateTrustLabel(delivery, supplier, product);
                trainingData.push({ features, label });
            }
        });
        
        return trainingData;
    }

    /**
     * Train ML model using simple linear regression
     */
    trainModel() {
        const features = this.trainingData.map(d => d.features);
        const labels = this.trainingData.map(d => d.label);
        
        // Simple feature weight calculation
        const weights = {};
        const featureNames = Object.keys(features[0] || {});
        
        featureNames.forEach(feature => {
            let correlation = 0;
            for (let i = 0; i < features.length; i++) {
                correlation += features[i][feature] * labels[i];
            }
            weights[feature] = correlation / features.length;
        });
        
        return weights;
    }

    /**
     * Calculate feature weights
     */
    calculateFeatureWeights() {
        return this.model;
    }

    // Helper methods
    calculateSupplierAge(establishedDate) {
        if (!establishedDate) return 0;
        const established = new Date(establishedDate);
        const now = new Date();
        return (now - established) / (1000 * 60 * 60 * 24 * 365); // Years
    }

    getLocationRisk(location) {
        return this.fraudPatterns.locationRisks[location] || 0.1;
    }

    getCategoryRisk(category) {
        const riskMap = {
            'Electronics': 0.3,
            'Pharmaceuticals': 0.4,
            'Luxury Goods': 0.5,
            'Food & Beverage': 0.2,
            'Automotive': 0.3
        };
        return riskMap[category] || 0.2;
    }

    getProductComplexity(product) {
        const components = (product.components || []).length;
        return Math.min(components / 10, 1);
    }

    isSuspiciousBatch(batchNumber) {
        return this.fraudPatterns.batchAnomalies.some(pattern => 
            pattern.test(batchNumber)
        );
    }

    getRiskLevel(trustScore) {
        if (trustScore >= this.riskThresholds.low / 100) return 'Low';
        if (trustScore >= this.riskThresholds.medium / 100) return 'Medium';
        return 'High';
    }

    calculateConfidence(features) {
        const completeness = Object.values(features).filter(v => v !== null && v !== undefined).length / Object.keys(features).length;
        return Math.round(completeness * 100);
    }

    identifyRiskFactors(supplier, product, features) {
        const risks = [];
        
        if (features.supplierRating < 3) risks.push('Low supplier rating');
        if (features.supplierAge < 1) risks.push('New supplier');
        if (features.supplierCertifications === 0) risks.push('No certifications');
        if (features.productPrice > 1000) risks.push('High-value product');
        
        return risks;
    }

    generateRecommendations(supplier, product, trustScore) {
        const recommendations = [];
        
        if (trustScore < 0.5) {
            recommendations.push('Require additional verification');
            recommendations.push('Consider alternative suppliers');
        }
        if (trustScore < 0.7) {
            recommendations.push('Implement enhanced monitoring');
        }
        if (trustScore > 0.8) {
            recommendations.push('Approved for expedited processing');
        }
        
        return recommendations;
    }

    calculateTrustLabel(delivery, supplier, product) {
        let label = 0.5;
        
        if (delivery.on_time) label += 0.2;
        if (delivery.quality_score > 8) label += 0.2;
        if (supplier.rating > 4) label += 0.1;
        
        return Math.max(0, Math.min(1, label));
    }

    evaluateSupplyChainIntegrity(supplyChain) {
        if (!supplyChain || !supplyChain.steps) return 0.7;
        
        const steps = supplyChain.steps;
        let integrity = 0.8;
        
        // Check for gaps in the chain
        if (steps.length < 3) integrity -= 0.2;
        
        // Check for verification at each step
        const verifiedSteps = steps.filter(step => step.verified).length;
        integrity += (verifiedSteps / steps.length) * 0.2;
        
        return Math.max(0, Math.min(1, integrity));
    }

    generateAntiCounterfeitReport(product, supplier, category) {
        try {
            const trustAssessment = this.assessProductTrust(product, supplier, category);
            
            return {
                productId: product.id,
                supplierId: supplier.id,
                categoryId: category.id,
                authenticity: {
                    score: trustAssessment.breakdown.productAuthenticity,
                    level: trustAssessment.breakdown.productAuthenticity > 0.8 ? 'Authentic' : 
                           trustAssessment.breakdown.productAuthenticity > 0.6 ? 'Likely Authentic' : 
                           trustAssessment.breakdown.productAuthenticity > 0.4 ? 'Questionable' : 'Likely Counterfeit',
                    confidence: trustAssessment.confidence
                },
                riskFactors: trustAssessment.riskFactors,
                fraudFlags: trustAssessment.fraudFlags,
                recommendations: trustAssessment.recommendations,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                productId: product.id,
                supplierId: supplier.id,
                categoryId: category.id,
                authenticity: {
                    score: 0.3,
                    level: 'Unable to Verify',
                    confidence: 0
                },
                riskFactors: ['Assessment failed'],
                fraudFlags: ['Error in analysis: ' + error.message],
                recommendations: ['Manual verification required'],
                timestamp: new Date().toISOString()
            };
        }
    }

    getDefaultTrustAssessment(errorMessage) {
        return {
            trustScore: 0.3,
            riskLevel: 'High',
            confidence: 0,
            fraudFlags: ['Assessment failed: ' + errorMessage],
            riskFactors: ['Unable to complete assessment'],
            recommendations: ['Manual review required'],
            breakdown: {
                mlScore: 0,
                supplierTrust: 0,
                productAuthenticity: 0,
                supplyChainIntegrity: 0,
                fraudPenalty: 0.7
            },
            timestamp: new Date().toISOString(),
            processingTime: Date.now()
        };
    }
}

module.exports = MLTrustService;