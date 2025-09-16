const crypto = require('crypto');

/**
 * Synthetic Data Generator for ChainFlow
 * Generates realistic supply chain data for route optimization and trust scoring
 */
// Hackathon submission update
class SyntheticDataGenerator {
    constructor() {
        this.locations = this.generateLocations();
        this.suppliers = this.generateSuppliers();
        this.products = this.generateProducts();
        this.routes = this.generateRoutes();
        this.historicalData = this.generateHistoricalData();
    }

    // Generate global supply chain locations
    generateLocations() {
        return [
            { id: 'NYC', name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060, type: 'port' },
            { id: 'LAX', name: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437, type: 'port' },
            { id: 'SHG', name: 'Shanghai', country: 'China', lat: 31.2304, lng: 121.4737, type: 'manufacturing' },
            { id: 'HKG', name: 'Hong Kong', country: 'China', lat: 22.3193, lng: 114.1694, type: 'hub' },
            { id: 'SIN', name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, type: 'hub' },
            { id: 'DXB', name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708, type: 'hub' },
            { id: 'FRA', name: 'Frankfurt', country: 'Germany', lat: 50.1109, lng: 8.6821, type: 'hub' },
            { id: 'LHR', name: 'London', country: 'UK', lat: 51.4700, lng: -0.4543, type: 'hub' },
            { id: 'MUM', name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777, type: 'manufacturing' },
            { id: 'SAO', name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, type: 'manufacturing' },
            { id: 'MEX', name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, type: 'manufacturing' },
            { id: 'BKK', name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018, type: 'manufacturing' },
            { id: 'IST', name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784, type: 'hub' },
            { id: 'JNB', name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lng: 28.0473, type: 'hub' },
            { id: 'SYD', name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, type: 'port' }
        ];
    }

    // Generate supplier data with trust metrics
    generateSuppliers() {
        const suppliers = [];
        const supplierTypes = ['manufacturer', 'distributor', 'wholesaler', 'retailer'];
        const countries = ['China', 'USA', 'Germany', 'India', 'Brazil', 'Mexico', 'Thailand', 'UK'];
        
        for (let i = 0; i < 50; i++) {
            const country = countries[Math.floor(Math.random() * countries.length)];
            const type = supplierTypes[Math.floor(Math.random() * supplierTypes.length)];
            const yearsInBusiness = Math.floor(Math.random() * 25) + 1;
            const certifications = this.generateCertifications();
            
            // Trust score based on various factors
            let trustScore = 50;
            trustScore += yearsInBusiness * 1.5; // Experience bonus
            trustScore += certifications.length * 5; // Certification bonus
            trustScore += Math.random() * 20 - 10; // Random variance
            trustScore = Math.max(10, Math.min(100, trustScore));
            
            suppliers.push({
                id: `SUP_${i.toString().padStart(3, '0')}`,
                name: `${this.generateCompanyName()} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
                type,
                country,
                location: this.getLocationByCountry(country),
                trust_score: Math.round(trustScore),
                years_in_business: yearsInBusiness,
                certifications,
                tier: this.calculateSupplierTier(trustScore, yearsInBusiness, certifications.length),
                verified: Math.random() > 0.2, // 80% verified
                compliance_score: Math.round(Math.random() * 30 + 70), // 70-100
                financial_stability: Math.round(Math.random() * 40 + 60), // 60-100
                delivery_performance: Math.round(Math.random() * 30 + 70), // 70-100
                quality_rating: Math.round(Math.random() * 25 + 75), // 75-100
                risk_factors: this.generateRiskFactors(),
                created_at: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
            });
        }
        
        return suppliers;
    }

    // Generate product data
    generateProducts() {
        const products = [];
        const categories = [
            { name: 'electronics', risk_factor: 0.6, avg_value: 500 },
            { name: 'pharmaceuticals', risk_factor: 0.8, avg_value: 200 },
            { name: 'luxury', risk_factor: 0.7, avg_value: 1500 },
            { name: 'automotive', risk_factor: 0.4, avg_value: 800 },
            { name: 'food', risk_factor: 0.5, avg_value: 50 },
            { name: 'textiles', risk_factor: 0.3, avg_value: 100 },
            { name: 'machinery', risk_factor: 0.4, avg_value: 2000 }
        ];
        
        for (let i = 0; i < 200; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const supplier = this.suppliers[Math.floor(Math.random() * this.suppliers.length)];
            
            products.push({
                id: `PROD_${i.toString().padStart(4, '0')}`,
                name: this.generateProductName(category.name),
                category: category.name,
                supplier_id: supplier.id,
                value: Math.round(category.avg_value * (0.5 + Math.random())),
                weight: Math.round(Math.random() * 50 + 1), // 1-50 kg
                dimensions: {
                    length: Math.round(Math.random() * 100 + 10), // cm
                    width: Math.round(Math.random() * 100 + 10),
                    height: Math.round(Math.random() * 100 + 10)
                },
                manufacturing_date: Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000,
                expiry_date: category.name === 'food' || category.name === 'pharmaceuticals' ? 
                    Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000 : null,
                batch_number: `BATCH_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                quality_score: Math.round(Math.random() * 30 + 70), // 70-100
                authenticity_markers: this.generateAuthenticityMarkers(),
                supply_chain: this.generateSupplyChainPath(supplier),
                created_at: Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000
            });
        }
        
        return products;
    }

    // Generate route data with optimization metrics
    generateRoutes() {
        const routes = [];
        const transportModes = ['sea', 'air', 'land', 'rail'];
        
        // Generate routes between all location pairs
        for (let i = 0; i < this.locations.length; i++) {
            for (let j = 0; j < this.locations.length; j++) {
                if (i !== j) {
                    const origin = this.locations[i];
                    const destination = this.locations[j];
                    const distance = this.calculateDistance(origin, destination);
                    
                    // Generate multiple transport options
                    transportModes.forEach(mode => {
                        if (this.isValidTransportMode(origin, destination, mode)) {
                            const route = this.generateRouteDetails(origin, destination, mode, distance);
                            routes.push(route);
                        }
                    });
                }
            }
        }
        
        return routes;
    }

    // Generate historical performance data
    generateHistoricalData() {
        const historical = {
            deliveries: [],
            incidents: [],
            performance_metrics: []
        };
        
        // Generate delivery history with enhanced data
        for (let i = 0; i < 1500; i++) {
            const supplier = this.suppliers[Math.floor(Math.random() * this.suppliers.length)];
            const product = this.products[Math.floor(Math.random() * this.products.length)];
            const route = this.routes[Math.floor(Math.random() * this.routes.length)];
            
            const scheduledTime = route.estimated_time;
            const actualTime = scheduledTime * (0.8 + Math.random() * 0.4); // ±20% variance
            const onTime = Math.abs(actualTime - scheduledTime) / scheduledTime < 0.1;
            
            // Enhanced delivery status options
            const statusOptions = ['delivered', 'in_transit', 'delayed', 'customs_hold', 'processing'];
            const status = i < 1200 ? 'delivered' : statusOptions[Math.floor(Math.random() * statusOptions.length)];
            
            // Payment method correlation
            const paymentMethods = ['credit_card', 'bank_transfer', 'crypto', 'paypal'];
            const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
            
            historical.deliveries.push({
                id: `DEL_${i.toString().padStart(4, '0')}`,
                supplier_id: supplier.id,
                product_id: product.id,
                route_id: route.id,
                payment_id: `PAY-${(i % 12 + 1).toString().padStart(3, '0')}`,
                scheduled_time: scheduledTime,
                actual_time: actualTime,
                on_time: onTime,
                status: status,
                payment_method: paymentMethod,
                quality_on_arrival: Math.round(Math.random() * 20 + 80), // 80-100
                cost: route.cost * (0.9 + Math.random() * 0.2), // ±10% cost variance
                trust_score: Math.round(Math.random() * 30 + 70), // 70-100
                risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                tracking_updates: Math.floor(Math.random() * 10 + 5), // 5-15 updates
                customs_clearance_time: Math.random() * 48, // 0-48 hours
                temperature_maintained: Math.random() > 0.1, // 90% success rate
                documentation_complete: Math.random() > 0.05, // 95% complete
                timestamp: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
            });
        }
        
        // Generate incident data with enhanced details
        for (let i = 0; i < 150; i++) {
            const incidentTypes = ['delay', 'damage', 'theft', 'customs', 'weather', 'mechanical', 'documentation', 'quality_issue', 'route_deviation', 'security_breach'];
            const severity = ['low', 'medium', 'high', 'critical'];
            const categories = ['Electronics', 'Pharmaceuticals', 'Food & Beverage', 'Luxury Goods', 'Automotive', 'Medical Equipment', 'Agriculture', 'Cosmetics', 'Industrial Equipment'];
            
            const incidentType = incidentTypes[Math.floor(Math.random() * incidentTypes.length)];
            const severityLevel = severity[Math.floor(Math.random() * severity.length)];
            const affectedCategory = categories[Math.floor(Math.random() * categories.length)];
            
            // Severity-based impact calculation
            const severityMultiplier = { low: 1, medium: 2.5, high: 5, critical: 10 };
            const baseImpact = severityMultiplier[severityLevel];
            
            historical.incidents.push({
                id: `INC_${i.toString().padStart(3, '0')}`,
                type: incidentType,
                severity: severityLevel,
                category: affectedCategory,
                route_id: this.routes[Math.floor(Math.random() * this.routes.length)].id,
                delivery_id: `DEL_${Math.floor(Math.random() * 1500).toString().padStart(4, '0')}`,
                impact_hours: Math.round(Math.random() * 48 * baseImpact),
                cost_impact: Math.round(Math.random() * 10000 * baseImpact),
                resolved: Math.random() > (severityLevel === 'critical' ? 0.3 : 0.1),
                resolution_time: Math.round(Math.random() * 72 * baseImpact), // hours
                affected_shipments: Math.floor(Math.random() * 5 * baseImpact) + 1,
                preventable: Math.random() > 0.4, // 60% preventable
                insurance_claim: Math.random() > 0.7, // 30% result in claims
                customer_impact: ['none', 'low', 'medium', 'high'][Math.floor(Math.random() * 4)],
                mitigation_actions: this.generateMitigationActions(incidentType),
                timestamp: Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
            });
        }
        
        return historical;
    }

    // Helper methods
    generateCompanyName() {
        const prefixes = ['Global', 'International', 'Premier', 'Elite', 'Advanced', 'Superior', 'Prime'];
        const suffixes = ['Corp', 'Industries', 'Solutions', 'Systems', 'Enterprises', 'Group', 'Ltd'];
        const middle = ['Supply', 'Trade', 'Manufacturing', 'Logistics', 'Distribution', 'Commerce'];
        
        return `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${middle[Math.floor(Math.random() * middle.length)]} ${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
    }

    generateProductName(category) {
        const names = {
            electronics: ['Smartphone', 'Laptop', 'Tablet', 'Smartwatch', 'Headphones', 'Camera'],
            pharmaceuticals: ['Antibiotic', 'Painkiller', 'Vitamin', 'Supplement', 'Vaccine', 'Insulin'],
            luxury: ['Watch', 'Handbag', 'Jewelry', 'Perfume', 'Sunglasses', 'Wallet'],
            automotive: ['Engine Part', 'Brake Pad', 'Tire', 'Battery', 'Filter', 'Sensor'],
            food: ['Organic Coffee', 'Premium Tea', 'Spices', 'Chocolate', 'Wine', 'Cheese'],
            textiles: ['Cotton Fabric', 'Silk Scarf', 'Wool Sweater', 'Denim Jeans', 'Leather Jacket'],
            machinery: ['Industrial Motor', 'Pump', 'Valve', 'Bearing', 'Gear', 'Compressor']
        };
        
        const categoryNames = names[category] || ['Generic Product'];
        const models = ['Pro', 'Elite', 'Premium', 'Standard', 'Basic', 'Advanced'];
        
        return `${categoryNames[Math.floor(Math.random() * categoryNames.length)]} ${models[Math.floor(Math.random() * models.length)]}`;
    }

    generateCertifications() {
        const allCerts = ['ISO9001', 'ISO14001', 'OHSAS18001', 'FDA', 'CE', 'FCC', 'HACCP', 'GMP', 'FSSC22000'];
        const numCerts = Math.floor(Math.random() * 5);
        const certs = [];
        
        for (let i = 0; i < numCerts; i++) {
            const cert = allCerts[Math.floor(Math.random() * allCerts.length)];
            if (!certs.includes(cert)) {
                certs.push(cert);
            }
        }
        
        return certs;
    }

    calculateSupplierTier(trustScore, yearsInBusiness, certCount) {
        let score = trustScore + yearsInBusiness * 2 + certCount * 5;
        if (score >= 120) return 1; // Premium
        if (score >= 80) return 2;  // Standard
        return 3; // Basic
    }

    generateRiskFactors() {
        const factors = ['political_instability', 'natural_disasters', 'economic_volatility', 'regulatory_changes', 'cyber_threats'];
        const numFactors = Math.floor(Math.random() * 3);
        const risks = [];
        
        for (let i = 0; i < numFactors; i++) {
            const factor = factors[Math.floor(Math.random() * factors.length)];
            if (!risks.includes(factor)) {
                risks.push(factor);
            }
        }
        
        return risks;
    }

    getLocationByCountry(country) {
        const countryMap = {
            'China': ['SHG', 'HKG'],
            'USA': ['NYC', 'LAX'],
            'Germany': ['FRA'],
            'UK': ['LHR'],
            'India': ['MUM'],
            'Brazil': ['SAO'],
            'Mexico': ['MEX'],
            'Thailand': ['BKK']
        };
        
        const locations = countryMap[country] || ['SIN'];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    generateAuthenticityMarkers() {
        return {
            serial_number: Math.random().toString(36).substr(2, 12).toUpperCase(),
            qr_code: `QR_${Math.random().toString(36).substr(2, 16).toUpperCase()}`,
            hologram_id: `HOL_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            rfid_tag: Math.random() > 0.5 ? `RFID_${Math.random().toString(36).substr(2, 10).toUpperCase()}` : null
        };
    }

    generateSupplyChainPath(supplier) {
        const pathLength = Math.floor(Math.random() * 4) + 2; // 2-5 steps
        const path = [supplier.location];
        
        for (let i = 1; i < pathLength; i++) {
            let nextLocation;
            do {
                nextLocation = this.locations[Math.floor(Math.random() * this.locations.length)].id;
            } while (path.includes(nextLocation));
            path.push(nextLocation);
        }
        
        return {
            path,
            intermediates: path.slice(1, -1),
            total_distance: this.calculatePathDistance(path),
            estimated_time: this.calculatePathTime(path)
        };
    }

    calculateDistance(loc1, loc2) {
        const R = 6371; // Earth's radius in km
        const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
        const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    isValidTransportMode(origin, destination, mode) {
        const distance = this.calculateDistance(origin, destination);
        
        switch (mode) {
            case 'sea':
                return (origin.type === 'port' || destination.type === 'port') && distance > 500;
            case 'air':
                return distance > 200;
            case 'land':
                return distance < 5000; // Continental transport
            case 'rail':
                return distance > 100 && distance < 3000;
            default:
                return true;
        }
    }

    generateRouteDetails(origin, destination, mode, distance) {
        const baseSpeeds = { sea: 25, air: 800, land: 80, rail: 60 }; // km/h
        const baseCosts = { sea: 0.5, air: 3.0, land: 1.0, rail: 0.8 }; // per km
        const reliabilityFactors = { sea: 0.85, air: 0.95, land: 0.90, rail: 0.88 };
        
        const speed = baseSpeeds[mode] * (0.8 + Math.random() * 0.4); // ±20% variance
        const cost = baseCosts[mode] * distance * (0.8 + Math.random() * 0.4);
        const reliability = reliabilityFactors[mode] * (0.9 + Math.random() * 0.1);
        const estimatedTime = distance / speed;
        
        return {
            id: `${origin.id}_${destination.id}_${mode.toUpperCase()}`,
            origin_id: origin.id,
            destination_id: destination.id,
            transport_mode: mode,
            distance: Math.round(distance),
            estimated_time: Math.round(estimatedTime * 10) / 10, // hours
            cost: Math.round(cost),
            reliability: Math.round(reliability * 100) / 100,
            capacity: this.getCapacityByMode(mode),
            environmental_impact: this.getEnvironmentalImpact(mode, distance),
            risk_factors: this.getRouteRiskFactors(origin, destination, mode),
            efficiency: Math.round((reliability * 0.4 + (1 - cost/distance/5) * 0.3 + (speed/1000) * 0.3) * 100) / 100
        };
    }

    getCapacityByMode(mode) {
        const capacities = {
            sea: { weight: 50000, volume: 2000 }, // tons, m³
            air: { weight: 100, volume: 500 },
            land: { weight: 25, volume: 100 },
            rail: { weight: 1000, volume: 800 }
        };
        return capacities[mode];
    }

    getEnvironmentalImpact(mode, distance) {
        const emissions = { sea: 0.01, air: 0.5, land: 0.2, rail: 0.05 }; // kg CO2 per km
        return Math.round(emissions[mode] * distance * 100) / 100;
    }

    getRouteRiskFactors(origin, destination, mode) {
        const risks = [];
        
        if (mode === 'sea') risks.push('weather', 'piracy');
        if (mode === 'air') risks.push('weather', 'security');
        if (mode === 'land') risks.push('traffic', 'border_delays');
        if (mode === 'rail') risks.push('infrastructure', 'delays');
        
        // Add geopolitical risks based on regions
        const highRiskCountries = ['political_instability', 'customs_delays'];
        if (Math.random() > 0.7) {
            risks.push(...highRiskCountries.slice(0, Math.floor(Math.random() * 2) + 1));
        }
        
        return risks;
    }

    generateMitigationActions(incidentType) {
        const mitigationMap = {
            delay: ['Implement buffer time', 'Use alternative routes', 'Improve scheduling'],
            damage: ['Enhanced packaging', 'Better handling procedures', 'Insurance coverage'],
            theft: ['Increase security measures', 'GPS tracking', 'Secure storage facilities'],
            customs: ['Pre-clearance documentation', 'Customs broker assistance', 'Compliance training'],
            weather: ['Weather monitoring', 'Flexible routing', 'Seasonal planning'],
            mechanical: ['Preventive maintenance', 'Backup vehicles', 'Regular inspections'],
            documentation: ['Document verification', 'Digital documentation', 'Staff training'],
            quality_issue: ['Quality control checks', 'Supplier audits', 'Temperature monitoring'],
            route_deviation: ['Real-time tracking', 'Driver training', 'Route optimization'],
            security_breach: ['Security protocols', 'Access controls', 'Incident response plan']
        };
        
        const actions = mitigationMap[incidentType] || ['General risk assessment', 'Process improvement'];
        return actions.slice(0, Math.floor(Math.random() * actions.length) + 1);
    }

    calculatePathDistance(path) {
        let totalDistance = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const loc1 = this.locations.find(l => l.id === path[i]);
            const loc2 = this.locations.find(l => l.id === path[i + 1]);
            if (loc1 && loc2) {
                totalDistance += this.calculateDistance(loc1, loc2);
            }
        }
        return Math.round(totalDistance);
    }

    calculatePathTime(path) {
        // Simplified time calculation
        const distance = this.calculatePathDistance(path);
        return Math.round(distance / 50 * 10) / 10; // Assume average 50 km/h
    }

    // Export all generated data
    exportData() {
        return {
            locations: this.locations,
            suppliers: this.suppliers,
            products: this.products,
            routes: this.routes,
            historical: this.historicalData,
            metadata: {
                generated_at: new Date().toISOString(),
                total_locations: this.locations.length,
                total_suppliers: this.suppliers.length,
                total_products: this.products.length,
                total_routes: this.routes.length,
                total_deliveries: this.historicalData.deliveries.length,
                total_incidents: this.historicalData.incidents.length
            }
        };
    }
}

module.exports = SyntheticDataGenerator;

// Example usage:

// console.log('Generated synthetic supply chain data:', data.metadata);