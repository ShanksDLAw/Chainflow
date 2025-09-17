#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Enhanced ChainFlow Features
 * Tests zkVerify integration, ML continuous learning, and supplier verification
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Import services
const ZKVerifyService = require('./backend/zkverify-service');
const MLTrustService = require('./backend/ml-trust-service');

class EnhancedFeaturesTester {
    constructor() {
        this.baseURL = 'http://localhost:3000';
        this.zkVerifyService = new ZKVerifyService();
        this.mlTrustService = new MLTrustService();
        this.testResults = {
            zkVerify: {},
            mlLearning: {},
            supplierVerification: {},
            endToEnd: {}
        };
    }

    async runAllTests() {
        console.log('🧪 Starting Enhanced Features Test Suite...\n');
        
        try {
            // Initialize services
            await this.initializeServices();
            
            // Test zkVerify integration
            await this.testZKVerifyIntegration();
            
            // Test ML continuous learning
            await this.testMLContinuousLearning();
            
            // Test supplier verification
            await this.testSupplierVerification();
            
            // Test healthcare products
            await this.testHealthcareProducts();
            
            // Test military products
            await this.testMilitaryProducts();
            
            // Test last-mile delivery
            await this.testLastMileDelivery();
            
            // End-to-end integration test
            await this.testEndToEndIntegration();
            
            // Generate test report
            this.generateTestReport();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
        }
    }

    async initializeServices() {
        console.log('🔧 Initializing services...');
        
        try {
            // Initialize zkVerify service
            const zkInitialized = await this.zkVerifyService.initialize();
            console.log(`✅ zkVerify Service: ${zkInitialized ? 'Connected' : 'Failed'}`);
            
            // ML service is already initialized in constructor
            console.log('✅ ML Trust Service: Initialized');
            
            console.log('');
        } catch (error) {
            console.error('❌ Service initialization failed:', error);
        }
    }

    async testZKVerifyIntegration() {
        console.log('🔐 Testing zkVerify Integration...');
        
        try {
            // Test supply chain proof generation
            const productData = {
                id: 'P015',
                category: 'Healthcare',
                batch_number: 'INSULIN-2024-001',
                manufacturing_date: '2024-01-15'
            };
            
            const supplierData = {
                id: 'S001',
                name: 'MedTech Solutions',
                location: 'Boston, MA',
                tier: 1,
                hipaa_compliant: true
            };
            
            const routeData = {
                origin: 'Boston, MA',
                destination: 'New York, NY',
                optimization_score: 92
            };
            
            const proofResult = await this.zkVerifyService.generateSupplyChainProof(
                productData, supplierData, routeData
            );
            
            this.testResults.zkVerify.supplyChainProof = {
                success: proofResult.success,
                proofId: proofResult.proofId,
                timestamp: new Date().toISOString()
            };
            
            console.log(`  ✅ Supply Chain Proof: ${proofResult.success ? 'Generated' : 'Failed'}`);
            
            // Test verification stats
            const stats = await this.zkVerifyService.getVerificationStats();
            this.testResults.zkVerify.stats = stats;
            console.log(`  ✅ Verification Stats: Retrieved`);
            
        } catch (error) {
            console.error('  ❌ zkVerify test failed:', error.message);
            this.testResults.zkVerify.error = error.message;
        }
        
        console.log('');
    }

    async testMLContinuousLearning() {
        console.log('🧠 Testing ML Continuous Learning...');
        
        try {
            // Test trust assessment
            const product = {
                id: 'P016',
                category: 'Healthcare',
                price: 1500,
                batch_number: 'VACCINE-2024-002'
            };
            
            const supplier = {
                id: 'S002',
                name: 'BioPharm Corp',
                rating: 4.5,
                established_date: '2015-03-01',
                location: 'San Francisco, CA',
                hipaa_compliant: true
            };
            
            const trustAssessment = this.mlTrustService.assessProductTrust(
                product, supplier, { name: 'Healthcare' }
            );
            
            console.log(`  ✅ Trust Assessment: Score ${trustAssessment.trustScore}`);
            
            // Test feedback incorporation
            const feedbackResult = this.mlTrustService.simulateFeedback(
                product, supplier, trustAssessment.trustScore
            );
            
            console.log(`  ✅ Feedback Incorporated: ${feedbackResult.feedback.predictionId}`);
            
            // Test performance metrics
            const metrics = this.mlTrustService.getPerformanceMetrics();
            this.testResults.mlLearning = {
                trustAssessment,
                feedback: feedbackResult,
                metrics,
                timestamp: new Date().toISOString()
            };
            
            console.log(`  ✅ Performance Metrics: Accuracy ${(metrics.accuracy * 100).toFixed(1)}%`);
            
        } catch (error) {
            console.error('  ❌ ML learning test failed:', error.message);
            this.testResults.mlLearning.error = error.message;
        }
        
        console.log('');
    }

    async testSupplierVerification() {
        console.log('🏭 Testing Supplier Verification...');
        
        try {
            // Test individual supplier verification
            const supplier = {
                id: 'S003',
                name: 'Defense Systems Inc',
                business_license: 'DEF-LIC-2024-001',
                tax_id: 'TAX-123456789',
                established_date: '2010-01-01',
                location: 'Arlington, VA',
                tier: 1,
                rating: 4.8,
                military_grade: true,
                iso27001_certified: true,
                trust_score: 0.92
            };
            
            const verificationResult = await this.zkVerifyService.generateSupplierVerificationProof(supplier);
            console.log(`  ✅ Supplier Verification: ${verificationResult.success ? 'Passed' : 'Failed'}`);
            
            // Test compliance verification
            const complianceResult = await this.zkVerifyService.verifySupplierCompliance(
                supplier, ['military', 'iso27001']
            );
            console.log(`  ✅ Compliance Check: ${complianceResult.allCompliant ? 'Compliant' : 'Non-compliant'}`);
            
            // Test trust attestation
            const trustMetrics = {
                trustScore: 0.92,
                reliability: 0.95,
                quality: 0.88,
                delivery: 0.90,
                communication: 0.85,
                totalOrders: 150,
                successfulDeliveries: 142,
                averageDeliveryTime: 3.2,
                riskLevel: 0.05,
                fraudFlags: 0
            };
            
            const attestationResult = await this.zkVerifyService.generateSupplierTrustAttestation(
                supplier, trustMetrics
            );
            console.log(`  ✅ Trust Attestation: ${attestationResult.success ? 'Generated' : 'Failed'}`);
            
            this.testResults.supplierVerification = {
                verification: verificationResult,
                compliance: complianceResult,
                attestation: attestationResult,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('  ❌ Supplier verification test failed:', error.message);
            this.testResults.supplierVerification.error = error.message;
        }
        
        console.log('');
    }

    async testHealthcareProducts() {
        console.log('🏥 Testing Healthcare Products...');
        
        try {
            const healthcareProducts = [
                {
                    id: 'P015',
                    name: 'Digital Insulin Pump',
                    category: 'Healthcare',
                    hipaa_compliant: true,
                    fda_approved: true
                },
                {
                    id: 'P016',
                    name: 'COVID-19 Vaccine',
                    category: 'Healthcare',
                    hipaa_compliant: true,
                    cold_chain_required: true
                },
                {
                    id: 'P017',
                    name: 'Cardiac Pacemaker',
                    category: 'Healthcare',
                    hipaa_compliant: true,
                    biocompatible: true
                }
            ];
            
            // Test each healthcare product
            for (const product of healthcareProducts) {
                const supplier = {
                    id: `S-${product.id}`,
                    name: `Healthcare Supplier for ${product.name}`,
                    hipaa_compliant: true,
                    fda_registered: true
                };
                
                const trustAssessment = this.mlTrustService.assessProductTrust(
                    product, supplier, { name: 'Healthcare' }
                );
                
                console.log(`  ✅ ${product.name}: Trust Score ${trustAssessment.trustScore}`);
            }
            
            // Check if logos exist
            const logoFiles = [
                'insulin_pump.svg',
                'vaccine_vial.svg',
                'cardiac_pacemaker.svg'
            ];
            
            for (const logoFile of logoFiles) {
                const logoPath = path.join(__dirname, 'images', logoFile);
                const exists = fs.existsSync(logoPath);
                console.log(`  ${exists ? '✅' : '❌'} Logo ${logoFile}: ${exists ? 'Found' : 'Missing'}`);
            }
            
        } catch (error) {
            console.error('  ❌ Healthcare products test failed:', error.message);
        }
        
        console.log('');
    }

    async testMilitaryProducts() {
        console.log('🛡️ Testing Military Products...');
        
        try {
            const militaryProducts = [
                {
                    id: 'P018',
                    name: 'Encrypted Communication Device',
                    category: 'Military',
                    security_clearance_required: 'SECRET',
                    encryption_level: 'AES-256'
                },
                {
                    id: 'P019',
                    name: 'Night Vision Goggles',
                    category: 'Military',
                    security_clearance_required: 'CONFIDENTIAL',
                    night_vision_generation: 'Gen 3+'
                },
                {
                    id: 'P020',
                    name: 'Tactical Body Armor',
                    category: 'Military',
                    ballistic_rating: 'NIJ Level IIIA',
                    weight: '2.8kg'
                }
            ];
            
            // Test each military product
            for (const product of militaryProducts) {
                const supplier = {
                    id: `S-${product.id}`,
                    name: `Defense Contractor for ${product.name}`,
                    military_grade: true,
                    security_clearance: product.security_clearance_required || 'SECRET'
                };
                
                const trustAssessment = this.mlTrustService.assessProductTrust(
                    product, supplier, { name: 'Military' }
                );
                
                console.log(`  ✅ ${product.name}: Trust Score ${trustAssessment.trustScore}`);
            }
            
            // Check if logos exist
            const logoFiles = [
                'communication_device.svg',
                'night_vision_goggles.svg',
                'tactical_body_armor.svg'
            ];
            
            for (const logoFile of logoFiles) {
                const logoPath = path.join(__dirname, 'images', logoFile);
                const exists = fs.existsSync(logoPath);
                console.log(`  ${exists ? '✅' : '❌'} Logo ${logoFile}: ${exists ? 'Found' : 'Missing'}`);
            }
            
        } catch (error) {
            console.error('  ❌ Military products test failed:', error.message);
        }
        
        console.log('');
    }

    async testLastMileDelivery() {
        console.log('🚚 Testing Last-Mile Delivery Optimization...');
        
        try {
            // Simulate last-mile delivery scenario
            const deliveryData = {
                driver: {
                    id: 'D001',
                    name: 'John Doe',
                    license: 'DL-123456',
                    verified: true
                },
                recipient: {
                    id: 'R001',
                    name: 'Jane Smith',
                    address: '123 Main St, New York, NY',
                    verified: true
                },
                package: {
                    id: 'PKG-001',
                    weight: 2.5,
                    dimensions: '30x20x15cm',
                    value: 500
                },
                route: {
                    origin: 'Distribution Center, Brooklyn, NY',
                    destination: '123 Main St, New York, NY',
                    distance: 15.2,
                    estimatedTime: 45
                }
            };
            
            // Generate delivery optimization proof
            const deliveryProof = await this.zkVerifyService.generateRouteOptimizationProof(
                deliveryData.route,
                { optimizationScore: 88, fuelEfficiency: 0.92 }
            );
            
            console.log(`  ✅ Delivery Optimization Proof: ${deliveryProof.success ? 'Generated' : 'Failed'}`);
            
            // Test driver verification
            const driverVerification = await this.zkVerifyService.generateSupplierVerificationProof(
                deliveryData.driver
            );
            
            console.log(`  ✅ Driver Verification: ${driverVerification.success ? 'Verified' : 'Failed'}`);
            
        } catch (error) {
            console.error('  ❌ Last-mile delivery test failed:', error.message);
        }
        
        console.log('');
    }

    async testEndToEndIntegration() {
        console.log('🔄 Testing End-to-End Integration...');
        
        try {
            // Simulate complete supply chain flow
            const product = {
                id: 'P021',
                name: 'Medical Device Test',
                category: 'Healthcare',
                batch_number: 'MED-2024-TEST-001',
                manufacturing_date: '2024-01-20',
                price: 2500,
                hipaa_compliant: true
            };
            
            const supplier = {
                id: 'S021',
                name: 'Integrated Test Supplier',
                location: 'Boston, MA',
                tier: 1,
                rating: 4.7,
                established_date: '2018-01-01',
                hipaa_compliant: true,
                iso27001_certified: true,
                trust_score: 0.89
            };
            
            const route = {
                origin: 'Boston, MA',
                destination: 'Miami, FL',
                optimization_score: 91
            };
            
            // Step 1: Supplier verification
            console.log('  🔍 Step 1: Supplier Verification...');
            const supplierVerification = await this.zkVerifyService.generateSupplierVerificationProof(supplier);
            
            // Step 2: ML trust assessment
            console.log('  🧠 Step 2: ML Trust Assessment...');
            const trustAssessment = this.mlTrustService.assessProductTrust(
                product, supplier, { name: 'Healthcare' }
            );
            
            // Step 3: Supply chain proof
            console.log('  🔐 Step 3: Supply Chain Proof...');
            const supplyChainProof = await this.zkVerifyService.generateSupplyChainProof(
                product, supplier, route
            );
            
            // Step 4: Feedback incorporation
            console.log('  📊 Step 4: Feedback Incorporation...');
            const feedback = this.mlTrustService.simulateFeedback(
                product, supplier, trustAssessment.trustScore
            );
            
            // Step 5: Trust attestation
            console.log('  🛡️ Step 5: Trust Attestation...');
            const trustMetrics = {
                trustScore: trustAssessment.trustScore,
                reliability: 0.91,
                quality: 0.87,
                delivery: 0.93,
                communication: 0.89,
                totalOrders: 75,
                successfulDeliveries: 72,
                averageDeliveryTime: 2.8,
                riskLevel: 0.08,
                fraudFlags: 0
            };
            
            const trustAttestation = await this.zkVerifyService.generateSupplierTrustAttestation(
                supplier, trustMetrics
            );
            
            this.testResults.endToEnd = {
                supplierVerification: supplierVerification.success,
                trustAssessment: trustAssessment.trustScore,
                supplyChainProof: supplyChainProof.success,
                feedbackIncorporated: !!feedback.feedback,
                trustAttestation: trustAttestation.success,
                overallSuccess: supplierVerification.success && 
                               supplyChainProof.success && 
                               trustAttestation.success,
                timestamp: new Date().toISOString()
            };
            
            console.log(`  ✅ End-to-End Integration: ${this.testResults.endToEnd.overallSuccess ? 'PASSED' : 'FAILED'}`);
            
        } catch (error) {
            console.error('  ❌ End-to-end integration test failed:', error.message);
            this.testResults.endToEnd.error = error.message;
        }
        
        console.log('');
    }

    generateTestReport() {
        console.log('📋 Generating Test Report...\n');
        
        const report = {
            testSuite: 'Enhanced ChainFlow Features',
            timestamp: new Date().toISOString(),
            results: this.testResults,
            summary: {
                zkVerifyIntegration: !!this.testResults.zkVerify.supplyChainProof?.success,
                mlContinuousLearning: !!this.testResults.mlLearning.trustAssessment,
                supplierVerification: !!this.testResults.supplierVerification.verification?.success,
                endToEndIntegration: !!this.testResults.endToEnd.overallSuccess,
                overallSuccess: true
            }
        };
        
        // Calculate overall success
        report.summary.overallSuccess = Object.values(report.summary).every(result => result === true);
        
        // Save report to file
        const reportPath = path.join(__dirname, 'test_report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // Display summary
        console.log('📊 TEST SUMMARY:');
        console.log('================');
        console.log(`zkVerify Integration: ${report.summary.zkVerifyIntegration ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`ML Continuous Learning: ${report.summary.mlContinuousLearning ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`Supplier Verification: ${report.summary.supplierVerification ? '✅ PASS' : '❌ FAIL'}`);
        console.log(`End-to-End Integration: ${report.summary.endToEndIntegration ? '✅ PASS' : '❌ FAIL'}`);
        console.log('================');
        console.log(`OVERALL RESULT: ${report.summary.overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
        console.log(`\nDetailed report saved to: ${reportPath}`);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new EnhancedFeaturesTester();
    tester.runAllTests().catch(console.error);
}

module.exports = EnhancedFeaturesTester;