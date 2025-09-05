# ChainFlow - AI-Powered Supply Chain Verification Platform

*An AI-powered tool that verifies supply chain authenticity using zero-knowledge proofs and machine learning, giving businesses instant trust verification and route optimization.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org/)

ChainFlow revolutionizes supply chain management by combining AI-powered route optimization, zero-knowledge proof verification, and real-time tracking into a unified platform. Built for the Ethereum Accra Hackathon by **Abduljalaal Abubakar**, it addresses critical supply chain transparency and trust issues affecting global commerce.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/ShanksDLAw/Chainflow.git
cd Chainflow

# Install all dependencies
npm run install:all

# Start the application
npm run dev
```

The application will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000

## 🌟 Key Features

### 🔗 Integrated Payment & Supply Chain
- **Unified Payment Processing**: Process payments with automatic receipt generation and ZK proof verification
- **Real-time Route Tracking**: Monitor shipments from payment to delivery with live updates
- **Trust-based Transactions**: ML-powered risk assessment for every payment and shipment
- **Comprehensive Analytics**: Track payment patterns, delivery performance, and supply chain efficiency

### 🤖 Advanced ML & AI Capabilities
- **Route Optimization**: AI-powered algorithms for optimal supply chain paths
- **Fraud Detection**: Real-time anomaly detection and risk assessment
- **Trust Scoring**: Multi-factor supplier and product trust evaluation
- **Predictive Analytics**: Anticipate delays, risks, and optimization opportunities

### 🔐 Zero-Knowledge Privacy
- **Privacy-Preserving Verification**: Prove authenticity without revealing sensitive data
- **Cryptographic Receipts**: ZK-proof backed payment receipts
- **Supplier Privacy**: Verify credentials without exposing trade secrets
- **Scalable Verification**: Efficient batch processing for enterprise use

## 🛠️ Technology Stack

### Frontend
- **HTML5/CSS3/JavaScript**: Modern web standards
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: Live tracking and notifications

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **CORS**: Cross-origin resource sharing
- **Custom ML Engine**: Route optimization algorithms

### Blockchain & ZK
- **Hardhat**: Ethereum development environment
- **Solidity**: Smart contract development
- **Ethers.js**: Ethereum library
- **SnarkJS**: Zero-knowledge proof generation
- **Circom**: Circuit compiler for ZK proofs

### Development Tools
- **Nodemon**: Development server
- **Concurrently**: Parallel script execution
- **Git**: Version control

## 📁 Project Structure

```
Chainflow/
├── frontend/                 # Frontend application
│   ├── index.html           # Main dashboard
│   ├── script.js            # Frontend logic
│   ├── styles.css           # Styling
│   └── package.json         # Frontend dependencies
├── backend/                  # Backend services
│   ├── chainflow-api.js     # Main API server
│   ├── ml-route-engine.js   # AI route optimization
│   ├── ml-trust-service.js  # Trust scoring system
│   ├── payment-zk-service.js # Payment & ZK proofs
│   ├── integrated-ml-zk-service.js # Unified ML-ZK
│   ├── synthetic-data-generator.js # Test data
│   └── package.json         # Backend dependencies
├── contracts/               # Smart contracts
│   └── ChainFlowVerifier.sol # ZK verification contract
├── circuits/                # ZK proof circuits
├── scripts/                 # Deployment scripts
├── hardhat.config.js        # Hardhat configuration
└── package.json             # Root dependencies
```

## 🏗️ System Architecture

### Core Components
1. **AI Route Engine**: Machine learning algorithms for optimal supply chain paths
2. **ZK Proof System**: Privacy-preserving verification using zero-knowledge proofs
3. **Trust Scoring**: Multi-factor risk assessment and fraud detection
4. **Real-time Tracking**: Live shipment monitoring and updates
5. **Payment Integration**: Seamless payment processing with cryptographic receipts

## 📖 API Documentation

### Backend Endpoints

#### Supply Chain Management
```bash
# Get all products
GET /api/products

# Get product by ID
GET /api/products/:id

# Get suppliers
GET /api/suppliers

# Get tracking data
GET /api/tracking/:trackingId
```

#### Payment & Receipts
```bash
# Process payment
POST /api/payments
{
  "amount": 1000,
  "currency": "USD",
  "trackingId": "TRK-001"
}

# Download receipt
GET /api/receipts/:trackingId/download?format=pdf
```

#### ML & Analytics
```bash
# Get route optimization
GET /api/routes/optimize/:trackingId

# Get trust score
GET /api/trust/score/:supplierId

# Get analytics
GET /api/analytics/dashboard
```

## 🎯 Use Cases

### For Businesses
- **Supply Chain Transparency**: Track products from origin to destination
- **Fraud Prevention**: AI-powered risk assessment and anomaly detection
- **Cost Optimization**: ML-driven route optimization reduces logistics costs
- **Compliance**: Zero-knowledge proofs ensure regulatory compliance without data exposure

### For Consumers
- **Product Authenticity**: Verify genuine products with cryptographic proofs
- **Delivery Tracking**: Real-time shipment monitoring
- **Trust Verification**: Access supplier trust scores and ratings

## 🚀 Development

### Prerequisites
- Node.js 18+
- Python 3.8+
- Git

### Local Development
```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev

# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### Smart Contract Deployment
```bash
# Compile contracts
npm run compile

# Deploy to localhost
npm run deploy:localhost

# Deploy to testnet
npm run deploy:sepolia
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Abduljalaal Abubakar**
- Built for Ethereum Accra Hackathon
- Solving supply chain transparency and trust issues
- Combining AI, blockchain, and zero-knowledge proofs

## 🙏 Acknowledgments

- Ethereum Accra Hackathon organizers
- Zero-knowledge proof community
- Open source contributors

---

*ChainFlow - Revolutionizing supply chain management with AI and blockchain technology.*
- **Real-time Processing**: Live payment and shipment processing
- **ML Integration**: Advanced algorithms for optimization and fraud detection
- **ZK Proof Generation**: Privacy-preserving verification system
- **Route Optimization**: Multi-algorithm route planning (Dijkstra, A*, Genetic)
- **Trust Assessment**: Multi-factor risk evaluation

### Product Categories & Coverage
Supports comprehensive product categories:
- **Electronics**: Smartphones, laptops, components
- **Pharmaceuticals**: Medicines, medical supplies
- **Food & Beverage**: Perishables, packaged goods
- **Luxury Goods**: High-value items requiring special handling
- **Automotive**: Parts, accessories, vehicles
- **Medical Equipment**: Diagnostic tools, surgical instruments
- **Agriculture**: Seeds, fertilizers, farming equipment
- **Cosmetics**: Beauty products, personal care
- **Industrial Equipment**: Machinery, tools, components

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Noir](https://noir-lang.org/) for ZK circuit compilation
- Modern web browser

### Quick Setup

1. **Install Dependencies**:
   ```bash
   # Backend dependencies
   cd backend && npm install
   
   # Frontend dependencies
   cd ../frontend && npm install
   ```

2. **Start Backend Services**:
   ```bash
   cd backend
   node chainflow-api.js
   ```
   API server runs on `http://localhost:3002`

3. **Launch Frontend Application**:
   ```bash
   cd frontend
   python3 -m http.server 8080
   ```
   Web app available at `http://localhost:8080`

4. **Compile ZK Circuits** (optional):
   ```bash
   nargo compile
   nargo execute
   ```

## 📊 API Endpoints

### Product & Supplier Management
- `GET /api/suppliers` - List all suppliers with trust scores
- `POST /api/suppliers` - Register new supplier
- `GET /api/products` - List all products by category
- `POST /api/products` - Register new product
- `GET /api/products/:id/verify` - Verify product authenticity
- `GET /api/categories` - List product categories
- `GET /api/search` - Search products and suppliers

### Payment & Receipt Processing
- `POST /api/payments/process` - Process payment with receipt generation
- `GET /api/payments/:paymentId` - Get payment details
- `GET /api/receipts/:receiptId` - Get receipt with ZK proof
- `POST /api/receipts/:receiptId/verify` - Verify receipt authenticity
- `GET /api/payments/stats` - Payment statistics and analytics
- `GET /api/products/:productId/payments` - Payment history by product

### Route Optimization & Tracking
- `POST /api/optimize-route` - AI-powered route optimization
- `POST /api/start-tracking` - Initialize shipment tracking
- `GET /api/tracking/:trackingId` - Get real-time tracking status
- `POST /api/tracking/:trackingId/update` - Update tracking information
- `GET /api/active-shipments` - List all active shipments

### System & Analytics
- `GET /api/network` - Supply chain network topology
- `GET /api/status` - System health and performance metrics
- `POST /api/generate-proof` - Generate ZK proofs
- `POST /api/verify-proof` - Verify ZK proofs

## 🧠 ML & AI Features

### Trust Scoring Algorithm
Multi-factor trust assessment:
```
Trust Score = (
  Supplier History × 0.25 +
  Certification Validity × 0.20 +
  Supply Chain Integrity × 0.20 +
  Product Authenticity × 0.15 +
  Temporal Consistency × 0.10 +
  Behavioral Patterns × 0.10
) × 100
```

### Route Optimization
- **Dijkstra Algorithm**: Shortest path optimization
- **A* Search**: Heuristic-based pathfinding
- **Genetic Algorithm**: Evolutionary optimization for complex routes
- **Real-time Adaptation**: Dynamic route adjustment based on conditions

### Fraud Detection
- **Anomaly Detection**: Statistical pattern analysis
- **Behavioral Analysis**: Supplier and product behavior monitoring
- **Temporal Validation**: Time-based consistency checks
- **Risk Assessment**: Real-time risk scoring with confidence intervals

## 🔐 Zero-Knowledge Implementation

### ZK Circuit Design (`src/main.nr`)
The Noir circuit implements:
1. **Supplier Identity Verification**: Cryptographic commitment schemes
2. **Product Authenticity**: Signature verification without key exposure
3. **Payment Verification**: Receipt authenticity without revealing details
4. **Trust Score Validation**: Prove trust thresholds without exposing metrics

### Privacy Benefits
- **Supplier Privacy**: Verify credentials without exposing trade secrets
- **Payment Privacy**: Process payments without revealing sensitive financial data
- **Route Privacy**: Optimize routes without exposing competitive information
- **Trust Privacy**: Validate trust scores without revealing assessment details

## 📈 Performance & Scalability

### Current Capabilities
- **Concurrent Processing**: Handle multiple payments and shipments simultaneously
- **Real-time Updates**: Live tracking and status updates
- **Batch Verification**: Efficient ZK proof processing
- **Comprehensive Data**: 1500+ delivery records, 150+ incident reports
- **Multi-category Support**: 9 product categories with specialized handling

### Enterprise Features
- **Scalable Architecture**: Microservices-based design
- **API Rate Limiting**: Production-ready request handling
- **Error Handling**: Comprehensive error management and recovery
- **Monitoring**: Real-time system health and performance metrics
- **Security**: Multi-layer security with cryptographic verification

## 🎯 Use Cases

### Supply Chain Management
- **End-to-end Tracking**: From payment to delivery
- **Quality Assurance**: Verify product authenticity and condition
- **Risk Management**: Identify and mitigate supply chain risks
- **Compliance**: Meet regulatory requirements with verifiable records

### Payment Processing
- **Secure Transactions**: Cryptographically secured payment processing
- **Automated Receipts**: Generate verifiable receipts with ZK proofs
- **Fraud Prevention**: Real-time fraud detection and prevention
- **Multi-method Support**: Credit card, bank transfer, crypto, PayPal

### Enterprise Integration
- **API-first Design**: Easy integration with existing systems
- **Flexible Configuration**: Customizable trust thresholds and risk parameters
- **Comprehensive Analytics**: Detailed reporting and insights
- **Scalable Infrastructure**: Handle enterprise-level transaction volumes

## 🔮 Future Roadmap

### Short-term (Q1-Q2)
- Enhanced ZK circuit optimization
- Advanced ML model training
- Mobile application development
- Real-time notification system

### Medium-term (Q3-Q4)
- Blockchain integration for immutable records
- Advanced analytics dashboard
- Multi-tenant architecture
- International shipping support

### Long-term (2025+)
- IoT device integration
- Predictive maintenance
- Carbon footprint tracking
- Global supply chain network

## 🏆 Benefits

1. **Unified Platform**: Single solution for payments, tracking, and verification
2. **Privacy-First**: Zero-knowledge proofs protect sensitive information
3. **AI-Powered**: Machine learning optimizes routes and detects fraud
4. **Real-time**: Live tracking and instant verification
5. **Scalable**: Enterprise-ready architecture
6. **Secure**: Multi-layer security with cryptographic verification
7. **User-Friendly**: Intuitive interface for all stakeholders
8. **Cost-Effective**: Reduce fraud, optimize routes, improve efficiency

## 📋 Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: JSON-based with enterprise database roadmap
- **ZK System**: Noir/Barretenberg with BN254 elliptic curve
- **ML/AI**: Custom algorithms with TensorFlow.js integration planned
- **Cryptography**: Pedersen hash, EdDSA signatures
- **APIs**: RESTful with GraphQL roadmap

ChainFlow represents the future of supply chain management, combining cutting-edge cryptography, artificial intelligence, and seamless payment processing into a unified platform that prioritizes privacy, efficiency, and trust.