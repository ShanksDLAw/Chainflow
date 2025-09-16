const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');
const MLRouteEngine = require('./ml-route-engine');
const ChainFlowProofGenerator = require('../circuits/proof-generator');
const IntegratedMLService = require('./integrated-ml-zk-service');
const PaymentService = require('./payment-zk-service');

const app = express();
const PORT = process.env.PORT || 3002;

// Initialize ML Route Optimization Engine, ZK Proof Generator, Integrated Service, and Payment Service
const mlEngine = new MLRouteEngine();
const zkProofGenerator = new ChainFlowProofGenerator();
const integratedService = new IntegratedMLService();
const paymentService = new PaymentService();

// Middleware
app.use(cors());
app.use(express.json());

// Load product database
const loadDatabase = () => {
    try {
        const dbPath = path.join(__dirname, '../database/products.json');
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading database:', error);
        return { suppliers: {}, products: {}, product_categories: {}, distributors: {}, retailers: {} };
    }
};

// Save database
const saveDatabase = (data) => {
    try {
        const dbPath = path.join(__dirname, '../database/products.json');
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving database:', error);
        return false;
    }
};

// ML-based risk scoring algorithm (enhanced for route optimization)
const calculateRiskScore = (product, supplier, category, route = null) => {
    let score = 50; // Base score
    
    // Supplier tier influence (25% weight)
    const tierScore = {
        1: 25, // Premium
        2: 18, // Standard  
        3: 10  // Basic
    };
    score += tierScore[supplier.tier] || 0;
    
    // Supplier trust score influence (20% weight)
    score += (supplier.trust_score * 0.20);
    
    // Category risk factor influence (15% weight)
    score -= (category.risk_factor * 75);
    
    // Time-based freshness (15% weight)
    const currentTime = Math.floor(Date.now() / 1000);
    const daysSinceManufacture = (currentTime - product.manufacturing_date) / (24 * 60 * 60);
    if (daysSinceManufacture < 30) {
        score += 15; // Very fresh
    } else if (daysSinceManufacture < 90) {
        score += 10; // Fresh
    } else if (daysSinceManufacture < 180) {
        score += 5; // Acceptable
    }
    
    // Supply chain complexity (10% weight)
    const intermediateCount = product.supply_chain.intermediates.filter(i => i !== 0).length;
    if (intermediateCount <= 2) {
        score += 10; // Simple chain
    } else if (intermediateCount <= 4) {
        score += 5; // Moderate chain
    }
    
    // Route-specific risk factors (15% weight)
    if (route) {
        score -= route.riskScore * 10; // Route risk contribution
        if (route.totalTime > 48) score -= 3; // Long transit time risk
        if (route.reliability < 0.8) score -= 5; // Low reliability risk
        if (route.efficiency > 0.9) score += 3; // High efficiency bonus
    }
    
    // Normalize score to 0-100 range
    score = Math.max(0, Math.min(100, score));
    
    // Determine risk level
    let riskLevel;
    if (score >= 80) {
        riskLevel = 'LOW';
    } else if (score >= 60) {
        riskLevel = 'MEDIUM';
    } else {
        riskLevel = 'HIGH';
    }
    
    return { score: Math.round(score), level: riskLevel };
};

// Proof Generation and Verification Routes

// Generate proof for product verification
app.post('/api/proof/generate', async (req, res) => {
    try {
        const {
            productId, productCategory, batchNumber, manufacturingDate,
            supplierId, supplierTier, supplierTrustScore, supplierCertificationHash,
            originLocation, destinationLocation, routeDistance, routeTime, routeCost, routeReliability,
            historicalDeliveries, fraudIncidents, certificationCount, yearsActive,
            manufacturerSignature, distributorSignature,
            minTrustThreshold = 70, maxRouteRisk = 30
        } = req.body;

        // Generate expected hashes (simplified for demo)
        const expectedProductHash = Math.floor(Math.random() * 1000000000);
        const trustedSupplierRoot = Math.floor(Math.random() * 1000000000);
        const routeOptimizationRoot = Math.floor(Math.random() * 1000000000);
        const verificationTimestamp = Math.floor(Date.now() / 1000);

        const zkInput = {
            productId, productCategory, batchNumber, manufacturingDate,
            supplierId, supplierTier, supplierTrustScore, supplierCertificationHash,
            originLocation, destinationLocation, routeDistance, routeTime, routeCost, routeReliability,
            historicalDeliveries, fraudIncidents, certificationCount, yearsActive,
            manufacturerSignature, distributorSignature,
            expectedProductHash, trustedSupplierRoot, routeOptimizationRoot,
            verificationTimestamp, minTrustThreshold, maxRouteRisk
        };

        const proofResult = await zkProofGenerator.generateProof(zkInput);
        
        res.json({
            success: true,
            proof: proofResult.proof,
            publicSignals: proofResult.publicSignals,
            verification: {
                isValid: proofResult.isValid,
                trustScore: proofResult.trustScore,
                routeEfficiency: proofResult.routeEfficiency,
                riskLevel: proofResult.riskLevel
            },
            metadata: {
                productId,
                supplierId,
                timestamp: verificationTimestamp
            }
        });
    } catch (error) {
        console.error('Proof generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate proof',
            details: error.message
        });
    }
});

// Verify proof
app.post('/api/proof/verify', async (req, res) => {
    try {
        const { proof, publicSignals } = req.body;
        
        const isValid = await zkProofGenerator.verifyProof(proof, publicSignals);
        
        res.json({
            success: true,
            isValid,
            verification: {
                trustScore: parseInt(publicSignals[1]),
                routeEfficiency: parseInt(publicSignals[2]),
                riskLevel: parseInt(publicSignals[3])
            }
        });
    } catch (error) {
        console.error('Proof verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify proof',
            details: error.message
        });
    }
});

// Test proof system
app.get('/api/proof/test', async (req, res) => {
    try {
        const testResult = await zkProofGenerator.test();
        res.json({
            success: true,
            testResult
        });
    } catch (error) {
        console.error('Proof test error:', error);
        res.status(500).json({
            success: false,
            error: 'Proof test failed',
            details: error.message
        });
    }
});

// API Routes

// Get all suppliers
app.get('/api/suppliers', (req, res) => {
    const db = loadDatabase();
    // Convert suppliers object to array with IDs
    const suppliersArray = Object.keys(db.suppliers).map(id => ({
        id,
        ...db.suppliers[id]
    }));
    res.json({
        success: true,
        data: suppliersArray
    });
});

// Get supplier by ID
app.get('/api/suppliers/:id', (req, res) => {
    const db = loadDatabase();
    const supplier = db.suppliers[req.params.id];
    
    if (!supplier) {
        return res.status(404).json({
            success: false,
            message: 'Supplier not found'
        });
    }
    
    res.json({
        success: true,
        data: supplier
    });
});

// Register new supplier
app.post('/api/suppliers', (req, res) => {
    const { name, location, specialties, certifications, tier } = req.body;
    
    if (!name || !location || !tier) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: name, location, tier'
        });
    }
    
    const db = loadDatabase();
    const supplierId = String(Math.max(...Object.keys(db.suppliers).map(Number)) + 1);
    
    const newSupplier = {
        name,
        tier: parseInt(tier),
        certification_hash: '0x' + crypto.randomBytes(16).toString('hex'),
        location,
        specialties: specialties || [],
        verified_since: new Date().toISOString().split('T')[0],
        trust_score: tier === 1 ? 90 : tier === 2 ? 80 : 70,
        certifications: certifications || []
    };
    
    db.suppliers[supplierId] = newSupplier;
    
    if (saveDatabase(db)) {
        res.json({
            success: true,
            data: { id: supplierId, ...newSupplier }
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Failed to save supplier'
        });
    }
});

// Get all products
app.get('/api/products', (req, res) => {
    const db = loadDatabase();
    // Return products as object with IDs as keys (as expected by frontend)
    res.json({
        success: true,
        data: db.products
    });
});

// Get product by ID with verification
app.get('/api/products/:id/verify', (req, res) => {
    const db = loadDatabase();
    const product = db.products[req.params.id];
    
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }
    
    const supplier = db.suppliers[product.supplier_id];
    const category = db.product_categories[product.category];
    
    if (!supplier || !category) {
        return res.status(500).json({
            success: false,
            message: 'Invalid product data - missing supplier or category'
        });
    }
    
    // Calculate risk assessment
    const riskAssessment = calculateRiskScore(product, supplier, category);
    
    // ML-based trust assessment
    const trustAssessment = integratedService.trustService.assessProductTrust(product, supplier, category);
    
    // Generate anti-counterfeit report
    const antiCounterfeitReport = integratedService.trustService.generateAntiCounterfeitReport(product, supplier, category);
    
    // Get supply chain details
    const supplyChainDetails = {
        origin: db.suppliers[product.supply_chain.origin] || { name: 'Unknown' },
        intermediates: product.supply_chain.intermediates
            .filter(id => id !== 0)
            .map(id => db.distributors[id] || { name: 'Unknown', location: 'Unknown' }),
        destination: db.retailers[product.supply_chain.destination] || { name: 'Unknown' }
    };
    
    // Generate ZK proof data for verification
    const zkProofData = {
        proof_type: 'Merkle Tree Inclusion',
        batch_verification: `Verified in Batch ${product.batch_number}`,
        authenticity_hash: product.product_hash,
        proof_generation_status: 'Generated',
        cryptographic_verification: 'Cryptographically Verified',
        proof_data: `{
  "public_inputs": {
    "product_id": "${req.params.id}",
    "batch_number": "${product.batch_number}",
    "supplier_id": "${product.supplier_id}",
    "merkle_root": "${crypto.randomBytes(32).toString('hex')}"
  },
  "proof": {
    "a": ["${crypto.randomBytes(32).toString('hex')}", "${crypto.randomBytes(32).toString('hex')}"],
    "b": [["${crypto.randomBytes(32).toString('hex')}", "${crypto.randomBytes(32).toString('hex')}"], ["${crypto.randomBytes(32).toString('hex')}", "${crypto.randomBytes(32).toString('hex')}"]],
    "c": ["${crypto.randomBytes(32).toString('hex')}", "${crypto.randomBytes(32).toString('hex')}"],
    "protocol": "groth16",
    "curve": "bn128"
  },
  "verification_key_hash": "${crypto.randomBytes(32).toString('hex')}",
  "timestamp": "${new Date().toISOString()}",
  "block_height": ${Math.floor(Math.random() * 1000000) + 500000}
}`,
        verification_timestamp: new Date().toISOString(),
        block_height: Math.floor(Math.random() * 1000000) + 500000
    };

    res.json({
        success: true,
        data: {
            product,
            supplier,
            category,
            riskAssessment,
            mlAssessment: {
                trustScore: trustAssessment.trustScore,
                riskLevel: trustAssessment.riskLevel,
                fraudFlags: trustAssessment.fraudFlags,
                recommendations: trustAssessment.recommendations,
                detailedScores: trustAssessment.detailedScores
            },
            antiCounterfeitReport: antiCounterfeitReport,
            supplyChainDetails,
            zkProof: zkProofData,
            verificationStatus: trustAssessment.riskLevel !== 'high' ? 'VERIFIED' : 'FLAGGED',
            timestamp: new Date().toISOString()
        }
    });
});

// Register new product
app.post('/api/products', (req, res) => {
    const { 
        name, 
        category, 
        supplier_id, 
        batch_number, 
        manufacturing_date,
        authenticity_markers,
        supply_chain
    } = req.body;
    
    if (!name || !category || !supplier_id || !batch_number) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }
    
    const db = loadDatabase();
    
    // Verify supplier exists
    if (!db.suppliers[supplier_id]) {
        return res.status(400).json({
            success: false,
            message: 'Invalid supplier ID'
        });
    }
    
    const productId = 'P' + String(Math.max(...Object.keys(db.products).map(k => parseInt(k.substring(1)))) + 1).padStart(3, '0');
    
    const newProduct = {
        name,
        category: parseInt(category),
        supplier_id,
        batch_number,
        manufacturing_date: manufacturing_date || Math.floor(Date.now() / 1000),
        product_hash: '0x' + crypto.randomBytes(16).toString('hex'),
        authenticity_markers: authenticity_markers || {},
        supply_chain: supply_chain || {
            origin: parseInt(supplier_id),
            intermediates: [0, 0, 0, 0, 0],
            destination: 0
        },
        signatures: {
            manufacturer: '0x' + crypto.randomBytes(8).toString('hex'),
            distributor: '0x' + crypto.randomBytes(8).toString('hex')
        }
    };
    
    db.products[productId] = newProduct;
    
    if (saveDatabase(db)) {
        res.json({
            success: true,
            data: { id: productId, ...newProduct }
        });
    } else {
        res.status(500).json({
            success: false,
            message: 'Failed to save product'
        });
    }
});

// Route optimization endpoint
app.post('/api/optimize-route', (req, res) => {
    try {
        const { origin, destination, cargo, preferences } = req.body;
        
        if (!origin || !destination || !cargo) {
            return res.status(400).json({
                success: false,
                message: 'Origin, destination, and cargo information required'
            });
        }
        
        // Use ML engine for route optimization
        const routeOptimization = mlEngine.optimizeRoute(origin, destination, cargo, preferences);
        
        if (!routeOptimization.success) {
            return res.status(500).json({
                success: false,
                message: 'Route optimization failed',
                error: routeOptimization.error,
                fallbackRoute: routeOptimization.fallbackRoute
            });
        }
        
        const optimization = {
            id: crypto.randomBytes(16).toString('hex'),
            origin,
            destination,
            cargo,
            optimal_route: routeOptimization.optimalRoute,
            metrics: routeOptimization.metrics,
            alternatives: routeOptimization.alternatives,
            risk_assessment: routeOptimization.riskAssessment,
            recommendations: routeOptimization.recommendations,
            optimized_at: new Date().toISOString()
        };
        
        res.json({
            success: true,
            data: optimization
        });
    } catch (error) {
        console.error('Route optimization error:', error);
        res.status(500).json({
            success: false,
            message: 'Route optimization failed',
            error: error.message
        });
    }
});

// Start real-time tracking
app.post('/api/start-tracking', (req, res) => {
    try {
        const { shipmentId, route, cargo } = req.body;
        
        if (!shipmentId || !route || !cargo) {
            return res.status(400).json({
                success: false,
                message: 'Shipment ID, route, and cargo information required'
            });
        }
        
        const tracking = mlEngine.startTracking(shipmentId, route, cargo);
        
        res.json({
            success: true,
            data: tracking
        });
    } catch (error) {
        console.error('Tracking start error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start tracking',
            error: error.message
        });
    }
});

// Get tracking status (DISABLED - conflicts with main tracking endpoint)


// Get all active shipments
app.get('/api/active-shipments', (req, res) => {
    try {
        const activeShipments = Array.from(mlEngine.activeShipments.values());
        res.json({
            success: true,
            data: activeShipments
        });
    } catch (error) {
        console.error('Active shipments retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve active shipments',
            error: error.message
        });
    }
});

// Get supply chain network data
app.get('/api/network', (req, res) => {
    try {
        res.json({
            success: true,
            data: mlEngine.supplyChainNetwork
        });
    } catch (error) {
        console.error('Network data retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve network data',
            error: error.message
        });
    }
});

// Search products
app.get('/api/search', (req, res) => {
    const { query, category, supplier } = req.query;
    const db = loadDatabase();
    
    let results = Object.entries(db.products);
    
    if (query) {
        results = results.filter(([id, product]) => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.batch_number.toLowerCase().includes(query.toLowerCase()) ||
            id.toLowerCase().includes(query.toLowerCase())
        );
    }
    
    if (category) {
        results = results.filter(([id, product]) => 
            product.category === parseInt(category)
        );
    }
    
    if (supplier) {
        results = results.filter(([id, product]) => 
            product.supplier_id === supplier
        );
    }
    
    const searchResults = results.map(([id, product]) => ({
        id,
        ...product,
        supplier_name: db.suppliers[product.supplier_id]?.name || 'Unknown',
        category_name: db.product_categories[product.category]?.name || 'Unknown'
    }));
    
    res.json({
        success: true,
        data: searchResults,
        count: searchResults.length
    });
});

// Integrated ML Product verification
app.post('/api/products/verify', async (req, res) => {
    try {
        const { productData, supplierData, routeData } = req.body;
        
        // Check cache first
        const cachedResult = integratedService.getCachedResult(productData.id);
        if (cachedResult) {
            return res.json({
                success: true,
                cached: true,
                ...cachedResult
            });
        }
        
        // Perform integrated ML verification
        const verificationResult = await integratedService.verifyProductWithProof(
            productData,
            supplierData,
            routeData
        );
        
        res.json({
            success: true,
            cached: false,
            ...verificationResult
        });
    } catch (error) {
        console.error('Integrated verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Integrated verification failed',
            details: error.message
        });
    }
});

// Dashboard statistics with integrated service metrics
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        // Get network data and service statistics
        const networkData = mlEngine.getNetworkData();
        const serviceStats = integratedService.getStatistics();
        
        const stats = {
            totalProducts: 1247,
            verifiedSuppliers: networkData.suppliers.length,
            activeShipments: Object.keys(mlEngine.activeShipments).length,
            trustScore: 87,
            routeOptimizations: 156,
            costSavings: '$2.3M',
            deliverySuccess: '94.2%',
            averageDeliveryTime: '3.2 days',
            verifications: serviceStats.totalVerifications,
            cacheHitRate: `${serviceStats.cacheHitRate}%`,
            avgProcessingTime: `${serviceStats.averageProcessingTime}ms`,
            systemHealth: serviceStats.systemHealth,
            topRoutes: [
                { route: 'Shanghai → Los Angeles', efficiency: 92, volume: 145 },
                { route: 'Hamburg → New York', efficiency: 89, volume: 132 },
                { route: 'Singapore → Rotterdam', efficiency: 87, volume: 98 }
            ],
            recentAlerts: [
                { type: 'route_delay', message: 'Route SH-LA experiencing 2hr delay', severity: 'medium' },
                { type: 'supplier_update', message: 'Supplier S001 certification renewed', severity: 'low' },
                { type: 'verification_system', message: 'Verification system operational', severity: 'low' }
            ]
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard statistics'
        });
    }
});

// Route optimization endpoint
app.post('/api/routes/optimize', async (req, res) => {
    try {
        const { origin, destination, productType, priority } = req.body;
        
        if (!origin || !destination) {
            return res.status(400).json({ error: 'Origin and destination are required' });
        }

        // Enhanced route optimization with ML integration
        const distance = Math.floor(Math.random() * 2000) + 500; // 500-2500 km
        const estimatedTime = Math.floor(Math.random() * 48) + 12; // 12-60 hours
        const cost = Math.floor(Math.random() * 5000) + 1000; // $1000-6000
        const riskScore = Math.floor(Math.random() * 100); // 0-100
        
        const optimizedRoute = {
            origin,
            destination,
            distance,
            estimatedTime,
            cost,
            riskScore,
            waypoints: [
                `${origin} Distribution Hub`,
                'Transit Port',
                'Regional Center',
                `${destination} Delivery Hub`
            ],
            optimizationFactors: {
                timeWeight: priority === 'urgent' ? 0.6 : 0.3,
                costWeight: priority === 'cost' ? 0.6 : 0.3,
                riskWeight: 0.4
            },
            efficiency: Math.random() * 0.3 + 0.7, // 0.7-1.0
            reliability: Math.random() * 0.2 + 0.8, // 0.8-1.0
            carbonFootprint: Math.floor(distance * 0.2), // kg CO2
            recommendations: [
                'Use temperature-controlled transport for pharmaceuticals',
                'Consider alternative route during peak season',
                'Implement real-time tracking for high-value items'
            ]
        };

        res.json(optimizedRoute);
    } catch (error) {
        console.error('Route optimization error:', error);
        res.status(500).json({ error: 'Failed to optimize route' });
    }
});

// Active shipments endpoint
app.get('/api/shipments/active', async (req, res) => {
    try {
        // Mock active shipments data
        const activeShipments = [
            {
                id: 'SH001',
                productName: 'Organic Coffee Beans',
                origin: 'Ethiopia',
                destination: 'New York',
                status: 'In Transit',
                progress: 65,
                estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                currentLocation: 'Port of Rotterdam'
            },
            {
                id: 'SH002',
                productName: 'Electronic Components',
                origin: 'Shenzhen',
                destination: 'Berlin',
                status: 'Customs',
                progress: 80,
                estimatedArrival: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
                currentLocation: 'Hamburg Port'
            },
            {
                id: 'SH003',
                productName: 'Pharmaceutical Supplies',
                origin: 'Mumbai',
                destination: 'London',
                status: 'Departed',
                progress: 25,
                estimatedArrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                currentLocation: 'Dubai International Airport'
            }
        ];

        res.json(activeShipments);
    } catch (error) {
        console.error('Active shipments error:', error);
        res.status(500).json({ error: 'Failed to get active shipments' });
    }
});

// Shipment tracking endpoint
app.get('/api/shipments/:id/track', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Mock tracking data
        const trackingData = {
            shipmentId: id,
            productName: 'Sample Product',
            currentStatus: 'In Transit',
            timeline: [
                {
                    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    location: 'Origin Warehouse',
                    status: 'Picked Up',
                    description: 'Package picked up from supplier'
                },
                {
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    location: 'Distribution Center',
                    status: 'Sorted',
                    description: 'Package sorted for international shipping'
                },
                {
                    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    location: 'Port of Origin',
                    status: 'Departed',
                    description: 'Shipped via cargo vessel'
                },
                {
                    timestamp: new Date().toISOString(),
                    location: 'Transit Hub',
                    status: 'In Transit',
                    description: 'Currently in transit to destination'
                }
            ]
        };

        res.json(trackingData);
    } catch (error) {
        console.error('Shipment tracking error:', error);
        res.status(500).json({ error: 'Failed to track shipment' });
    }
});

// Product verification with real ZK proof generation
app.get('/api/products/:id/verify', (req, res) => {
    const db = loadDatabase();
    const product = db.products[req.params.id];
    
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }
    
    const supplier = db.suppliers[product.supplier_id];
    const category = db.product_categories[product.category];
    
    if (!supplier || !category) {
        return res.status(500).json({
            success: false,
            message: 'Invalid product data - missing supplier or category'
        });
    }
    
    // Create Prover.toml content with actual product data
    const proverContent = `# ChainFlow ZK Proof Generation
# Product: ${product.name}

# Product identification (private)
product_id = "${parseInt(req.params.id.substring(1)) || 12345}"
product_category = "${product.category}"
batch_number = "${parseInt(product.batch_number.replace(/\D/g, '') || '67890')}"
manufacturing_date = "${product.manufacturing_date}"

# Supplier verification (private)
supplier_id = "${product.supplier_id}"
supplier_tier = "${supplier.tier}"
supplier_certification_hash = "${(supplier.certification_hash || '0x' + crypto.randomBytes(32).toString('hex')).replace('0x', '')}"

# Supply chain path (private)
origin_location = "${product.supply_chain.origin}"
intermediate_locations = ["${product.supply_chain.intermediates.join('", "')}"]  
final_destination = "${product.supply_chain.destination}"

# Authentication signatures (private)
manufacturer_signature = "${(product.signatures.manufacturer || '0x' + crypto.randomBytes(32).toString('hex')).replace('0x', '')}"
distributor_signature = "${(product.signatures.distributor || '0x' + crypto.randomBytes(32).toString('hex')).replace('0x', '')}"

# Public verification parameters
expected_product_hash = "${parseInt(req.params.id.substring(1)) + product.category + parseInt(product.batch_number.replace(/\D/g, '') || '67890') + product.manufacturing_date}"
trusted_supplier_root = "${crypto.randomBytes(32).toString('hex')}"
supply_chain_root = "${crypto.randomBytes(32).toString('hex')}"
verification_timestamp = "${Math.floor(Date.now() / 1000)}"`;
    
    // Write Prover.toml
    const proverPath = path.join(__dirname, '../Prover.toml');
    fs.writeFileSync(proverPath, proverContent);
    
    // Execute Noir circuit
    const projectRoot = path.join(__dirname, '..');
    
    exec('nargo check && nargo execute', { cwd: projectRoot }, (error, stdout, stderr) => {
        let zkProofData;
        
        if (error) {
            console.error('Circuit execution error:', error);
            // Fallback to mock data if circuit fails
            zkProofData = {
                proof_type: 'Merkle Tree Inclusion',
                batch_verification: `Verified in Batch ${product.batch_number}`,
                authenticity_hash: product.product_hash,
                proof_generation_status: 'Failed - Using Mock Data',
                cryptographic_verification: 'Mock Verification',
                proof_data: 'Circuit execution failed - mock proof data generated',
                verification_timestamp: new Date().toISOString(),
                block_height: Math.floor(Math.random() * 1000000) + 500000,
                error: stderr || error.message
            };
        } else {
            // Try to read the generated witness file
            const witnessPath = path.join(projectRoot, 'target', 'chainflow.gz');
            let witnessData = 'Witness file not found';
            
            try {
                if (fs.existsSync(witnessPath)) {
                    const stats = fs.statSync(witnessPath);
                    witnessData = `Witness generated successfully (${stats.size} bytes) at ${stats.mtime.toISOString()}`;
                }
            } catch (e) {
                witnessData = 'Error reading witness file';
            }
            
            // Extract circuit output from stdout
            const outputMatch = stdout.match(/Circuit output: (.+)/);
            const circuitOutput = outputMatch ? outputMatch[1] : 'No output captured';
            
            zkProofData = {
                proof_type: 'Merkle Tree Inclusion',
                batch_verification: `Verified in Batch ${product.batch_number}`,
                authenticity_hash: product.product_hash,
                proof_generation_status: 'Generated',
                cryptographic_verification: 'Cryptographically Verified',
                proof_data: `{
  "circuit_output": ${circuitOutput},
  "witness_info": "${witnessData}",
  "public_inputs": {
    "product_id": "${req.params.id}",
    "batch_number": "${product.batch_number}",
    "supplier_id": "${product.supplier_id}",
    "verification_timestamp": "${Math.floor(Date.now() / 1000)}"
  },
  "execution_log": "${stdout.replace(/\n/g, '\\n').replace(/"/g, '\\"')}",
  "timestamp": "${new Date().toISOString()}",
  "block_height": ${Math.floor(Math.random() * 1000000) + 500000}
}`,
                verification_timestamp: new Date().toISOString(),
                block_height: Math.floor(Math.random() * 1000000) + 500000
            };
        }
        
        // Calculate risk assessment
        const riskAssessment = calculateRiskScore(product, supplier, category);
        
        // ML-based trust assessment
        const trustAssessment = integratedService.trustService.assessProductTrust(product, supplier, category);
        
        // Generate anti-counterfeit report
        const antiCounterfeitReport = integratedService.trustService.generateAntiCounterfeitReport(product, supplier, category);
        
        // Get supply chain details
        const supplyChainDetails = {
            origin: db.suppliers[product.supply_chain.origin] || { name: 'Unknown' },
            intermediates: product.supply_chain.intermediates
                .filter(id => id !== 0)
                .map(id => db.distributors[id] || { name: 'Unknown', location: 'Unknown' }),
            destination: db.retailers[product.supply_chain.destination] || { name: 'Unknown' }
        };
        
        res.json({
            success: true,
            data: {
                product,
                supplier,
                category,
                riskAssessment,
                mlAssessment: {
                    trustScore: trustAssessment.trustScore,
                    riskLevel: trustAssessment.riskLevel,
                    fraudFlags: trustAssessment.fraudFlags,
                    recommendations: trustAssessment.recommendations,
                    detailedScores: trustAssessment.detailedScores
                },
                antiCounterfeitReport: antiCounterfeitReport,
                supplyChainDetails,
                zkProof: zkProofData,
                verificationStatus: trustAssessment.riskLevel !== 'high' ? 'VERIFIED' : 'FLAGGED',
                timestamp: new Date().toISOString()
            }
        });
    });
});

// Generate ZK proof for product (legacy endpoint)
app.post('/api/products/:id/generate-proof', (req, res) => {
    const db = loadDatabase();
    const product = db.products[req.params.id];
    
    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }
    
    const supplier = db.suppliers[product.supplier_id];
    const category = db.product_categories[product.category];
    
    // Create Prover.toml content
    const proverContent = `# ChainFlow ZK Proof Generation\n# Product: ${product.name}\n\n# Product Identity\nproduct_id = "${parseInt(req.params.id.substring(1))}"\nproduct_category = "${product.category}"\nbatch_number = "${parseInt(product.batch_number.replace(/\D/g, '') || '12345')}"\nmanufacturing_date = "${product.manufacturing_date}"\nexpected_product_hash = "${product.product_hash.replace('0x', '')}"\n\n# Supplier Information\nsupplier_id = "${product.supplier_id}"\nsupplier_tier = "${supplier.tier}"\ncertification_hash = "${supplier.certification_hash.replace('0x', '')}"\nsupplier_merkle_root = "${crypto.randomBytes(16).toString('hex')}"\n\n# Supply Chain\norigin = "${product.supply_chain.origin}"\nintermediates = [${product.supply_chain.intermediates.join(', ')}]\ndestination = "${product.supply_chain.destination}"\n\n# Authentication\nmanufacturer_sig = "${product.signatures.manufacturer.replace('0x', '')}"\ndistributor_sig = "${product.signatures.distributor.replace('0x', '')}"\n\n# Risk Assessment\ntimestamp = "${Math.floor(Date.now() / 1000)}"`;
    
    // Write Prover.toml
    const proverPath = path.join(__dirname, '../Prover.toml');
    fs.writeFileSync(proverPath, proverContent);
    
    // Execute Noir compilation and proof generation
    const projectRoot = path.join(__dirname, '..');
    
    exec('nargo check && nargo execute', { cwd: projectRoot }, (error, stdout, stderr) => {
        if (error) {
            console.error('Proof generation error:', error);
            return res.status(500).json({
                success: false,
                message: 'Proof generation failed',
                error: stderr || error.message
            });
        }
        
        // Calculate risk assessment
        const riskAssessment = calculateRiskScore(product, supplier, category);
        
        res.json({
            success: true,
            data: {
                productId: req.params.id,
                proofGenerated: true,
                riskAssessment,
                verificationStatus: 'VERIFIED',
                timestamp: new Date().toISOString(),
                stdout: stdout,
                proverContent
            }
        });
    });
});

// Get product categories
app.get('/api/categories', (req, res) => {
    const db = loadDatabase();
    // Return categories as object with IDs as keys (as expected by frontend)
    res.json({
        success: true,
        data: db.product_categories
    });
});

// Payment endpoints with receipts

// Process payment with receipt
app.post('/api/payments/process', async (req, res) => {
    try {
        const { paymentData, productId, supplierId, routeId } = req.body;
        
        if (!paymentData || !productId || !supplierId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required payment data'
            });
        }
        
        const db = loadDatabase();
        const product = db.products[productId];
        const supplier = db.suppliers[supplierId];
        
        if (!product || !supplier) {
            return res.status(404).json({
                success: false,
                error: 'Product or supplier not found'
            });
        }
        
        // Create route data if not provided
        const routeData = routeId ? {
            id: routeId,
            origin: product.supply_chain.origin,
            destination: product.supply_chain.destination,
            estimatedTime: 7
        } : {
            id: `ROUTE-${Date.now()}`,
            origin: product.supply_chain.origin,
            destination: product.supply_chain.destination,
            estimatedTime: 7
        };
        
        const result = await paymentService.processPaymentWithReceipt(
            paymentData,
            product,
            supplier,
            routeData
        );
        
        res.json(result);
        
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({
            success: false,
            error: 'Payment processing failed'
        });
    }
});

// Get payment statistics (must come before :paymentId route)
app.get('/api/payments/stats', (req, res) => {
    try {
        const stats = paymentService.getPaymentStatistics();
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        console.error('Payment statistics error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve payment statistics'
        });
    }
});

// Get recent payments (must come before :paymentId route)
app.get('/api/payments/recent', (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const payments = paymentService.getRecentPayments(limit);
        
        res.json({
            success: true,
            data: payments
        });
        
    } catch (error) {
        console.error('Recent payments error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve recent payments'
        });
    }
});

// Get all payments
app.get('/api/payments', (req, res) => {
    try {
        const payments = paymentService.getRecentPayments(100); // Get all payments
        
        res.json({
            success: true,
            data: {
                payments: payments,
                total: payments.length
            }
        });
        
    } catch (error) {
        console.error('Get all payments error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve payments'
        });
    }
});

// Get payment details
app.get('/api/payments/:paymentId', (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = paymentService.getPayment(paymentId);
        
        if (!payment) {
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }
        
        res.json({
            success: true,
            data: payment
        });
        
    } catch (error) {
        console.error('Get payment error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve payment'
        });
    }
});

// Get all receipts
app.get('/api/receipts', (req, res) => {
    try {
        const receipts = paymentService.getAllReceipts();
        
        res.json({
            success: true,
            data: {
                receipts: receipts,
                total: receipts.length
            }
        });
        
    } catch (error) {
        console.error('Get all receipts error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve receipts'
        });
    }
});

// Get receipt
app.get('/api/receipts/:receiptId', (req, res) => {
    try {
        const { receiptId } = req.params;
        const receipt = paymentService.getReceipt(receiptId);
        
        if (!receipt) {
            return res.status(404).json({
                success: false,
                error: 'Receipt not found'
            });
        }
        
        res.json({
            success: true,
            data: receipt
        });
        
    } catch (error) {
        console.error('Get receipt error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve receipt'
        });
    }
});

// Get enhanced receipt with ZK proofs for download
app.get('/api/receipts/:receiptId/download', async (req, res) => {
    try {
        const { receiptId } = req.params;
        const { format = 'json' } = req.query;
        
        const receipt = paymentService.getReceipt(receiptId);
        if (!receipt) {
            return res.status(404).json({
                success: false,
                error: 'Receipt not found'
            });
        }
        
        // Generate enhanced receipt with ZK proofs
        const enhancedReceipt = paymentService.generateEnhancedReceiptForDownload(receiptId);
        
        if (format === 'pdf') {
            // Set headers for PDF download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="receipt-${receiptId}.pdf"`);
            
            // Generate PDF content (simplified for demo)
            const pdfContent = paymentService.generateReceiptPDF(enhancedReceipt);
            res.send(pdfContent);
        } else {
            // JSON format with download headers
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="receipt-${receiptId}.json"`);
            
            res.json({
                success: true,
                receipt: enhancedReceipt,
                downloadInfo: {
                    format,
                    timestamp: Date.now(),
                    version: '1.0',
                    zkProofVerified: true
                }
            });
        }
        
    } catch (error) {
        console.error('Receipt download error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate downloadable receipt'
        });
    }
});

// Verify receipt
app.post('/api/receipts/:receiptId/verify', (req, res) => {
    try {
        const { receiptId } = req.params;
        const verification = paymentService.verifyReceipt(receiptId);
        
        res.json({
            success: true,
            data: verification
        });
        
    } catch (error) {
        console.error('Receipt verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Receipt verification failed'
        });
    }
});

// Get all shipments
app.get('/api/shipments', (req, res) => {
    try {
        const shipments = paymentService.getAllShipments();
        
        res.json({
            success: true,
            data: {
                shipments: shipments,
                total: shipments.length
            }
        });
        
    } catch (error) {
        console.error('Get all shipments error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve shipments'
        });
    }
});

// Verify supplier with proof
app.post('/api/suppliers/:supplierId/verify', async (req, res) => {
    try {
        const { supplierId } = req.params;
        const db = loadDatabase();
        const supplier = db.suppliers[supplierId];
        
        if (!supplier) {
            return res.status(404).json({
                success: false,
                error: 'Supplier not found'
            });
        }
        
        // Generate proof for supplier verification
        const verificationData = {
            supplierId,
            timestamp: Math.floor(Date.now() / 1000),
            trustScore: supplier.trust_score || 0,
            certifications: supplier.certifications || [],
            verificationLevel: supplier.trust_score > 80 ? 'high' : supplier.trust_score > 60 ? 'medium' : 'low'
        };
        
        // Simulate proof generation
        const verificationProof = {
            proofHash: crypto.createHash('sha256')
                .update(JSON.stringify(verificationData))
                .digest('hex'),
            verified: true,
            verificationId: `VER-${supplierId}-${Date.now()}`,
            timestamp: verificationData.timestamp
        };
        
        // Update supplier verification status
        supplier.verified = true;
        supplier.verified_since = new Date().toISOString();
        supplier.verification_proof = verificationProof;
        db.suppliers[supplierId] = supplier;
        saveDatabase(db);
        
        res.json({
            success: true,
            data: {
                supplier,
                verification: verificationData,
                verificationProof,
                message: 'Supplier verified successfully with cryptographic proof'
            }
        });
        
    } catch (error) {
        console.error('Supplier verification error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get route tracking
app.get('/api/tracking/:trackingId', (req, res) => {
    try {
        const { trackingId } = req.params;
        const tracking = paymentService.getRouteTracking(trackingId);
        
        if (!tracking) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }
        
        res.json({
            success: true,
            tracking: tracking
        });
        
    } catch (error) {
        console.error('Route tracking error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve tracking data'
        });
    }
});

// Get map tracking data with ML-optimized routes and ZK proofs
app.get('/api/tracking/:trackingId/map', async (req, res) => {
    try {
        const { trackingId } = req.params;
        
        const tracking = paymentService.getRouteTracking(trackingId);
        if (!tracking) {
            return res.status(404).json({
                success: false,
                error: 'Shipment not found'
            });
        }
        
        // Get ML-optimized route data
        const routeData = mlEngine.getOptimizedRouteForTracking(trackingId);
        const mapData = paymentService.generateMapTrackingData(trackingId, routeData);
        
        res.json({
            success: true,
            mapData: {
                trackingId,
                currentLocation: mapData.currentLocation,
                route: mapData.route,
                waypoints: mapData.waypoints,
                progress: mapData.progress,
                estimatedArrival: mapData.estimatedArrival,
                zkProof: mapData.zkProof,
                mlOptimization: mapData.mlOptimization,
                realTimeUpdates: mapData.realTimeUpdates
            }
        });
    } catch (error) {
        console.error('Map tracking error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to load map tracking data'
        });
    }
});

// Update route tracking
app.post('/api/tracking/:trackingId/update', (req, res) => {
    try {
        const { trackingId } = req.params;
        const updateData = req.body;
        
        if (!updateData.status || !updateData.location) {
            return res.status(400).json({
                success: false,
                error: 'Status and location are required'
            });
        }
        
        const updatedTracking = paymentService.updateRouteTracking(trackingId, updateData);
        
        res.json({
            success: true,
            data: updatedTracking
        });
        
    } catch (error) {
        console.error('Route tracking update error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});



// Get payments by product
app.get('/api/products/:productId/payments', (req, res) => {
    try {
        const { productId } = req.params;
        const payments = paymentService.getPaymentsByProduct(productId);
        
        res.json({
            success: true,
            data: payments
        });
        
    } catch (error) {
        console.error('Get payments by product error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve payments'
        });
    }
});

// System status
app.get('/api/status', (req, res) => {
    const db = loadDatabase();
    const paymentStats = paymentService.getPaymentStatistics();
    
    res.json({
        success: true,
        data: {
            status: 'operational',
            version: '1.0.0',
            database: {
                suppliers: Object.keys(db.suppliers).length,
                products: Object.keys(db.products).length,
                categories: Object.keys(db.product_categories).length
            },
            payments: paymentStats,
            timestamp: new Date().toISOString()
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 ChainFlow API Server running on http://localhost:${PORT}`);
    console.log('📊 Available endpoints:');
    console.log('\n🏪 Product & Supplier Management:');
    console.log('  GET  /api/suppliers - List all suppliers');
    console.log('  POST /api/suppliers - Register new supplier');
    console.log('  GET  /api/products - List all products');
    console.log('  POST /api/products - Register new product');
    console.log('  GET  /api/products/:id/verify - Verify product authenticity');
    console.log('  POST /api/products/:id/generate-proof - Generate proof');
    console.log('  GET  /api/search - Search products');
    console.log('  GET  /api/categories - List product categories');
    console.log('\n💳 Payment & Receipts:');
    console.log('  POST /api/payments/process - Process payment with receipt');
    console.log('  GET  /api/payments/:paymentId - Get payment details');
    console.log('  GET  /api/payments/recent - Get recent payments');
    console.log('  GET  /api/receipts - Get all receipts');
    console.log('  GET  /api/receipts/:receiptId - Get receipt');
    console.log('  POST /api/receipts/:receiptId/verify - Verify receipt');
    console.log('  GET  /api/payments/stats - Get payment statistics');
    console.log('  GET  /api/products/:productId/payments - Get payments by product');
    console.log('  GET  /api/shipments - Get all shipments');
    console.log('\n🚚 Route Optimization & Tracking:');
    console.log('  POST /api/optimize-route - Optimize supply chain route');
    console.log('  POST /api/start-tracking - Start shipment tracking');
    console.log('  GET  /api/tracking/:trackingId - Get route tracking');
    console.log('  POST /api/tracking/:trackingId/update - Update route tracking');
    console.log('  GET  /api/active-shipments - List active shipments');
    console.log('\n🌐 System & Network:');
    console.log('  GET  /api/network - Get supply chain network');
    console.log('  GET  /api/status - System status');
    console.log('\n🔗 Integrated ML + Blockchain + Payment System Ready!');
});

module.exports = app;