// Enhanced ML-based Trust Engine for Anti-Counterfeit Detection
const crypto = require('crypto');

class MLTrustEngine {
    constructor() {
        this.fraudPatterns = {
            // Suspicious batch patterns with enhanced detection
            batchAnomalies: [
                /^[A-Z]{2}\d{4}[A-Z]{2}$/, // Fake batch format
                /^FAKE\d+$/,
                /^TEST\d+$/,
                /^[0-9]{8,}$/, // Suspicious all-numeric long batches
                /^[A-Z]{1,2}$/, // Too short batch codes
                /^.{20,}$/ // Suspiciously long batch codes
            ],
            // Enhanced supplier risk assessment
            supplierRisks: {
                'Unknown': 0.9,
                'Unverified': 0.8,
                'New Supplier': 0.6,
                'Blacklisted': 1.0,
                'Under Investigation': 0.85,
                'Pending Verification': 0.7
            },
            // Enhanced geographic risk factors
            locationRisks: {
                'Unknown Location': 0.9,
                'High Risk Region': 0.7,
                'Unverified Location': 0.6,
                'Sanctioned Country': 0.95,
                'Free Trade Zone': 0.4,
                'Conflict Zone': 0.9
            },
            // Time-based anomaly patterns
            temporalAnomalies: {
                futureDate: 0.9,
                tooOld: 0.7,
                weekendProduction: 0.3,
                holidayProduction: 0.4
            }
        };
        
        // Enhanced trust factor weights with ML-inspired approach
        this.trustFactors = {
            supplierHistory: 0.28,
            certificationValid: 0.22,
            supplyChainIntegrity: 0.20,
            productAuthenticity: 0.15,
            temporalConsistency: 0.10,
            behavioralPatterns: 0.05
        };
        
        // Initialize learning parameters
        this.learningRate = 0.01;
        this.anomalyThreshold = 0.7;
        this.confidenceThreshold = 0.8;
        
        // Historical data for pattern learning
        this.historicalPatterns = {
            fraudCases: [],
            legitimateCases: [],
            lastUpdated: Date.now()
        };
    }
    
    // Enhanced ML trust assessment function with robust error handling
    assessProductTrust(product, supplier, category, supplyChain = null) {
        try {
            // Input validation and sanitization
            if (!product || !supplier) {
                throw new Error('Product and supplier data are required for trust assessment');
            }
            
            // Normalize and validate inputs
            const normalizedProduct = this.normalizeProductData(product);
            const normalizedSupplier = this.normalizeSupplierData(supplier);
            const normalizedCategory = this.normalizeCategoryData(category);
            
            // Calculate individual trust scores with error handling
            const scores = {
                supplierTrust: this.evaluateSupplierTrust(normalizedSupplier),
                productAuthenticity: this.evaluateProductAuthenticity(normalizedProduct),
                supplyChainIntegrity: this.evaluateSupplyChainIntegrity(supplyChain || normalizedProduct.supply_chain),
                temporalConsistency: this.evaluateTemporalConsistency(normalizedProduct),
                certificationValidity: this.evaluateCertifications(normalizedSupplier),
                behavioralPatterns: this.evaluateBehavioralPatterns(normalizedProduct, normalizedSupplier)
            };
            
            // Advanced weighted trust score calculation with confidence intervals
            const trustScore = this.calculateWeightedTrustScore(scores);
            const confidenceScore = this.calculateConfidenceScore(scores, normalizedProduct, normalizedSupplier);
            
            // Enhanced fraud detection with ML patterns
            const fraudFlags = this.detectFraudPatterns(normalizedProduct, normalizedSupplier);
            const anomalyScore = this.detectAnomalies(normalizedProduct, normalizedSupplier, scores);
            
            // Risk level calculation with multiple factors
            const riskLevel = this.calculateRiskLevel(trustScore, fraudFlags, anomalyScore);
            
            // Generate actionable recommendations
            const recommendations = this.generateRecommendations(trustScore, fraudFlags, anomalyScore, confidenceScore);
            
            // Update learning patterns
            this.updateLearningPatterns(normalizedProduct, normalizedSupplier, scores, trustScore);
            
            return {
                trustScore: Math.max(0, Math.min(100, trustScore)),
                confidenceScore: Math.max(0, Math.min(100, confidenceScore)),
                riskLevel,
                anomalyScore,
                fraudFlags,
                detailedScores: scores,
                recommendations,
                timestamp: Date.now(),
                version: '2.0'
            };
            
        } catch (error) {
            console.error('Error in trust assessment:', error);
            return this.getDefaultTrustAssessment(error.message);
        }
    }
    
    // Evaluate supplier trustworthiness
    evaluateSupplierTrust(supplier) {
        if (!supplier) return 0;
        
        let score = 0.5; // Base score
        
        // Trust score from supplier data
        if (supplier.trust_score) {
            score = supplier.trust_score / 100;
        }
        
        // Tier adjustment
        if (supplier.tier === 1) score += 0.3;
        else if (supplier.tier === 2) score += 0.1;
        else score -= 0.1;
        
        // Verification status
        if (supplier.verified) score += 0.2;
        
        // Location risk assessment
        const locationRisk = this.fraudPatterns.locationRisks[supplier.location] || 0;
        score -= locationRisk * 0.3;
        
        return Math.max(0, Math.min(1, score));
    }
    
    // Evaluate product authenticity markers
    evaluateProductAuthenticity(product) {
        if (!product) return 0;
        
        let score = 0.5;
        
        // Check for authenticity markers
        if (product.authenticity_markers) {
            const markers = product.authenticity_markers;
            if (markers.hologram_id) score += 0.2;
            if (markers.qr_code) score += 0.15;
            if (markers.nfc_tag) score += 0.15;
            if (markers.tamper_seal) score += 0.1;
        }
        
        // Product hash validation
        if (product.product_hash && this.validateProductHash(product)) {
            score += 0.2;
        }
        
        // Batch number pattern analysis
        if (this.isSuspiciousBatch(product.batch_number)) {
            score -= 0.4;
        }
        
        return Math.max(0, Math.min(1, score));
    }
    
    // Evaluate supply chain integrity
    evaluateSupplyChainIntegrity(supplyChain) {
        if (!supplyChain) return 0.3;
        
        let score = 0.5;
        
        // Check for complete supply chain
        if (supplyChain.origin) score += 0.2;
        if (supplyChain.destination) score += 0.1;
        
        // Intermediate verification
        if (supplyChain.intermediates && supplyChain.intermediates.length > 0) {
            const validIntermediates = supplyChain.intermediates.filter(id => id !== 0).length;
            score += (validIntermediates / supplyChain.intermediates.length) * 0.2;
        }
        
        // Signature validation
        if (supplyChain.signatures) {
            if (supplyChain.signatures.manufacturer) score += 0.1;
            if (supplyChain.signatures.distributor) score += 0.1;
        }
        
        return Math.max(0, Math.min(1, score));
    }
    
    // Evaluate temporal consistency
    evaluateTemporalConsistency(product) {
        if (!product.manufacturing_date) return 0.5;
        
        const now = Date.now() / 1000;
        const mfgDate = product.manufacturing_date;
        const daysSinceManufacture = (now - mfgDate) / (24 * 60 * 60);
        
        // Products should not be from the future
        if (mfgDate > now) return 0;
        
        // Very old products might be suspicious
        if (daysSinceManufacture > 365 * 5) return 0.3; // 5+ years old
        if (daysSinceManufacture > 365 * 2) return 0.6; // 2+ years old
        if (daysSinceManufacture > 365) return 0.8; // 1+ year old
        
        return 1.0; // Recent products are good
    }
    
    // Evaluate certification validity
    evaluateCertifications(supplier) {
        if (!supplier || !supplier.certifications) return 0.3;
        
        const validCertifications = ['ISO 9001', 'ISO 14001', 'GMP', 'FDA', 'EMA', 'RoHS', 'USDA Organic', 'Fair Trade'];
        const supplierCerts = supplier.certifications;
        
        const validCount = supplierCerts.filter(cert => validCertifications.includes(cert)).length;
        return Math.min(1, validCount / 3); // Max score with 3+ valid certifications
    }
    
    // Detect fraud patterns
    detectFraudPatterns(product, supplier) {
        const flags = [];
        
        // Suspicious batch patterns
        if (this.isSuspiciousBatch(product.batch_number)) {
            flags.push({
                type: 'suspicious_batch',
                severity: 'high',
                message: 'Batch number matches known counterfeit patterns'
            });
        }
        
        // Missing authenticity markers
        if (!product.authenticity_markers || Object.keys(product.authenticity_markers).length === 0) {
            flags.push({
                type: 'missing_auth_markers',
                severity: 'medium',
                message: 'Product lacks authenticity verification markers'
            });
        }
        
        // Unverified supplier
        if (!supplier.verified || supplier.trust_score < 50) {
            flags.push({
                type: 'unverified_supplier',
                severity: 'high',
                message: 'Product from unverified or low-trust supplier'
            });
        }
        
        // Incomplete supply chain
        if (!product.supply_chain || !product.supply_chain.origin) {
            flags.push({
                type: 'incomplete_supply_chain',
                severity: 'medium',
                message: 'Supply chain information is incomplete'
            });
        }
        
        return flags;
    }
    
    // Check if batch number matches suspicious patterns
    isSuspiciousBatch(batchNumber) {
        if (!batchNumber) return true;
        
        return this.fraudPatterns.batchAnomalies.some(pattern => 
            pattern.test(batchNumber.toUpperCase())
        );
    }
    
    // Validate product hash integrity
    validateProductHash(product) {
        // Simple hash validation - in real implementation, this would verify against blockchain
        const expectedHash = crypto.createHash('sha256')
            .update(`${product.name}${product.batch_number}${product.manufacturing_date}`)
            .digest('hex');
        
        return product.product_hash && product.product_hash.length === 66; // 0x + 64 hex chars
    }
    
    // Calculate risk level based on trust score and fraud flags
    calculateRiskLevel(trustScore, fraudFlags) {
        const highSeverityFlags = fraudFlags.filter(flag => flag.severity === 'high').length;
        const mediumSeverityFlags = fraudFlags.filter(flag => flag.severity === 'medium').length;
        
        if (trustScore < 30 || highSeverityFlags >= 2) return 'high';
        if (trustScore < 60 || highSeverityFlags >= 1 || mediumSeverityFlags >= 2) return 'medium';
        return 'low';
    }
    
    // Generate recommendations based on assessment
    generateRecommendations(trustScore, fraudFlags) {
        const recommendations = [];
        
        if (trustScore < 50) {
            recommendations.push('Consider additional verification before accepting this product');
        }
        
        if (fraudFlags.some(flag => flag.type === 'unverified_supplier')) {
            recommendations.push('Verify supplier credentials and certifications');
        }
        
        if (fraudFlags.some(flag => flag.type === 'missing_auth_markers')) {
            recommendations.push('Request additional authenticity documentation');
        }
        
        if (fraudFlags.some(flag => flag.type === 'suspicious_batch')) {
            recommendations.push('Investigate batch number authenticity with manufacturer');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('Product appears authentic and trustworthy');
        }
        
        return recommendations;
    }
    
    // Generate anti-counterfeit report
    generateAntiCounterfeitReport(product, supplier, category) {
        const assessment = this.assessProductTrust(product, supplier, category);
        
        return {
            productId: product.id,
            supplierName: supplier.name,
            trustScore: assessment.trustScore,
            confidenceScore: assessment.confidenceScore,
            riskLevel: assessment.riskLevel,
            anomalyScore: assessment.anomalyScore,
            fraudFlags: assessment.fraudFlags,
            recommendations: assessment.recommendations,
            timestamp: new Date().toISOString(),
            reportId: crypto.randomBytes(16).toString('hex'),
            version: assessment.version
        };
    }
    
    // Data normalization methods
    normalizeProductData(product) {
        if (!product) return {};
        return {
            id: product.id || crypto.randomBytes(8).toString('hex'),
            name: product.name || 'Unknown Product',
            batch_number: product.batch_number || product.batchNumber || '',
            serial_number: product.serial_number || product.serialNumber || '',
            manufacturing_date: product.manufacturing_date || product.manufacturingDate || Date.now(),
            supply_chain: product.supply_chain || product.supplyChain || {},
            authenticity_markers: product.authenticity_markers || product.authenticityMarkers || [],
            category: product.category || 'General'
        };
    }
    
    normalizeSupplierData(supplier) {
        if (!supplier) return {};
        return {
            id: supplier.id || crypto.randomBytes(8).toString('hex'),
            name: supplier.name || 'Unknown Supplier',
            tier: supplier.tier || 3,
            trust_score: supplier.trust_score || supplier.trustScore || 50,
            location: supplier.location || 'Unknown Location',
            certifications: supplier.certifications || [],
            verified: supplier.verified || false,
            verified_since: supplier.verified_since || supplier.verifiedSince || null,
            specialties: supplier.specialties || []
        };
    }
    
    normalizeCategoryData(category) {
        if (!category) return { risk_factor: 0.5 };
        return {
            name: category.name || 'General',
            risk_factor: category.risk_factor || category.riskFactor || 0.5,
            regulations: category.regulations || []
        };
    }
    
    // Enhanced scoring methods
    calculateWeightedTrustScore(scores) {
        try {
            const weightedScore = (
                scores.supplierTrust * this.trustFactors.supplierHistory +
                scores.certificationValidity * this.trustFactors.certificationValid +
                scores.supplyChainIntegrity * this.trustFactors.supplyChainIntegrity +
                scores.productAuthenticity * this.trustFactors.productAuthenticity +
                scores.temporalConsistency * this.trustFactors.temporalConsistency +
                scores.behavioralPatterns * this.trustFactors.behavioralPatterns
            ) * 100;
            
            return Math.max(0, Math.min(100, weightedScore));
        } catch (error) {
            console.error('Error calculating weighted trust score:', error);
            return 50; // Default neutral score
        }
    }
    
    calculateConfidenceScore(scores, product, supplier) {
        try {
            let confidence = 50; // Base confidence
            
            // Data completeness factor
            const dataCompleteness = this.assessDataCompleteness(product, supplier);
            confidence += dataCompleteness * 30;
            
            // Score consistency factor
            const scoreVariance = this.calculateScoreVariance(scores);
            confidence += (1 - scoreVariance) * 20;
            
            return Math.max(0, Math.min(100, confidence));
        } catch (error) {
            console.error('Error calculating confidence score:', error);
            return 50;
        }
    }
    
    evaluateBehavioralPatterns(product, supplier) {
        try {
            let score = 0.5;
            
            // Check for consistent naming patterns
            if (product.name && supplier.name) {
                const namingConsistency = this.checkNamingConsistency(product.name, supplier.specialties);
                score += namingConsistency * 0.3;
            }
            
            // Check production timing patterns
            if (product.manufacturing_date) {
                const timingScore = this.evaluateProductionTiming(product.manufacturing_date);
                score += timingScore * 0.2;
            }
            
            return Math.max(0, Math.min(1, score));
        } catch (error) {
            console.error('Error evaluating behavioral patterns:', error);
            return 0.5;
        }
    }
    
    detectAnomalies(product, supplier, scores) {
        try {
            let anomalyScore = 0;
            
            // Statistical anomaly detection
            const scoreArray = Object.values(scores);
            const mean = scoreArray.reduce((a, b) => a + b, 0) / scoreArray.length;
            const variance = scoreArray.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scoreArray.length;
            
            if (variance > this.anomalyThreshold) {
                anomalyScore += 0.3;
            }
            
            // Pattern-based anomaly detection
            if (this.detectPatternAnomalies(product, supplier)) {
                anomalyScore += 0.4;
            }
            
            // Temporal anomaly detection
            if (this.detectTemporalAnomalies(product)) {
                anomalyScore += 0.3;
            }
            
            return Math.max(0, Math.min(1, anomalyScore));
        } catch (error) {
            console.error('Error detecting anomalies:', error);
            return 0;
        }
    }
    
    updateLearningPatterns(product, supplier, scores, trustScore) {
        try {
            const pattern = {
                productFeatures: this.extractProductFeatures(product),
                supplierFeatures: this.extractSupplierFeatures(supplier),
                scores,
                trustScore,
                timestamp: Date.now()
            };
            
            // Simple learning: store patterns for future reference
            if (trustScore > 80) {
                this.historicalPatterns.legitimateCases.push(pattern);
            } else if (trustScore < 40) {
                this.historicalPatterns.fraudCases.push(pattern);
            }
            
            // Keep only recent patterns (last 1000 cases)
            if (this.historicalPatterns.legitimateCases.length > 1000) {
                this.historicalPatterns.legitimateCases = this.historicalPatterns.legitimateCases.slice(-1000);
            }
            if (this.historicalPatterns.fraudCases.length > 1000) {
                this.historicalPatterns.fraudCases = this.historicalPatterns.fraudCases.slice(-1000);
            }
            
            this.historicalPatterns.lastUpdated = Date.now();
        } catch (error) {
            console.error('Error updating learning patterns:', error);
        }
    }
    
    getDefaultTrustAssessment(errorMessage) {
        return {
            trustScore: 50,
            confidenceScore: 0,
            riskLevel: 'UNKNOWN',
            anomalyScore: 1,
            fraudFlags: ['DATA_ERROR'],
            detailedScores: {
                supplierTrust: 0.5,
                productAuthenticity: 0.5,
                supplyChainIntegrity: 0.5,
                temporalConsistency: 0.5,
                certificationValidity: 0.5,
                behavioralPatterns: 0.5
            },
            recommendations: ['Data validation required', 'Manual review recommended'],
            timestamp: Date.now(),
            version: '2.0',
            error: errorMessage
        };
    }
    
    // Helper methods for enhanced functionality
    assessDataCompleteness(product, supplier) {
        const productFields = ['id', 'name', 'batch_number', 'manufacturing_date'];
        const supplierFields = ['id', 'name', 'tier', 'trust_score', 'location'];
        
        const productCompleteness = productFields.filter(field => product[field]).length / productFields.length;
        const supplierCompleteness = supplierFields.filter(field => supplier[field]).length / supplierFields.length;
        
        return (productCompleteness + supplierCompleteness) / 2;
    }
    
    calculateScoreVariance(scores) {
        const scoreArray = Object.values(scores);
        const mean = scoreArray.reduce((a, b) => a + b, 0) / scoreArray.length;
        return scoreArray.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scoreArray.length;
    }
    
    checkNamingConsistency(productName, supplierSpecialties) {
        if (!Array.isArray(supplierSpecialties)) return 0;
        return supplierSpecialties.some(specialty => 
            productName.toLowerCase().includes(specialty.toLowerCase())
        ) ? 1 : 0;
    }
    
    evaluateProductionTiming(manufacturingDate) {
        const date = new Date(manufacturingDate);
        const day = date.getDay();
        const hour = date.getHours();
        
        // Penalize weekend production (suspicious)
        if (day === 0 || day === 6) return -0.3;
        
        // Penalize night production (8 PM - 6 AM)
        if (hour < 6 || hour > 20) return -0.2;
        
        return 0.1; // Normal production time
    }
    
    detectPatternAnomalies(product, supplier) {
        // Check for suspicious batch patterns
        if (product.batch_number) {
            return this.fraudPatterns.batchAnomalies.some(pattern => 
                pattern.test(product.batch_number)
            );
        }
        return false;
    }
    
    detectTemporalAnomalies(product) {
        if (!product.manufacturing_date) return false;
        
        const date = new Date(product.manufacturing_date);
        const now = new Date();
        
        // Future date anomaly
        if (date > now) return true;
        
        // Too old anomaly (more than 5 years)
        const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
        if (date < fiveYearsAgo) return true;
        
        return false;
    }
    
    extractProductFeatures(product) {
        return {
            hasSerialNumber: !!product.serial_number,
            hasBatchNumber: !!product.batch_number,
            hasManufacturingDate: !!product.manufacturing_date,
            categoryType: product.category,
            nameLength: product.name ? product.name.length : 0
        };
    }
    
    extractSupplierFeatures(supplier) {
        return {
            tier: supplier.tier,
            trustScore: supplier.trust_score,
            hasLocation: !!supplier.location,
            certificationCount: Array.isArray(supplier.certifications) ? supplier.certifications.length : 0,
            specialtyCount: Array.isArray(supplier.specialties) ? supplier.specialties.length : 0,
            isVerified: supplier.verified
        };
    }
}

module.exports = MLTrustEngine;