# SourceGuard User Flow Diagram

## System Architecture & User Journey

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supplier      │    │   SourceGuard   │    │   Verifier      │
│   Registration  │───▶│   Platform      │◄───│   (Customer)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Upload Product  │    │ ZK Circuit      │    │ Search Product  │
│ + Credentials   │───▶│ Verification    │◄───│ by ID/Batch     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Generate ZK     │    │ ML Trust Engine │    │ View Trust      │
│ Proof of Auth   │───▶│ Risk Assessment │───▶│ Score & Status  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Detailed User Journey

### 1. Supplier Onboarding
```
┌─────────────────────────────────────────────────────────────────┐
│                    SUPPLIER REGISTRATION                        │
├─────────────────────────────────────────────────────────────────┤
│ 1. Access SourceGuard Platform                                 │
│ 2. Navigate to "Register" → "Supplier"                         │
│ 3. Fill Registration Form:                                      │
│    • Company Name & Details                                     │
│    • Certification Documents                                    │
│    • Business License                                           │
│    • Contact Information                                        │
│ 4. Submit for Verification                                      │
│ 5. Receive Supplier ID & Credentials                           │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Product Registration
```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCT REGISTRATION                         │
├─────────────────────────────────────────────────────────────────┤
│ 1. Login with Supplier Credentials                             │
│ 2. Navigate to "Register" → "Product"                          │
│ 3. Enter Product Details:                                       │
│    • Product Name & Category                                    │
│    • Batch Number                                               │
│    • Manufacturing Date                                         │
│    • Supply Chain Path                                          │
│ 4. Generate ZK Proof of Authenticity                           │
│ 5. Product Added to Verified Database                          │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Product Verification (Customer/Verifier)
```
┌─────────────────────────────────────────────────────────────────┐
│                    PRODUCT VERIFICATION                         │
├─────────────────────────────────────────────────────────────────┤
│ 1. Access SourceGuard Platform                                 │
│ 2. Navigate to "Verify Product"                                │
│ 3. Enter Product Information:                                   │
│    • Product ID or Batch Number                                │
│    • Optional: Supplier Name                                   │
│ 4. Click "Verify Product"                                      │
│ 5. View Verification Results:                                   │
│    • Authenticity Status                                       │
│    • Trust Score                                               │
│    • Risk Assessment                                           │
│    • Supply Chain Integrity                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Technical Flow Architecture

### Zero-Knowledge Verification Process
```
┌─────────────────┐
│ Product Data    │
│ (Private Input) │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐
│ Noir ZK Circuit │───▶│ Proof Generation│
│ (main.nr)       │    │ (Private)       │
└─────────────────┘    └─────────┬───────┘
                                 │
                                 ▼
┌─────────────────┐    ┌─────────────────┐
│ Public Verifier │◄───│ ZK Proof        │
│ (Anyone)        │    │ (Public)        │
└─────────────────┘    └─────────────────┘
```

### ML Trust Engine Flow
```
┌─────────────────┐
│ Historical Data │
│ • Supplier Rep  │
│ • Product Track │
│ • Risk Patterns │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐
│ ML Algorithms   │───▶│ Trust Score     │
│ • Anomaly Det.  │    │ • Risk Level    │
│ • Pattern Rec.  │    │ • Confidence    │
└─────────────────┘    └─────────────────┘
```

## Dashboard & Monitoring

### Real-time Dashboard Features
- **Total Products**: Live count of registered products
- **Verified Suppliers**: Number of authenticated suppliers
- **Daily Verifications**: Products verified today
- **Overall Trust Score**: System-wide trust percentage
- **Recent Verifications**: Latest verification activities
- **Risk Alerts**: Real-time fraud detection alerts

### Supplier Management Interface
- View all registered suppliers
- Trust scores and risk assessments
- Supplier tier classifications (Premium/Standard/Basic)
- Certification status and expiry dates
- Performance metrics and history

## Privacy & Security Features

### What Stays Private (Zero-Knowledge)
- Supplier manufacturing processes
- Exact supply chain routes
- Private business relationships
- Proprietary product formulations
- Internal cost structures

### What Gets Verified (Public)
- Product authenticity status
- Compliance with standards
- Trust score and risk level
- Verification timestamp
- General supply chain integrity

## Integration Points

### API Endpoints
- `GET /api/suppliers` - List all suppliers
- `POST /api/suppliers` - Register new supplier
- `GET /api/products` - Search products
- `POST /api/products` - Register new product
- `POST /api/verify` - Verify product authenticity
- `GET /api/trust-score/:id` - Get trust assessment

### External Integrations
- Certification authorities
- Regulatory compliance systems
- Enterprise resource planning (ERP)
- Supply chain management platforms
- Quality assurance systems

This user flow demonstrates how SourceGuard enables **"Trust without Transparency"** - allowing verification of product authenticity and compliance while maintaining the privacy of sensitive business information.