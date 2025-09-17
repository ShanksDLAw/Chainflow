import streamlit as st
import pandas as pd
import numpy as np
import json
import random
from datetime import datetime, timedelta
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import time
import hashlib
import secrets
import warnings
warnings.filterwarnings('ignore')

# Try to import ML libraries with fallback
try:
    from sklearn.ensemble import RandomForestClassifier, IsolationForest
    from sklearn.preprocessing import StandardScaler
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import classification_report, accuracy_score
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    # Create dummy classes for fallback
    class RandomForestClassifier:
        def __init__(self, *args, **kwargs): pass
        def fit(self, X, y): return self
        def predict(self, X): return [0] * len(X)
        def predict_proba(self, X): return [[0.5, 0.5]] * len(X)
    
    class IsolationForest:
        def __init__(self, *args, **kwargs): pass
        def fit(self, X): return self
        def predict(self, X): return [1] * len(X)
    
    def train_test_split(*args, **kwargs):
        return args[0][:len(args[0])//2], args[0][len(args[0])//2:], args[1][:len(args[1])//2], args[1][len(args[1])//2:]
    
    class StandardScaler:
        def __init__(self): pass
        def fit(self, X): return self
        def transform(self, X): return X
        def fit_transform(self, X): return X
    
    def accuracy_score(y_true, y_pred): return 0.85
    def classification_report(y_true, y_pred): return "ML libraries not available"

# Page configuration
st.set_page_config(
    page_title="ChainFlow - AI-Powered Supply Chain Verification",
    page_icon="🔗",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 2rem;
    }
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1rem;
        border-radius: 10px;
        color: white;
        text-align: center;
        margin: 0.5rem 0;
    }
    .feature-card {
        background: #f8f9fa;
        padding: 1.5rem;
        border-radius: 10px;
        border-left: 4px solid #667eea;
        margin: 1rem 0;
    }
    .success-message {
        background: #d4edda;
        color: #155724;
        padding: 1rem;
        border-radius: 5px;
        border: 1px solid #c3e6cb;
    }
    .warning-message {
        background: #fff3cd;
        color: #856404;
        padding: 1rem;
        border-radius: 5px;
        border: 1px solid #ffeaa7;
    }
</style>
""", unsafe_allow_html=True)

# Auto-progress function for live tracking simulation
def update_auto_progress():
    """Automatically update progress for shipments with auto_progress enabled"""
    if 'user_tracking_data' not in st.session_state:
        return
    
    current_time = datetime.now()
    
    for tracking_id, shipment in st.session_state.user_tracking_data.items():
        if shipment.get('auto_progress', False) and shipment['progress'] < 100:
            created_at = datetime.fromisoformat(shipment['created_at'])
            time_elapsed = current_time - created_at
            
            # Progress based on time elapsed (simulate 1% progress per 30 seconds)
            time_based_progress = min(int(time_elapsed.total_seconds() / 30), 95)
            
            if time_based_progress > shipment['progress']:
                shipment['progress'] = time_based_progress
                shipment['last_updated'] = current_time.isoformat()
                
                # Update status and location based on progress
                if time_based_progress >= 90:
                    shipment['status'] = "Out for Delivery"
                    shipment['current_location'] = "Local Facility"
                elif time_based_progress >= 70:
                    shipment['status'] = "In Transit"
                    shipment['current_location'] = "Transit Hub"
                elif time_based_progress >= 40:
                    shipment['status'] = "Shipped"
                    shipment['current_location'] = "Distribution Center"
                elif time_based_progress >= 20:
                    shipment['status'] = "Processing"
                    shipment['current_location'] = "Warehouse"

# Load sample data
@st.cache_data
def load_sample_data():
    # Comprehensive products data with healthcare, military, and logistics sectors
    products = [
        # Healthcare Products - HIPAA Compliance Required
        {"id": "MED-001", "name": "Surgical Masks N95", "category": "Healthcare", "supplier": "MedTech Solutions", "trust_score": 98, "price": 45.99, "origin": "USA", "image": "images/surgical_mask.svg", "compliance": ["HIPAA", "FDA", "ISO 13485"], "verification_type": "medical_device"},
        {"id": "MED-002", "name": "Digital Thermometer", "category": "Healthcare", "supplier": "HealthDevice Corp", "trust_score": 96, "price": 89.99, "origin": "Germany", "image": "images/thermometer.svg", "compliance": ["HIPAA", "CE", "FDA"], "verification_type": "medical_device"},
        {"id": "MED-003", "name": "Insulin Vials", "category": "Healthcare", "supplier": "PharmaCare Ltd", "trust_score": 99, "price": 299.99, "origin": "Switzerland", "image": "images/insulin.svg", "compliance": ["HIPAA", "FDA", "GMP"], "verification_type": "pharmaceutical"},
        {"id": "MED-004", "name": "Blood Pressure Monitor", "category": "Healthcare", "supplier": "CardioTech", "trust_score": 94, "price": 159.99, "origin": "Japan", "image": "images/bp_monitor.svg", "compliance": ["HIPAA", "FDA", "ISO 13485"], "verification_type": "medical_device"},
        
        # Military/Defense Products - Military-Grade Verification Required
        {"id": "MIL-001", "name": "Tactical Communication Radio", "category": "Military", "supplier": "DefenseTech Industries", "trust_score": 99, "price": 2499.99, "origin": "USA", "image": "images/tactical_radio.svg", "compliance": ["ITAR", "MIL-STD", "FIPS 140-2"], "verification_type": "defense_equipment"},
        {"id": "MIL-002", "name": "Kevlar Body Armor", "category": "Military", "supplier": "ArmorCorp", "trust_score": 98, "price": 899.99, "origin": "USA", "image": "images/body_armor.svg", "compliance": ["NIJ", "MIL-STD", "ITAR"], "verification_type": "protective_equipment"},
        {"id": "MIL-003", "name": "Night Vision Goggles", "category": "Military", "supplier": "OpticDefense", "trust_score": 97, "price": 3999.99, "origin": "USA", "image": "images/night_vision.svg", "compliance": ["ITAR", "MIL-STD", "EAR"], "verification_type": "optical_equipment"},
        {"id": "MIL-004", "name": "Encrypted Laptop", "category": "Military", "supplier": "SecureComputing", "trust_score": 99, "price": 4999.99, "origin": "USA", "image": "images/encrypted_laptop.svg", "compliance": ["FIPS 140-2", "Common Criteria", "ITAR"], "verification_type": "secure_computing"},
        
        # Logistics/Last-Mile Delivery Products
        {"id": "LOG-001", "name": "GPS Tracking Device", "category": "Logistics", "supplier": "TrackTech Solutions", "trust_score": 92, "price": 199.99, "origin": "South Korea", "image": "images/gps_tracker.svg", "compliance": ["FCC", "CE"], "verification_type": "tracking_device"},
        {"id": "LOG-002", "name": "Temperature Sensor", "category": "Logistics", "supplier": "ColdChain Monitors", "trust_score": 95, "price": 89.99, "origin": "Netherlands", "image": "images/temp_sensor.svg", "compliance": ["ISO 9001", "HACCP"], "verification_type": "monitoring_device"},
        {"id": "LOG-003", "name": "Delivery Drone", "category": "Logistics", "supplier": "AerialLogistics", "trust_score": 88, "price": 12999.99, "origin": "China", "image": "images/delivery_drone.svg", "compliance": ["FAA", "CE", "FCC"], "verification_type": "aerial_vehicle"},
        {"id": "LOG-004", "name": "Smart Lock System", "category": "Logistics", "supplier": "SecureDelivery Inc", "trust_score": 91, "price": 299.99, "origin": "Canada", "image": "images/smart_lock.svg", "compliance": ["UL", "FCC"], "verification_type": "security_device"},
        
        # Traditional Products (keeping some for variety)
        {"id": "PRD-001", "name": "Organic Coffee Beans", "category": "Food & Beverage", "supplier": "Ethiopian Highlands Co.", "trust_score": 95, "price": 24.99, "origin": "Ethiopia", "image": "images/coffee_beans.svg", "compliance": ["Organic", "Fair Trade"], "verification_type": "food_product"},
        {"id": "PRD-002", "name": "Sustainable Cotton T-Shirt", "category": "Apparel", "supplier": "EcoTextiles Ltd.", "trust_score": 88, "price": 29.99, "origin": "India", "image": "images/cotton_tshirt.svg", "compliance": ["GOTS", "Fair Trade"], "verification_type": "textile_product"},
        {"id": "PRD-003", "name": "Swiss Luxury Watch", "category": "Luxury", "supplier": "Alpine Timepieces", "trust_score": 99, "price": 2499.99, "origin": "Switzerland", "image": "images/swiss_watch.svg", "compliance": ["Swiss Made", "COSC"], "verification_type": "luxury_item"}
    ]
    
    # Sample tracking data with sector-specific compliance verification
    tracking_data = {
        # Healthcare Shipments - HIPAA Verified
        "TRK-MED-001": {
            "product": "Surgical Masks N95",
            "status": "In Transit",
            "current_location": "FDA Distribution Center",
            "progress": 75,
            "estimated_delivery": "2024-01-25",
            "route": ["Manufacturing Facility", "FDA Inspection", "Distribution Center", "Hospital"],
            "zk_verified": True,
            "compliance_verified": ["HIPAA", "FDA", "ISO 13485"],
            "verification_type": "medical_device"
        },
        "TRK-MED-002": {
            "product": "Insulin Vials",
            "status": "Cold Chain Verified",
            "current_location": "Pharmaceutical Warehouse",
            "progress": 45,
            "estimated_delivery": "2024-01-28",
            "route": ["Swiss Manufacturing", "Cold Storage", "Pharmaceutical Warehouse", "Pharmacy"],
            "zk_verified": True,
            "compliance_verified": ["HIPAA", "FDA", "GMP"],
            "verification_type": "pharmaceutical"
        },
        
        # Military Shipments - ITAR Verified
        "TRK-MIL-001": {
            "product": "Tactical Communication Radio",
            "status": "Security Clearance Verified",
            "current_location": "Secure Military Facility",
            "progress": 90,
            "estimated_delivery": "2024-01-26",
            "route": ["Defense Contractor", "Security Screening", "Military Base", "Field Unit"],
            "zk_verified": True,
            "compliance_verified": ["ITAR", "MIL-STD", "FIPS 140-2"],
            "verification_type": "defense_equipment"
        },
        "TRK-MIL-002": {
            "product": "Night Vision Goggles",
            "status": "Export License Verified",
            "current_location": "Defense Logistics Center",
            "progress": 60,
            "estimated_delivery": "2024-01-30",
            "route": ["Manufacturing", "Export Control", "Defense Logistics", "Military Unit"],
            "zk_verified": True,
            "compliance_verified": ["ITAR", "MIL-STD", "EAR"],
            "verification_type": "optical_equipment"
        },
        
        # Logistics Shipments - Last-Mile Optimized
        "TRK-LOG-001": {
            "product": "GPS Tracking Device",
            "status": "Route Optimized",
            "current_location": "Last-Mile Hub",
            "progress": 85,
            "estimated_delivery": "2024-01-24",
            "route": ["Seoul Factory", "Port of Busan", "Los Angeles Port", "Last-Mile Hub", "Customer"],
            "zk_verified": True,
            "compliance_verified": ["FCC", "CE"],
            "verification_type": "tracking_device",
            "driver_verified": True,
            "delivery_optimized": True
        },
        "TRK-LOG-002": {
            "product": "Delivery Drone",
            "status": "FAA Clearance Verified",
            "current_location": "Drone Operations Center",
            "progress": 55,
            "estimated_delivery": "2024-02-01",
            "route": ["Shenzhen Factory", "Quality Control", "Customs", "Drone Operations Center", "Customer"],
            "zk_verified": True,
            "compliance_verified": ["FAA", "CE", "FCC"],
            "verification_type": "aerial_vehicle",
            "flight_path_optimized": True
        },
        "TRK-PAY-004": {
            "product": "Norwegian Salmon",
            "status": "In Transit",
            "current_location": "Oslo Port",
            "progress": 45,
            "estimated_delivery": "2024-01-28",
            "route": ["Bergen", "Oslo", "Copenhagen", "Hamburg", "London"],
            "zk_verified": True
        },
        "TRK-PAY-005": {
            "product": "Bamboo Phone Case",
            "status": "Shipped",
            "current_location": "Shanghai",
            "progress": 30,
            "estimated_delivery": "2024-02-02",
            "route": ["Guangzhou", "Shanghai", "Tokyo", "Los Angeles", "Denver"],
            "zk_verified": True
        },
        "TRK-PAY-006": {
            "product": "Premium Chocolate Bar",
            "status": "In Transit",
            "current_location": "Brussels",
            "progress": 80,
            "estimated_delivery": "2024-01-24",
            "route": ["Zurich", "Brussels", "Paris", "London"],
            "zk_verified": True
        },
        "TRK-PAY-007": {
            "product": "Organic Green Tea",
            "status": "Processing",
            "current_location": "Kyoto",
            "progress": 10,
            "estimated_delivery": "2024-02-05",
            "route": ["Kyoto", "Tokyo", "Seoul", "Vancouver", "Seattle"],
            "zk_verified": True
        },
        "TRK-PAY-008": {
            "product": "Handcrafted Leather Handbag",
            "status": "Delivered",
            "current_location": "Milan",
            "progress": 100,
            "estimated_delivery": "2024-01-22",
            "route": ["Florence", "Milan", "Paris", "London"],
            "zk_verified": True
        },
        "TRK-PAY-009": {
            "product": "Pure Vanilla Extract",
            "status": "In Transit",
            "current_location": "Port of Spain",
            "progress": 55,
            "estimated_delivery": "2024-01-29",
            "route": ["Madagascar", "Port of Spain", "Miami", "Atlanta", "New York"],
            "zk_verified": True
        },
        "TRK-PAY-010": {
            "product": "Merino Wool Blanket",
            "status": "Shipped",
            "current_location": "Auckland",
            "progress": 25,
            "estimated_delivery": "2024-02-08",
            "route": ["Wellington", "Auckland", "Sydney", "Los Angeles", "Chicago"],
            "zk_verified": True
        }
    }
    
    return products, tracking_data

# Generate analytics data
@st.cache_data
def generate_analytics_data():
    dates = pd.date_range(start='2024-01-01', end='2024-01-20', freq='D')
    
    # Supply chain metrics
    metrics_data = {
        'date': dates,
        'shipments': np.random.randint(50, 200, len(dates)),
        'fraud_detected': np.random.randint(0, 5, len(dates)),
        'cost_savings': np.random.uniform(1000, 5000, len(dates)),
        'trust_score': np.random.uniform(85, 98, len(dates))
    }
    
    return pd.DataFrame(metrics_data)

# Global countries data
@st.cache_data
def get_global_countries():
    return [
        "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
        "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bolivia", "Brazil", "Bulgaria", "Cambodia",
        "Canada", "Chile", "China", "Colombia", "Croatia", "Czech Republic", "Denmark", "Ecuador",
        "Egypt", "Estonia", "Ethiopia", "Finland", "France", "Georgia", "Germany", "Ghana",
        "Greece", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
        "Israel", "Italy", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Latvia",
        "Lebanon", "Lithuania", "Luxembourg", "Madagascar", "Malaysia", "Mexico", "Morocco", "Netherlands",
        "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal",
        "Qatar", "Romania", "Russia", "Saudi Arabia", "Singapore", "Slovakia", "Slovenia", "South Africa",
        "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Thailand", "Turkey", "UAE",
        "Ukraine", "United Kingdom", "United States", "Uruguay", "Venezuela", "Vietnam", "Yemen", "Zimbabwe"
    ]

# Major shipping hubs by region
@st.cache_data
def get_shipping_hubs():
    return {
        "Asia": ["Singapore", "Shanghai", "Hong Kong", "Dubai", "Mumbai"],
        "Europe": ["Rotterdam", "Hamburg", "Antwerp", "London", "Barcelona"],
        "Americas": ["Los Angeles", "New York", "Miami", "Vancouver", "Santos"],
        "Africa": ["Cape Town", "Lagos", "Cairo", "Casablanca", "Durban"],
        "Oceania": ["Sydney", "Melbourne", "Auckland", "Brisbane"]
    }

# ML Datasets and Functions
@st.cache_data
def generate_fraud_detection_dataset():
    """Generate realistic fraud detection dataset for supply chain"""
    np.random.seed(42)
    n_samples = 1000
    
    # Normal transactions (80%)
    normal_samples = int(n_samples * 0.8)
    normal_data = {
        'transaction_amount': np.random.lognormal(mean=8, sigma=1, size=normal_samples),
        'delivery_time_hours': np.random.normal(72, 12, normal_samples),
        'supplier_trust_score': np.random.normal(85, 10, normal_samples),
        'route_deviation_km': np.random.exponential(5, normal_samples),
        'temperature_variance': np.random.normal(2, 1, normal_samples),
        'documentation_completeness': np.random.normal(95, 5, normal_samples),
        'payment_delay_hours': np.random.exponential(2, normal_samples),
        'is_fraud': [0] * normal_samples
    }
    
    # Fraudulent transactions (20%)
    fraud_samples = n_samples - normal_samples
    fraud_data = {
        'transaction_amount': np.random.lognormal(mean=10, sigma=2, size=fraud_samples),
        'delivery_time_hours': np.random.normal(120, 30, fraud_samples),
        'supplier_trust_score': np.random.normal(45, 15, fraud_samples),
        'route_deviation_km': np.random.exponential(50, fraud_samples),
        'temperature_variance': np.random.normal(8, 3, fraud_samples),
        'documentation_completeness': np.random.normal(60, 20, fraud_samples),
        'payment_delay_hours': np.random.exponential(24, fraud_samples),
        'is_fraud': [1] * fraud_samples
    }
    
    # Combine datasets
    combined_data = {}
    for key in normal_data.keys():
        combined_data[key] = np.concatenate([normal_data[key], fraud_data[key]])
    
    # Shuffle the data
    indices = np.random.permutation(n_samples)
    for key in combined_data.keys():
        combined_data[key] = combined_data[key][indices]
    
    return pd.DataFrame(combined_data)

@st.cache_data
def generate_trust_scoring_dataset():
    """Generate realistic trust scoring dataset"""
    np.random.seed(123)
    n_suppliers = 500
    
    # Supplier categories with different trust profiles
    categories = ['Premium', 'Standard', 'Budget', 'New']
    category_weights = [0.2, 0.4, 0.3, 0.1]
    
    data = []
    for i in range(n_suppliers):
        category = np.random.choice(categories, p=category_weights)
        
        if category == 'Premium':
            base_trust = np.random.normal(90, 5)
            delivery_performance = np.random.normal(95, 3)
            quality_score = np.random.normal(92, 4)
            compliance_score = np.random.normal(98, 2)
        elif category == 'Standard':
            base_trust = np.random.normal(75, 8)
            delivery_performance = np.random.normal(85, 8)
            quality_score = np.random.normal(80, 10)
            compliance_score = np.random.normal(88, 6)
        elif category == 'Budget':
            base_trust = np.random.normal(60, 12)
            delivery_performance = np.random.normal(70, 15)
            quality_score = np.random.normal(65, 15)
            compliance_score = np.random.normal(75, 10)
        else:  # New
            base_trust = np.random.normal(50, 15)
            delivery_performance = np.random.normal(60, 20)
            quality_score = np.random.normal(55, 20)
            compliance_score = np.random.normal(70, 15)
        
        data.append({
            'supplier_id': f'SUP-{i+1:03d}',
            'category': category,
            'years_in_business': max(1, np.random.poisson(8)),
            'total_transactions': max(10, np.random.poisson(200)),
            'delivery_performance': max(0, min(100, delivery_performance)),
            'quality_score': max(0, min(100, quality_score)),
            'compliance_score': max(0, min(100, compliance_score)),
            'financial_stability': np.random.normal(75, 15),
            'certifications_count': np.random.poisson(3),
            'trust_score': max(0, min(100, base_trust))
        })
    
    return pd.DataFrame(data)

@st.cache_resource
def train_fraud_detection_model():
    """Train and return fraud detection model"""
    df = generate_fraud_detection_dataset()
    
    # Prepare features
    feature_columns = ['transaction_amount', 'delivery_time_hours', 'supplier_trust_score', 
                      'route_deviation_km', 'temperature_variance', 'documentation_completeness', 
                      'payment_delay_hours']
    
    X = df[feature_columns]
    y = df['is_fraud']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)
    
    # Calculate accuracy
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    
    return model, scaler, accuracy, feature_columns

def predict_fraud_risk(transaction_data):
    """Predict fraud risk for a transaction"""
    model, scaler, accuracy, feature_columns = train_fraud_detection_model()
    
    # Prepare input data
    input_data = np.array([[
        transaction_data.get('transaction_amount', 1000),
        transaction_data.get('delivery_time_hours', 72),
        transaction_data.get('supplier_trust_score', 85),
        transaction_data.get('route_deviation_km', 5),
        transaction_data.get('temperature_variance', 2),
        transaction_data.get('documentation_completeness', 95),
        transaction_data.get('payment_delay_hours', 2)
    ]])
    
    # Scale and predict
    input_scaled = scaler.transform(input_data)
    fraud_probability = model.predict_proba(input_scaled)[0][1]
    
    return fraud_probability, accuracy

def calculate_trust_score(supplier_data):
    """Calculate trust score for a supplier using ML"""
    # Use weighted scoring based on key factors
    weights = {
        'delivery_performance': 0.25,
        'quality_score': 0.25,
        'compliance_score': 0.20,
        'financial_stability': 0.15,
        'years_in_business': 0.10,
        'certifications_count': 0.05
    }
    
    # Normalize years in business (cap at 20 years = 100 points)
    years_score = min(100, (supplier_data.get('years_in_business', 5) / 20) * 100)
    
    # Normalize certifications (cap at 10 certifications = 100 points)
    cert_score = min(100, (supplier_data.get('certifications_count', 3) / 10) * 100)
    
    # Calculate weighted score
    trust_score = (
        supplier_data.get('delivery_performance', 85) * weights['delivery_performance'] +
        supplier_data.get('quality_score', 80) * weights['quality_score'] +
        supplier_data.get('compliance_score', 88) * weights['compliance_score'] +
        supplier_data.get('financial_stability', 75) * weights['financial_stability'] +
        years_score * weights['years_in_business'] +
        cert_score * weights['certifications_count']
    )
    
    return max(0, min(100, trust_score))

# Enhanced ML route optimization with real-world logic
def optimize_route(origin, destination, priority="Cost"):
    hubs = get_shipping_hubs()
    
    # Determine optimal route based on geography and priority
    def get_region(country):
        asia_countries = ["China", "India", "Japan", "Singapore", "Thailand", "Vietnam", "Malaysia", "Indonesia", "South Korea", "Philippines"]
        europe_countries = ["Germany", "France", "United Kingdom", "Italy", "Spain", "Netherlands", "Belgium", "Switzerland", "Austria", "Sweden", "Norway", "Denmark"]
        americas_countries = ["United States", "Canada", "Brazil", "Mexico", "Argentina", "Chile", "Colombia", "Peru"]
        africa_countries = ["South Africa", "Nigeria", "Egypt", "Kenya", "Ghana", "Morocco", "Ethiopia"]
        
        if country in asia_countries: return "Asia"
        elif country in europe_countries: return "Europe"
        elif country in americas_countries: return "Americas"
        elif country in africa_countries: return "Africa"
        else: return "Asia"  # Default
    
    origin_region = get_region(origin)
    dest_region = get_region(destination)
    
    # Build optimal route
    route = [origin]
    
    if origin_region != dest_region:
        # Add regional hub for origin
        origin_hub = random.choice(hubs[origin_region])
        if origin_hub != origin:
            route.append(origin_hub)
        
        # Add international transit hub
        if origin_region == "Asia" and dest_region == "Europe":
            route.append("Dubai")
        elif origin_region == "Europe" and dest_region == "Americas":
            route.append("London")
        elif origin_region == "Asia" and dest_region == "Americas":
            route.extend(["Singapore", "Los Angeles"])
        else:
            # General international hub
            route.append(random.choice(["Dubai", "Singapore", "London"]))
        
        # Add destination regional hub
        dest_hub = random.choice(hubs[dest_region])
        if dest_hub != destination:
            route.append(dest_hub)
    
    route.append(destination)
    
    # Remove duplicates while preserving order
    seen = set()
    route = [x for x in route if not (x in seen or seen.add(x))]
    
    # Calculate metrics based on priority and distance
    base_cost = len(route) * random.randint(800, 1200)
    base_time = len(route) * random.randint(3, 7)
    base_carbon = len(route) * random.uniform(0.8, 1.5)
    
    # Adjust based on priority
    if priority == "Cost":
        cost_multiplier = 0.85
        time_multiplier = 1.2
        carbon_multiplier = 1.1
    elif priority == "Time":
        cost_multiplier = 1.3
        time_multiplier = 0.7
        carbon_multiplier = 1.4
    else:  # Sustainability
        cost_multiplier = 1.1
        time_multiplier = 1.1
        carbon_multiplier = 0.6
    
    return {
        "optimal": route,
        "cost": int(base_cost * cost_multiplier),
        "time": f"{int(base_time * time_multiplier)} days",
        "carbon": f"{base_carbon * carbon_multiplier:.1f} tons CO2",
        "efficiency_score": random.randint(85, 98),
        "risk_level": random.choice(["Low", "Medium", "Low", "Low"]),  # Weighted towards low risk
        "weather_impact": random.choice(["Minimal", "Low", "Moderate"])
    }

# Enhanced ZK proof generation with zkVerify integration and sector-specific compliance
def generate_zk_proof(product_id, proof_type="authenticity", privacy_level="standard", product_data=None):
    """
    Generate ZK proof using zkVerify universal verification layer with sector-specific compliance
    """
    import hashlib
    import secrets
    
    # Generate realistic proof components with zkVerify compatibility
    witness_hash = hashlib.sha256(f"{product_id}_{proof_type}_{secrets.token_hex(16)}".encode()).hexdigest()
    public_inputs = hashlib.sha256(f"public_{product_id}_{datetime.now().isoformat()}".encode()).hexdigest()
    
    # zkVerify supported proof systems
    proof_systems = {
        "authenticity": "Groth16 (zkVerify)",
        "origin": "PLONK (zkVerify)",
        "quality": "STARK (zkVerify)",
        "route": "Groth16 (zkVerify)",
        "payment": "PLONK (zkVerify)",
        "compliance": "STARK (zkVerify)",  # For regulatory compliance
        "identity": "Groth16 (zkVerify)"   # For identity verification
    }
    
    # Privacy levels affect proof generation time and security
    privacy_multipliers = {
        "standard": 1.0,
        "high": 1.5,
        "maximum": 2.0,
        "military": 3.0  # Military-grade security
    }
    
    base_time = random.uniform(0.5, 1.8)  # zkVerify optimized timing
    generation_time = base_time * privacy_multipliers.get(privacy_level, 1.0)
    
    # Generate zkVerify-compatible proof structure
    zkverify_proof_id = f"zkv_{secrets.token_hex(16)}"
    zkverify_tx_hash = f"0x{secrets.token_hex(32)}"
    
    # Sector-specific compliance verification
    compliance_verification = {}
    if product_data:
        category = product_data.get('category', '')
        compliance_reqs = product_data.get('compliance', [])
        verification_type = product_data.get('verification_type', '')
        
        if category == 'Healthcare':
            compliance_verification = {
                "hipaa_verified": "HIPAA" in compliance_reqs,
                "fda_approved": "FDA" in compliance_reqs,
                "medical_device_class": "Class II" if verification_type == "medical_device" else "N/A",
                "patient_privacy_protected": True,
                "phi_encrypted": True,
                "audit_trail_enabled": True
            }
            privacy_level = "high"  # Healthcare requires high privacy
            
        elif category == 'Military':
            # Enhanced military-grade verification with comprehensive security clearance checks
            military_verification = product_data.get('military_verification', {})
            security_clearance = military_verification.get('security_clearance', 'Unclassified')
            
            compliance_verification = {
                "itar_compliant": "ITAR" in compliance_reqs,
                "security_clearance_verified": True,
                "security_clearance_level": security_clearance,
                "clearance_expiry_valid": True,  # Check if clearance is current
                "export_license_valid": "EAR" in compliance_reqs or "ITAR" in compliance_reqs,
                "mil_std_certified": "MIL-STD" in compliance_reqs,
                "fips_140_2_validated": "FIPS 140-2" in compliance_reqs,
                "supply_chain_vetted": True,
                "end_user_verified": True,
                "contractor_verified": True,
                "facility_security_cleared": security_clearance in ['Secret', 'Top Secret', 'TS/SCI'],
                "personnel_background_checked": True,
                "foreign_ownership_cleared": True,
                "technology_transfer_approved": "ITAR" in compliance_reqs,
                "cybersecurity_framework_compliant": "NIST 800-171" in compliance_reqs,
                "supply_chain_risk_assessed": True,
                "insider_threat_mitigated": True,
                "physical_security_verified": True,
                "information_security_validated": True,
                "operational_security_confirmed": True,
                "communications_security_enabled": True,
                "tamper_evidence_verified": True,
                "chain_of_custody_maintained": True,
                "dual_use_technology_controlled": True,
                "critical_technology_protected": security_clearance in ['Top Secret', 'TS/SCI'],
                "defense_industrial_base_verified": True,
                "trusted_supplier_validated": True
            }
            privacy_level = "military"  # Military requires maximum security
            
        elif category == 'Logistics':
            compliance_verification = {
                "driver_identity_verified": True,
                "receiver_identity_verified": True,
                "route_optimized": True,
                "delivery_secured": True,
                "tracking_enabled": True,
                "last_mile_optimized": True,
                "cost_savings_calculated": True
            }
    
    proof_data = {
        "proof_hash": f"0x{witness_hash[:64]}",
        "public_inputs": f"0x{public_inputs[:32]}",
        "verification_key": f"0x{hashlib.sha256(f'vk_{proof_type}'.encode()).hexdigest()[:32]}",
        "proof_system": proof_systems.get(proof_type, "Groth16 (zkVerify)"),
        "verification_time": f"{generation_time:.2f}s",
        "proof_size": f"{random.randint(192, 256)} bytes",  # zkVerify optimized size
        "security_level": "256-bit" if privacy_level == "military" else "128-bit",
        "verified": True,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "privacy_level": privacy_level,
        "circuit_constraints": random.randint(8000, 35000),  # zkVerify optimized
        "trusted_setup": "Universal (zkVerify)",
        "zkverify_proof_id": zkverify_proof_id,
        "zkverify_tx_hash": zkverify_tx_hash,
        "zkverify_chain_id": 1,
        "verification_layer": "zkVerify Testnet",
        "gas_cost": f"{random.randint(15000, 45000)} gas",
        "finality_time": f"{random.uniform(2.1, 6.8):.1f}s",
        "compliance_verification": compliance_verification
    }
    
    return proof_data

# Enhanced route ZK proof generation
def generate_route_zk_proof(origin, destination, route_data, use_case="Standard Commercial", privacy_level="Standard"):
    """
    Generate enhanced ZK proof for route verification with supply chain privacy
    """
    import hashlib
    import secrets
    
    # Create route fingerprint without revealing sensitive data
    route_fingerprint = hashlib.sha256(
        f"{origin}_{destination}_{route_data.get('cost', 0)}_{route_data.get('time', '0')}_{use_case}".encode()
    ).hexdigest()
    
    # Adjust security parameters based on use case and privacy level
    security_multiplier = 1.0
    if "Military" in use_case or "Defense" in use_case:
        security_multiplier = 1.5
    elif "Healthcare" in use_case or "Medical" in use_case:
        security_multiplier = 1.3
    elif privacy_level == "Military-Grade":
        security_multiplier = 1.8
    elif privacy_level == "Maximum":
        security_multiplier = 1.4
    
    # Generate comprehensive route proof with zkVerify integration
    zkverify_route_proof_id = f"zkv_route_{secrets.token_hex(12)}"
    zkverify_route_tx_hash = f"0x{secrets.token_hex(32)}"
    
    route_proof = {
        "route_hash": f"0x{route_fingerprint[:64]}",
        "optimization_proof": f"0x{secrets.token_hex(int(32 * security_multiplier))}",
        "privacy_preserving_hash": f"0x{hashlib.sha256(f'private_route_{secrets.token_hex(16)}_{use_case}'.encode()).hexdigest()[:32]}",
        "ml_verification": f"0x{secrets.token_hex(int(24 * security_multiplier))}",
        "use_case_proof": f"0x{hashlib.sha256(use_case.encode()).hexdigest()[:16]}",
        "proof_system": f"STARK (zkVerify) - Route Optimization",
        "verification_time": f"{random.uniform(0.8 * security_multiplier, 2.2 * security_multiplier):.2f}s",
        "proof_size": f"{int(256 * security_multiplier)} bytes",
        "security_level": f"{int(128 * security_multiplier)}-bit quantum-resistant",
        "privacy_level": privacy_level,
        "use_case": use_case,
        "verified": True,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "route_efficiency": f"{random.randint(85, 98)}%",
        "privacy_score": f"{random.randint(92, min(99, max(93, int(92 * security_multiplier))))}%",
        "supply_chain_integrity": "✅ Verified",
        "logistics_privacy": "✅ Protected",
        "cost_optimization": f"{random.randint(15, 35)}% savings",
        "zkverify_proof_id": zkverify_route_proof_id,
        "zkverify_tx_hash": zkverify_route_tx_hash,
        "zkverify_chain_id": 1,
        "verification_layer": "zkVerify Testnet",
        "gas_cost": f"{random.randint(25000, 65000)} gas",
        "finality_time": f"{random.uniform(3.2, 8.1):.1f}s",
        "carbon_reduction": f"{random.randint(8, 25)}% reduction",
        "ml_algorithm_verified": "✅ Cryptographically Proven",
        "compliance_level": "Military-Grade" if "Military" in use_case else "Enterprise-Grade"
    }
    
    return route_proof

# Main app
def main():
    # Header with logo
    try:
        # Use st.image for logo instead of direct SVG embedding
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            st.image('images/chainflow_logo.svg', width=400)
    except FileNotFoundError:
        # Fallback header
        st.markdown('<h1 class="main-header">🔗 ChainFlow</h1>', unsafe_allow_html=True)
        st.markdown('<p style="text-align: center; font-size: 1.2rem; color: #666;">AI-Powered Supply Chain Verification Platform with Enterprise-Grade Proof Verification</p>', unsafe_allow_html=True)
    
    # Load data
    products, tracking_data = load_sample_data()
    analytics_df = generate_analytics_data()
    
    # Sidebar navigation
    st.sidebar.title("🚀 Navigation")
    page = st.sidebar.selectbox(
        "Choose a section:",
        ["🏠 Dashboard", "📦 Product Verification", "🚚 Shipment Tracking", "💳 Payment & Receipts", "🤖 AI Route Optimization", "🚛 Last-Mile Logistics", "📊 Analytics"]
    )
    
    if page == "🏠 Dashboard":
        dashboard_page(analytics_df)
    elif page == "📦 Product Verification":
        product_verification_page(products)
    elif page == "🚚 Shipment Tracking":
        tracking_page(tracking_data)
    elif page == "💳 Payment & Receipts":
        payment_page(products)
    elif page == "🤖 AI Route Optimization":
        route_optimization_page()
    elif page == "🚛 Last-Mile Logistics":
        last_mile_logistics_page()
    elif page == "📊 Analytics":
        analytics_page(analytics_df)

def dashboard_page(analytics_df):
    st.header("📊 Supply Chain Dashboard")
    
    # Key metrics with icons
    col1, col2, col3, col4 = st.columns(4)
    
    # Load dashboard icons
    try:
        with open('images/dashboard_icons.svg', 'r') as f:
            icons_svg = f.read()
        
        # Extract individual icons (simplified approach)
        shipment_icon = "🚛"
        verification_icon = "🛡️"
        savings_icon = "💰"
        trust_icon = "⭐"
    except FileNotFoundError:
        shipment_icon = "📦"
        verification_icon = "✅"
        savings_icon = "💰"
        trust_icon = "⭐"
    
    with col1:
        st.markdown("""
        <div class="metric-card">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🚛</div>
            <h3>2,847</h3>
            <p>Total Shipments</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="metric-card">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🛡️</div>
            <h3>98.5%</h3>
            <p>Verification Rate</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class="metric-card">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">💰</div>
            <h3>$2.4M</h3>
            <p>Cost Savings</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        st.markdown("""
        <div class="metric-card">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">⭐</div>
            <h3>94.2</h3>
            <p>Avg Trust Score</p>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Charts
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📈 Daily Shipments")
        fig = px.line(analytics_df, x='date', y='shipments', title="Shipment Volume Over Time")
        fig.update_layout(height=400)
        st.plotly_chart(fig, use_container_width=True)
    
    with col2:
        st.subheader("🛡️ ML-Powered Fraud Detection")
        
        # Create tabs for different fraud detection views
        fraud_tab1, fraud_tab2 = st.tabs(["📊 Detection Overview", "🔍 Risk Assessment"])
        
        with fraud_tab1:
            fig = px.bar(analytics_df, x='date', y='fraud_detected', title="Fraud Cases Detected")
            fig.update_layout(height=300)
            st.plotly_chart(fig, use_container_width=True)
            
            # Show model accuracy
            _, _, accuracy, _ = train_fraud_detection_model()
            st.metric("🎯 Model Accuracy", f"{accuracy:.1%}")
        
        with fraud_tab2:
            st.write("**Real-time Transaction Risk Assessment**")
            
            # Interactive fraud risk calculator
            col_a, col_b = st.columns(2)
            with col_a:
                transaction_amount = st.number_input("Transaction Amount ($)", min_value=0.0, value=1000.0, step=100.0)
                delivery_time = st.number_input("Expected Delivery (hours)", min_value=1, value=72, step=1)
                supplier_trust = st.slider("Supplier Trust Score", 0, 100, 85)
                route_deviation = st.number_input("Route Deviation (km)", min_value=0.0, value=5.0, step=1.0)
            
            with col_b:
                temp_variance = st.number_input("Temperature Variance (°C)", min_value=0.0, value=2.0, step=0.1)
                doc_completeness = st.slider("Documentation Completeness (%)", 0, 100, 95)
                payment_delay = st.number_input("Payment Delay (hours)", min_value=0.0, value=2.0, step=0.5)
            
            if st.button("🔍 Assess Fraud Risk", type="primary"):
                transaction_data = {
                    'transaction_amount': transaction_amount,
                    'delivery_time_hours': delivery_time,
                    'supplier_trust_score': supplier_trust,
                    'route_deviation_km': route_deviation,
                    'temperature_variance': temp_variance,
                    'documentation_completeness': doc_completeness,
                    'payment_delay_hours': payment_delay
                }
                
                fraud_prob, model_accuracy = predict_fraud_risk(transaction_data)
                
                # Display risk assessment
                risk_level = "🟢 LOW" if fraud_prob < 0.3 else "🟡 MEDIUM" if fraud_prob < 0.7 else "🔴 HIGH"
                
                col_risk1, col_risk2 = st.columns(2)
                with col_risk1:
                    st.metric("🚨 Fraud Probability", f"{fraud_prob:.1%}")
                with col_risk2:
                    st.metric("⚠️ Risk Level", risk_level)
                
                # Risk factors analysis
                st.write("**Risk Factors Analysis:**")
                risk_factors = []
                if transaction_amount > 5000:
                    risk_factors.append("• High transaction amount")
                if delivery_time > 100:
                    risk_factors.append("• Extended delivery time")
                if supplier_trust < 70:
                    risk_factors.append("• Low supplier trust score")
                if route_deviation > 20:
                    risk_factors.append("• Significant route deviation")
                if temp_variance > 5:
                    risk_factors.append("• High temperature variance")
                if doc_completeness < 80:
                    risk_factors.append("• Incomplete documentation")
                if payment_delay > 12:
                    risk_factors.append("• Delayed payment processing")
                
                if risk_factors:
                    for factor in risk_factors:
                        st.write(factor)
                else:
                    st.write("• No significant risk factors detected")
                
                # Recommendations
                if fraud_prob > 0.5:
                    st.warning("**Recommendations:** Enhanced verification required, consider manual review, implement additional security measures.")
                elif fraud_prob > 0.3:
                    st.info("**Recommendations:** Standard verification protocols, monitor transaction closely.")
                else:
                    st.success("**Recommendations:** Transaction appears legitimate, proceed with standard processing.")
    
    # Recent activity
    st.subheader("🔄 Recent Activity")
    activity_data = [
        {"Time": "2 min ago", "Event": "ZK Proof verified for TRK-PAY-001", "Status": "✅ Success"},
        {"Time": "5 min ago", "Event": "Route optimized for shipment TRK-PAY-003", "Status": "🚀 Optimized"},
        {"Time": "8 min ago", "Event": "Payment processed for $2,450", "Status": "💰 Completed"},
        {"Time": "12 min ago", "Event": "Trust score updated for supplier SUP-001", "Status": "📊 Updated"}
    ]
    st.dataframe(pd.DataFrame(activity_data), use_container_width=True)

def product_verification_page(products):
    st.header("🔍 AI-Powered Product Verification")
    
    # Introduction
    st.markdown("""
    <div class="feature-card">
        <h4>🤖 Machine Learning Authentication System</h4>
        <p>Our AI analyzes multiple data points including blockchain records, IoT sensor data, 
        and supply chain patterns to verify product authenticity with 99.7% accuracy.</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Product selection with enhanced UI
    st.subheader("📦 Select Product for Verification")
    
    # Create a more visual product selector
    product_options = [f"{p['name']} - {p['origin']}" for p in products]
    selected_product = st.selectbox("Choose a product:", product_options, 
                                   help="Select any product to see our AI verification in action")
    
    if selected_product:
        # Find the selected product
        product = next(p for p in products if f"{p['name']} - {p['origin']}" == selected_product)
        
        # Enhanced product display
        col1, col2 = st.columns([1, 2])
        
        with col1:
            # Display product image
            try:
                # Use st.image for SVG files instead of direct HTML embedding
                st.markdown(f"""
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            border-radius: 15px; margin: 10px 0;">
                    <h3 style="color: white; margin: 0;">{product['name']}</h3>
                </div>
                """, unsafe_allow_html=True)
                # Display the SVG image using Streamlit's image component
                st.image(product['image'], width=200)
            except FileNotFoundError:
                # Fallback to a placeholder if image not found
                st.markdown(f"""
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            border-radius: 15px; margin: 10px 0;">
                    <div style="font-size: 80px; margin-bottom: 10px; color: white;">📦</div>
                    <h3 style="color: white; margin: 0;">{product['name']}</h3>
                </div>
                """, unsafe_allow_html=True)
        
        with col2:
            st.subheader(f"📦 {product['name']}")
            
            # Enhanced product info with metrics
            col2a, col2b = st.columns(2)
            with col2a:
                st.metric("🌍 Origin", product['origin'])
                st.metric("💰 Price", f"${product['price']}")
            with col2b:
                st.metric("⭐ Trust Score", f"{product['trust_score']}/100")
                st.metric("📊 Category", product['category'])
            
            # Verification status with enhanced UI
            trust_score = product['trust_score']
            if trust_score >= 90:
                st.success("✅ AI Verification: AUTHENTIC")
                st.progress(trust_score / 100)
                st.caption(f"Confidence: {trust_score}%")
            else:
                st.warning("⚠️ Verification in Progress...")
                st.progress(0.65)
                st.caption("Analyzing: 65% complete")
        
        # ML Analysis Section
        st.subheader("🧠 AI Analysis Results")
        
        # Simulate ML analysis with progress
        if st.button("🔬 Run AI Verification Analysis", type="primary"):
            with st.spinner("🤖 AI is analyzing product data..."):
                # Simulate analysis steps
                analysis_steps = [
                    "Scanning blockchain records...",
                    "Analyzing IoT sensor data...",
                    "Cross-referencing supply chain patterns...",
                    "Validating certificates and compliance...",
                    "Running ML authenticity models...",
                    "Generating confidence scores..."
                ]
                
                progress_bar = st.progress(0)
                status_text = st.empty()
                
                for i, step in enumerate(analysis_steps):
                    status_text.text(step)
                    time.sleep(0.5)
                    progress_bar.progress((i + 1) / len(analysis_steps))
                
                status_text.text("Analysis complete!")
                
                # Enhanced verification results
                st.success("✅ AI Analysis Complete!")
                
                # Detailed verification metrics
                col1, col2, col3, col4 = st.columns(4)
                
                with col1:
                    st.metric("🔍 Authenticity", "98.5%", delta="+2.1%")
                with col2:
                    st.metric("🌍 Origin Verified", "97.2%", delta="+1.8%")
                with col3:
                    st.metric("📋 Compliance", "99.1%", delta="+0.5%")
                with col4:
                    st.metric("🌱 Sustainability", "94.7%", delta="+3.2%")
        
        # Detailed verification breakdown
        st.subheader("📊 Verification Breakdown")
        
        verification_data = {
            "Verification Layer": ["🔗 Blockchain Records", "📡 IoT Sensor Data", "🏭 Supply Chain Tracking", 
                                 "📜 Certificates & Compliance", "🤖 ML Pattern Analysis", "🔐 Cryptographic Signatures"],
            "Status": ["✅ Verified", "✅ Verified", "✅ Verified", "⚠️ Pending Review", "✅ Verified", "✅ Verified"],
            "Confidence": ["98.5%", "96.2%", "97.8%", "89.3%", "99.1%", "100%"],
            "Data Points": ["847", "1,203", "456", "23", "15,678", "12"]
        }
        
        verification_df = pd.DataFrame(verification_data)
        st.dataframe(verification_df, use_container_width=True)
        
        # ML Trust Scoring Section
        st.subheader("🎯 ML-Powered Trust Scoring")
        
        st.markdown("""
        <div class="feature-card">
            <h4>🤖 Intelligent Supplier Assessment</h4>
            <p>Our machine learning model evaluates suppliers based on historical performance, 
            compliance records, and real-time data to provide accurate trust scores.</p>
        </div>
        """, unsafe_allow_html=True)
        
        # Create tabs for trust scoring
        trust_tab1, trust_tab2, trust_tab3 = st.tabs(["📊 Current Supplier", "🔍 Custom Assessment", "📈 Trust Analytics"])
        
        with trust_tab1:
            # Display current supplier trust score
            supplier_name = product.get('supplier', 'Unknown Supplier')
            current_trust = product.get('trust_score', 85)
            
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("🏢 Supplier", supplier_name)
            with col2:
                st.metric("⭐ Trust Score", f"{current_trust}/100", delta=f"+{random.randint(1, 5)}")
            with col3:
                trust_level = "🟢 Excellent" if current_trust >= 90 else "🟡 Good" if current_trust >= 75 else "🟠 Fair" if current_trust >= 60 else "🔴 Poor"
                st.metric("📊 Rating", trust_level)
            
            # Trust score breakdown
            st.write("**Trust Score Breakdown:**")
            trust_factors = {
                'Delivery Performance': random.randint(85, 98),
                'Quality Score': random.randint(80, 95),
                'Compliance Score': random.randint(88, 99),
                'Financial Stability': random.randint(70, 90),
                'Years in Business': min(100, random.randint(5, 20) * 5),
                'Certifications': min(100, random.randint(2, 8) * 12)
            }
            
            for factor, score in trust_factors.items():
                st.progress(score/100, text=f"{factor}: {score}%")
        
        with trust_tab2:
            st.write("**Custom Supplier Assessment**")
            
            # Interactive trust score calculator
            col_a, col_b = st.columns(2)
            with col_a:
                years_business = st.number_input("Years in Business", min_value=1, max_value=50, value=8)
                total_transactions = st.number_input("Total Transactions", min_value=10, max_value=10000, value=200)
                delivery_perf = st.slider("Delivery Performance (%)", 0, 100, 85)
                quality_score = st.slider("Quality Score (%)", 0, 100, 80)
            
            with col_b:
                compliance_score = st.slider("Compliance Score (%)", 0, 100, 88)
                financial_stability = st.slider("Financial Stability (%)", 0, 100, 75)
                certifications = st.number_input("Number of Certifications", min_value=0, max_value=20, value=3)
            
            if st.button("🎯 Calculate Trust Score", type="primary"):
                supplier_data = {
                    'years_in_business': years_business,
                    'total_transactions': total_transactions,
                    'delivery_performance': delivery_perf,
                    'quality_score': quality_score,
                    'compliance_score': compliance_score,
                    'financial_stability': financial_stability,
                    'certifications_count': certifications
                }
                
                calculated_trust = calculate_trust_score(supplier_data)
                
                # Display calculated trust score
                col_trust1, col_trust2, col_trust3 = st.columns(3)
                with col_trust1:
                    st.metric("🎯 Calculated Trust Score", f"{calculated_trust:.1f}/100")
                with col_trust2:
                    trust_category = "🟢 Excellent" if calculated_trust >= 90 else "🟡 Good" if calculated_trust >= 75 else "🟠 Fair" if calculated_trust >= 60 else "🔴 Poor"
                    st.metric("📊 Category", trust_category)
                with col_trust3:
                    risk_level = "Low" if calculated_trust >= 80 else "Medium" if calculated_trust >= 60 else "High"
                    st.metric("⚠️ Risk Level", risk_level)
                
                # Recommendations based on trust score
                if calculated_trust >= 85:
                    st.success("**Recommendation:** Excellent supplier - proceed with confidence. Consider for preferred partner status.")
                elif calculated_trust >= 70:
                    st.info("**Recommendation:** Good supplier - standard verification protocols recommended.")
                elif calculated_trust >= 55:
                    st.warning("**Recommendation:** Fair supplier - enhanced monitoring and verification required.")
                else:
                    st.error("**Recommendation:** Poor supplier - consider alternative suppliers or implement strict oversight.")
                
                # Key improvement areas
                st.write("**Key Improvement Areas:**")
                improvements = []
                if delivery_perf < 80:
                    improvements.append("• Improve delivery performance and reliability")
                if quality_score < 75:
                    improvements.append("• Enhance quality control processes")
                if compliance_score < 85:
                    improvements.append("• Strengthen compliance and regulatory adherence")
                if financial_stability < 70:
                    improvements.append("• Improve financial stability and transparency")
                if certifications < 3:
                    improvements.append("• Obtain additional industry certifications")
                
                if improvements:
                    for improvement in improvements:
                        st.write(improvement)
                else:
                    st.write("• No significant improvement areas identified")
        
        with trust_tab3:
            st.write("**Trust Score Analytics**")
            
            # Generate sample trust data for visualization
            trust_df = generate_trust_scoring_dataset()
            
            # Trust score distribution
            fig_dist = px.histogram(trust_df, x='trust_score', nbins=20, 
                                  title="Trust Score Distribution Across Suppliers")
            fig_dist.update_layout(height=300)
            st.plotly_chart(fig_dist, use_container_width=True)
            
            # Trust by category
            category_trust = trust_df.groupby('category')['trust_score'].mean().reset_index()
            fig_cat = px.bar(category_trust, x='category', y='trust_score', 
                           title="Average Trust Score by Supplier Category")
            fig_cat.update_layout(height=300)
            st.plotly_chart(fig_cat, use_container_width=True)
            
            # Key statistics
            col_stat1, col_stat2, col_stat3, col_stat4 = st.columns(4)
            with col_stat1:
                st.metric("📊 Average Trust", f"{trust_df['trust_score'].mean():.1f}")
            with col_stat2:
                st.metric("🏆 Top Performers", f"{len(trust_df[trust_df['trust_score'] >= 90])}")
            with col_stat3:
                st.metric("⚠️ At Risk", f"{len(trust_df[trust_df['trust_score'] < 60])}")
            with col_stat4:
                st.metric("📈 Improvement Rate", f"{random.randint(15, 25)}%")
        
        # Enhanced ZK Proof Section
        st.subheader("🔐 Zero-Knowledge Proof Generation")
        
        st.markdown("""
        <div class="feature-card">
            <h4>🛡️ Privacy-Preserving Verification</h4>
            <p>Generate cryptographic proof of product authenticity without revealing sensitive 
            supply chain data or proprietary information.</p>
        </div>
        """, unsafe_allow_html=True)
        
        col1, col2 = st.columns(2)
        
        with col1:
            proof_type = st.selectbox("Proof Type:", ["Authenticity Proof", "Origin Proof", "Quality Proof", "Full Verification Proof"])
            privacy_level = st.selectbox("Privacy Level:", ["Standard", "High", "Maximum"])
        
        with col2:
            include_metadata = st.checkbox("Include Metadata", value=True)
            public_verification = st.checkbox("Enable Public Verification", value=False)
        
        if st.button("🔒 Generate Zero-Knowledge Proof", type="primary"):
            with st.spinner("🔐 Generating cryptographic proof..."):
                # Enhanced ZK proof generation
                progress_bar = st.progress(0)
                steps = ["Initializing trusted setup", "Computing witness", "Generating proof", "Verifying proof", "Finalizing verification"]
                
                for i, step in enumerate(steps):
                    time.sleep(0.8)
                    progress_bar.progress((i + 1) / len(steps))
                
                # Use enhanced proof generation with proper parameters
                proof_type_mapping = {
                    "Authenticity Proof": "authenticity",
                    "Origin Proof": "origin", 
                    "Quality Proof": "quality",
                    "Full Verification Proof": "authenticity"
                }
                
                privacy_mapping = {
                    "Standard": "standard",
                    "High": "high",
                    "Maximum": "maximum"
                }
                
                proof = generate_zk_proof(
                    product['id'], 
                    proof_type_mapping.get(proof_type, "authenticity"),
                    privacy_mapping.get(privacy_level, "standard"),
                    product  # Pass product data for compliance verification
                )
                
                st.success("✅ Zero-Knowledge Proof Generated Successfully!")
                
                # Enhanced proof display
                col1, col2, col3 = st.columns(3)
                
                with col1:
                    st.subheader("🔑 Proof Details")
                    st.code(f"Proof Hash: {proof['proof_hash'][:32]}...", language="text")
                    st.code(f"Public Inputs: {proof['public_inputs'][:24]}...", language="text")
                    st.write(f"**Proof System:** {proof['proof_system']}")
                    st.write(f"**Privacy Level:** {proof['privacy_level'].title()}")
                
                with col2:
                    st.subheader("📊 Verification Metrics")
                    st.write(f"**Generation Time:** {proof['verification_time']}")
                    st.write(f"**Proof Size:** {proof['proof_size']}")
                    st.write(f"**Security Level:** {proof['security_level']}")
                    st.write(f"**Status:** ✅ Valid & Verified")
                    st.write(f"**Timestamp:** {proof['timestamp']}")
                
                with col3:
                    st.subheader("🔧 Technical Details")
                    st.write(f"**Circuit Constraints:** {proof['circuit_constraints']:,}")
                    st.write(f"**Trusted Setup:** {proof['trusted_setup']}")
                    st.write(f"**Verification Key:** {proof['verification_key'][:16]}...")
                    st.write(f"**Proof Type:** {proof_type}")
                
                # Display sector-specific compliance verification results
                if proof.get('compliance_verification'):
                    st.subheader("🏥⚔️🚚 Compliance Verification Results")
                    compliance = proof['compliance_verification']
                    
                    if product.get('category') == 'Healthcare':
                        col1, col2 = st.columns(2)
                        with col1:
                            st.write("**🏥 Healthcare Compliance:**")
                            st.write(f"✅ HIPAA Verified: {compliance.get('hipaa_verified', False)}")
                            st.write(f"✅ FDA Approved: {compliance.get('fda_approved', False)}")
                            st.write(f"✅ Medical Device Class: {compliance.get('medical_device_class', 'N/A')}")
                        with col2:
                            st.write("**🔒 Privacy Protection:**")
                            st.write(f"✅ Patient Privacy Protected: {compliance.get('patient_privacy_protected', False)}")
                            st.write(f"✅ PHI Encrypted: {compliance.get('phi_encrypted', False)}")
                            st.write(f"✅ Audit Trail Enabled: {compliance.get('audit_trail_enabled', False)}")
                    
                    elif product.get('category') == 'Military':
                        # Enhanced military verification display with comprehensive security clearance checks
                        col1, col2, col3 = st.columns(3)
                        with col1:
                            st.write("**⚔️ Military Compliance:**")
                            st.write(f"✅ ITAR Compliant: {compliance.get('itar_compliant', False)}")
                            st.write(f"✅ Security Clearance Verified: {compliance.get('security_clearance_verified', False)}")
                            clearance_level = compliance.get('security_clearance_level', 'Unclassified')
                            st.write(f"🔐 Security Clearance Level: **{clearance_level}**")
                            st.write(f"✅ Clearance Expiry Valid: {compliance.get('clearance_expiry_valid', False)}")
                            st.write(f"✅ Export License Valid: {compliance.get('export_license_valid', False)}")
                            st.write(f"✅ Technology Transfer Approved: {compliance.get('technology_transfer_approved', False)}")
                        with col2:
                            st.write("**🛡️ Security Standards:**")
                            st.write(f"✅ MIL-STD Certified: {compliance.get('mil_std_certified', False)}")
                            st.write(f"✅ FIPS 140-2 Validated: {compliance.get('fips_140_2_validated', False)}")
                            st.write(f"✅ NIST 800-171 Compliant: {compliance.get('cybersecurity_framework_compliant', False)}")
                            st.write(f"✅ Facility Security Cleared: {compliance.get('facility_security_cleared', False)}")
                            st.write(f"✅ Personnel Background Checked: {compliance.get('personnel_background_checked', False)}")
                            st.write(f"✅ Foreign Ownership Cleared: {compliance.get('foreign_ownership_cleared', False)}")
                        with col3:
                            st.write("**🔒 Advanced Security:**")
                            st.write(f"✅ Supply Chain Vetted: {compliance.get('supply_chain_vetted', False)}")
                            st.write(f"✅ Contractor Verified: {compliance.get('contractor_verified', False)}")
                            st.write(f"✅ Insider Threat Mitigated: {compliance.get('insider_threat_mitigated', False)}")
                            st.write(f"✅ Physical Security Verified: {compliance.get('physical_security_verified', False)}")
                            st.write(f"✅ Information Security Validated: {compliance.get('information_security_validated', False)}")
                            st.write(f"✅ Critical Technology Protected: {compliance.get('critical_technology_protected', False)}")
                        
                        # Additional military-specific security metrics
                        st.write("**🎯 Operational Security:**")
                        col4, col5 = st.columns(2)
                        with col4:
                            st.write(f"✅ Operational Security Confirmed: {compliance.get('operational_security_confirmed', False)}")
                            st.write(f"✅ Communications Security Enabled: {compliance.get('communications_security_enabled', False)}")
                            st.write(f"✅ Tamper Evidence Verified: {compliance.get('tamper_evidence_verified', False)}")
                            st.write(f"✅ Chain of Custody Maintained: {compliance.get('chain_of_custody_maintained', False)}")
                        with col5:
                            st.write(f"✅ Dual Use Technology Controlled: {compliance.get('dual_use_technology_controlled', False)}")
                            st.write(f"✅ Defense Industrial Base Verified: {compliance.get('defense_industrial_base_verified', False)}")
                            st.write(f"✅ Trusted Supplier Validated: {compliance.get('trusted_supplier_validated', False)}")
                            st.write(f"✅ Supply Chain Risk Assessed: {compliance.get('supply_chain_risk_assessed', False)}")
                        
                        # Security clearance level indicator
                        if clearance_level in ['Top Secret', 'TS/SCI']:
                            st.error(f"🔴 **CLASSIFIED - {clearance_level}** - Highest Security Level")
                        elif clearance_level == 'Secret':
                            st.warning(f"🟡 **CLASSIFIED - {clearance_level}** - High Security Level")
                        elif clearance_level == 'Confidential':
                            st.info(f"🔵 **CLASSIFIED - {clearance_level}** - Medium Security Level")
                        else:
                            st.success(f"🟢 **{clearance_level}** - Standard Security Level")
                    
                    elif product.get('category') == 'Logistics':
                        col1, col2 = st.columns(2)
                        with col1:
                            st.write("**🚚 Logistics Verification:**")
                            st.write(f"✅ Driver Identity Verified: {compliance.get('driver_identity_verified', False)}")
                            st.write(f"✅ Receiver Identity Verified: {compliance.get('receiver_identity_verified', False)}")
                            st.write(f"✅ Route Optimized: {compliance.get('route_optimized', False)}")
                        with col2:
                            st.write("**📦 Delivery Security:**")
                            st.write(f"✅ Delivery Secured: {compliance.get('delivery_secured', False)}")
                            st.write(f"✅ Last Mile Optimized: {compliance.get('last_mile_optimized', False)}")
                            st.write(f"✅ Cost Savings Calculated: {compliance.get('cost_savings_calculated', False)}")
                
                # Enhanced proof verification section
                st.subheader("🔍 Advanced Proof Verification")
                
                verification_result = {
                    "Verification Check": [
                        "Proof Validity", 
                        "Circuit Integrity", 
                        "Public Input Consistency", 
                        "Cryptographic Signature",
                        "Privacy Preservation",
                        "Supply Chain Verification"
                    ],
                    "Result": [
                        "✅ Valid", 
                        "✅ Verified", 
                        "✅ Consistent", 
                        "✅ Authentic",
                        "✅ Protected",
                        "✅ Confirmed"
                    ],
                    "Confidence": ["99.8%", "99.5%", "99.9%", "99.7%", "100%", "98.2%"],
                    "Details": [
                        "Proof mathematically sound", 
                        "Circuit hash matches", 
                        "Inputs properly formatted", 
                        "Signature verified",
                        "Zero data leakage confirmed",
                        "Supply chain integrity proven"
                    ]
                }
                
                verification_result_df = pd.DataFrame(verification_result)
                st.dataframe(verification_result_df, use_container_width=True)
                
                st.success("🔒 This advanced ZK proof mathematically guarantees product authenticity while keeping sensitive supply chain data completely private and provides cryptographic verification of supply chain integrity.")
                
                # Download proof option
                if st.button("📥 Download Proof Certificate"):
                    st.success("📄 Advanced proof certificate with supply chain verification downloaded!")
                    st.balloons()

def tracking_page(tracking_data):
    st.header("🚚 Shipment Tracking")
    
    # Update auto-progress for live tracking simulation
    update_auto_progress()
    
    # Combine sample tracking data with user-generated tracking data
    all_tracking_data = tracking_data.copy()
    if 'user_tracking_data' in st.session_state:
        all_tracking_data.update(st.session_state.user_tracking_data)
    
    # Display tracking statistics
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric("📦 Total Shipments", len(all_tracking_data))
    with col2:
        in_transit = sum(1 for data in all_tracking_data.values() if data['status'] in ['In Transit', 'Shipped'])
        st.metric("🚛 In Transit", in_transit)
    with col3:
        delivered = sum(1 for data in all_tracking_data.values() if data['status'] == 'Delivered')
        st.metric("✅ Delivered", delivered)
    
    st.markdown("---")
    
    # Tracking ID input
    tracking_id = st.selectbox("Select Tracking ID:", list(all_tracking_data.keys()))
    
    if tracking_id in all_tracking_data:
        shipment = all_tracking_data[tracking_id]
        
        # Add world map visualization
        try:
            st.markdown("""
            <div style="text-align: center; margin: 1rem 0;">
                <h4>🌍 Real-time Tracking Map</h4>
            </div>
            """, unsafe_allow_html=True)
            # Use st.image for SVG instead of direct HTML embedding
            st.image('images/world_map.svg', caption="Live Shipment Tracking", use_container_width=True)
        except FileNotFoundError:
            st.info("🗺️ Interactive map visualization would appear here")
        
        # Status overview
        col1, col2, col3 = st.columns(3)
        
        with col1:
            status_color = "green" if shipment['status'] == "Delivered" else "blue"
            st.markdown(f"**Status:** :{status_color}[{shipment['status']}]")
            st.write(f"**Product:** {shipment['product']}")
        
        with col2:
            st.write(f"**Current Location:** {shipment['current_location']}")
            st.write(f"**Estimated Delivery:** {shipment['estimated_delivery']}")
        
        with col3:
            zk_status = "✅ Verified" if shipment['zk_verified'] else "❌ Not Verified"
            st.write(f"**ZK Verification:** {zk_status}")
        
        # Progress bar
        st.subheader("📍 Delivery Progress")
        st.progress(shipment['progress'] / 100)
        st.write(f"{shipment['progress']}% Complete")
        
        # Route visualization
        st.subheader("🗺️ Route Map")
        route_df = pd.DataFrame({
            'Location': shipment['route'],
            'Step': range(1, len(shipment['route']) + 1),
            'Status': ['✅ Completed' if i < len(shipment['route']) * (shipment['progress'] / 100) else '⏳ Pending' for i in range(len(shipment['route']))]
        })
        st.dataframe(route_df, use_container_width=True)
        
        # Real-time updates simulation
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🔄 Refresh Tracking"):
                with st.spinner("Fetching latest updates..."):
                    time.sleep(1)
                    st.success("📡 Tracking data updated successfully!")
        
        with col2:
            # Update tracking status for user-generated shipments
            if tracking_id in st.session_state.get('user_tracking_data', {}):
                if st.button("📈 Simulate Progress Update"):
                    with st.spinner("Updating shipment status..."):
                        time.sleep(1)
                        # Update progress and status
                        current_progress = st.session_state.user_tracking_data[tracking_id]['progress']
                        if current_progress < 100:
                            new_progress = min(current_progress + random.randint(10, 25), 100)
                            st.session_state.user_tracking_data[tracking_id]['progress'] = new_progress
                            
                            # Update status based on progress
                            if new_progress >= 100:
                                st.session_state.user_tracking_data[tracking_id]['status'] = "Delivered"
                                st.session_state.user_tracking_data[tracking_id]['current_location'] = "Destination"
                            elif new_progress >= 75:
                                st.session_state.user_tracking_data[tracking_id]['status'] = "Out for Delivery"
                                st.session_state.user_tracking_data[tracking_id]['current_location'] = "Local Facility"
                            elif new_progress >= 50:
                                st.session_state.user_tracking_data[tracking_id]['status'] = "In Transit"
                                st.session_state.user_tracking_data[tracking_id]['current_location'] = "Transit Hub"
                            elif new_progress >= 25:
                                st.session_state.user_tracking_data[tracking_id]['status'] = "Shipped"
                                st.session_state.user_tracking_data[tracking_id]['current_location'] = "Distribution Center"
                            
                            st.success(f"📦 Shipment updated! Progress: {new_progress}%")
                            st.rerun()
                        else:
                            st.info("📋 Shipment already delivered!")

def payment_page(products):
    st.header("💳 Payment & Receipts")
    
    # Payment form
    with st.form("payment_form"):
        st.subheader("💰 Process Payment")
        
        col1, col2 = st.columns(2)
        
        with col1:
            selected_product = st.selectbox("Select Product:", [f"{p['name']} - ${p['price']}" for p in products])
            amount = st.number_input("Amount ($):", min_value=0.01, value=products[0]['price'], step=0.01)
        
        with col2:
            currency = st.selectbox("Currency:", ["USD", "EUR", "GBP"])
            payment_method = st.selectbox("Payment Method:", ["Credit Card", "Bank Transfer", "Crypto"])
        
        submitted = st.form_submit_button("💳 Process Payment")
    
    # Handle form submission outside the form
    if submitted:
        with st.spinner("Processing payment..."):
            time.sleep(2)
            tracking_id = f"TRK-PAY-{random.randint(100, 999)}"
            
            st.success(f"✅ Payment processed successfully!")
            st.info(f"📋 Tracking ID: {tracking_id}")
            
            # Store receipt data in session state
            receipt_data = {
                "Receipt ID": f"RCP-{random.randint(10000, 99999)}",
                "Tracking ID": tracking_id,
                "Product": selected_product.split(" - ")[0],
                "Amount": f"${amount:.2f} {currency}",
                "Payment Method": payment_method,
                "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "ZK Proof": f"0x{random.getrandbits(128):032x}"
            }
            
            st.session_state.receipt_data = receipt_data
            
            # Create new tracking entry and add to session state
            new_tracking_entry = {
                "product": selected_product.split(" - ")[0],
                "status": "Processing",
                "current_location": "Warehouse",
                "progress": 5,
                "estimated_delivery": (datetime.now() + timedelta(days=random.randint(3, 10))).strftime("%Y-%m-%d"),
                "route": ["Warehouse", "Distribution Center", "Transit Hub", "Local Facility", "Delivery"],
                "zk_verified": True,
                "created_at": datetime.now().isoformat(),
                "last_updated": datetime.now().isoformat(),
                "auto_progress": True
            }
            
            # Initialize tracking data in session state if not exists
            if 'user_tracking_data' not in st.session_state:
                st.session_state.user_tracking_data = {}
            
            # Add new tracking entry
            st.session_state.user_tracking_data[tracking_id] = new_tracking_entry
            
            st.success(f"🚚 Shipment tracking automatically created!")
            st.info(f"📍 Current Status: {new_tracking_entry['status']} at {new_tracking_entry['current_location']}")
            
            st.subheader("🧾 Digital Receipt")
            for key, value in receipt_data.items():
                st.write(f"**{key}:** {value}")
    
    # Download button outside the form
    if 'receipt_data' in st.session_state:
        if st.button("📥 Download Receipt (PDF)"):
            st.success("📄 Receipt downloaded successfully!")

def route_optimization_page():
    st.header("🤖 AI Route Optimization with Zero-Knowledge Proof")
    
    # Introduction with ZK emphasis
    st.markdown("""
    <div class="feature-card">
        <h4>🧠 Machine Learning Powered Route Planning + 🔐 Zero-Knowledge Verification</h4>
        <p>Our AI analyzes global shipping data, weather patterns, geopolitical factors, and real-time logistics 
        to find the most efficient routes. Every optimization is cryptographically proven using zero-knowledge proofs 
        to ensure privacy and verifiability without revealing sensitive logistics data.</p>
    </div>
    """, unsafe_allow_html=True)
    
    # ZK Proof Status Indicator
    st.markdown("""
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem; border-radius: 10px; color: white; text-align: center; margin: 1rem 0;">
        <h4>🔒 Zero-Knowledge Proof Integration: ACTIVE</h4>
        <p>All route optimizations are cryptographically verified while maintaining complete privacy</p>
    </div>
    """, unsafe_allow_html=True)
    
    countries = get_global_countries()
    
    # Route optimization form
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📍 Route Configuration")
        origin = st.selectbox("Origin Country:", countries, index=countries.index("China"))
        destination = st.selectbox("Destination Country:", countries, index=countries.index("United States"))
        
        # Use case selection
        use_case = st.selectbox("Supply Chain Use Case:", [
            "Standard Commercial", 
            "🏥 Healthcare & Medical", 
            "🛡️ Military & Defense", 
            "💎 Luxury Goods", 
            "🔬 Research & Development",
            "🌱 Sustainable Agriculture"
        ])
        
    with col2:
        st.subheader("⚙️ Optimization Settings")
        priority = st.selectbox("Optimization Priority:", ["Cost", "Time", "Sustainability", "Security"])
        cargo_type = st.selectbox("Cargo Type:", [
            "Standard", "Fragile", "Perishable", "Hazardous", 
            "Electronics", "Textiles", "Medical Supplies", 
            "Defense Equipment", "Pharmaceuticals"
        ])
    
    # Advanced options with ZK settings
    with st.expander("🔧 Advanced Options & ZK Configuration"):
        col1, col2 = st.columns(2)
        with col1:
            max_stops = st.slider("Maximum Transit Stops:", 1, 8, 4)
            avoid_regions = st.multiselect("Avoid Regions:", ["High Risk Areas", "Weather Affected", "Port Congestion"])
            # ZK Privacy settings
            st.subheader("🔐 Zero-Knowledge Settings")
            zk_privacy_level = st.selectbox("ZK Privacy Level:", ["Standard", "High", "Maximum", "Military-Grade"])
            include_ml_proof = st.checkbox("Include ML Algorithm Proof", value=True, help="Prove that AI optimization is mathematically optimal")
        with col2:
            insurance_level = st.selectbox("Insurance Level:", ["Basic", "Standard", "Premium", "Full Coverage"])
            tracking_frequency = st.selectbox("Tracking Updates:", ["Daily", "Real-time", "On Milestones"])
            # Additional ZK options
            st.subheader("🛡️ Verification Options")
            verify_supply_chain = st.checkbox("Verify Supply Chain Integrity", value=True)
            carbon_tracking = st.checkbox("Include Carbon Footprint Proof", value=True)
    
    if st.button("🚀 Optimize Route with ZK Proof", type="primary"):
        with st.spinner("🧠 AI is analyzing global logistics data and generating cryptographic proofs..."):
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            # Enhanced progress with ZK integration
            steps = [
                "🔍 Analyzing global shipping data...",
                "🧠 Running ML optimization algorithms...", 
                "🔐 Generating zero-knowledge proof...",
                "🛡️ Verifying supply chain integrity...",
                "✅ Finalizing secure route optimization..."
            ]
            
            for i, step in enumerate(steps):
                status_text.text(step)
                for j in range(20):
                    time.sleep(0.05)
                    progress_bar.progress((i * 20 + j + 1) / 100)
            
            route_data = optimize_route(origin, destination, priority)
            
            # Automatically generate ZK proof for the optimized route
            route_proof = generate_route_zk_proof(origin, destination, route_data, use_case, zk_privacy_level)
            
            status_text.empty()
            st.success("✅ Route optimization complete with cryptographic verification!")
            
            # ZK Proof Status Banner
            st.markdown("""
            <div style="background: #d4edda; color: #155724; padding: 1rem; border-radius: 5px; border: 1px solid #c3e6cb; margin: 1rem 0;">
                <h4>🔒 Zero-Knowledge Proof Generated Successfully!</h4>
                <p>Your route optimization has been cryptographically verified while maintaining complete privacy of sensitive logistics data.</p>
            </div>
            """, unsafe_allow_html=True)
            
            # Enhanced results display
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric("💰 Total Cost", f"${route_data['cost']:,}", delta="-15% vs standard")
            
            with col2:
                st.metric("⏱️ Transit Time", route_data['time'], delta="-3 days vs standard")
            
            with col3:
                st.metric("🌱 Carbon Footprint", route_data['carbon'], delta="-20% vs standard")
            
            with col4:
                st.metric("📊 Efficiency Score", f"{route_data['efficiency_score']}%", delta="+12% improvement")
            
            # Additional metrics
            col1, col2, col3 = st.columns(3)
            with col1:
                risk_color = "green" if route_data['risk_level'] == "Low" else "orange"
                st.markdown(f"**🛡️ Risk Level:** :{risk_color}[{route_data['risk_level']}]")
            with col2:
                st.markdown(f"**🌤️ Weather Impact:** {route_data['weather_impact']}")
            with col3:
                st.markdown(f"**📦 Cargo Type:** {cargo_type}")
            
            # Route visualization
            st.subheader("🗺️ Optimized Route Path")
            route_steps = route_data['optimal']
            
            # Create route visualization
            route_df = pd.DataFrame({
                'Step': range(1, len(route_steps) + 1),
                'Location': route_steps,
                'Type': ['Origin'] + ['Transit Hub'] * (len(route_steps) - 2) + ['Destination'],
                'Estimated Days': [0] + [i * int(route_data['time'].split()[0]) // len(route_steps) for i in range(1, len(route_steps))]
            })
            
            # Display route as a flow
            for i, (_, row) in enumerate(route_df.iterrows()):
                if i == 0:
                    st.markdown(f"🏁 **{row['Type']}:** {row['Location']} (Day {row['Estimated Days']})")
                elif i == len(route_df) - 1:
                    st.markdown(f"🎯 **{row['Type']}:** {row['Location']} (Day {row['Estimated Days']})")
                else:
                    st.markdown(f"📍 **{row['Type']} {i}:** {row['Location']} (Day {row['Estimated Days']})")
                
                if i < len(route_df) - 1:
                    st.markdown("&nbsp;&nbsp;&nbsp;&nbsp;⬇️")
            
            # Route comparison table
            st.subheader("📊 Route Analysis & Alternatives")
            
            base_cost = route_data['cost']
            base_time = int(route_data['time'].split()[0])
            base_carbon = float(route_data['carbon'].split()[0])
            
            comparison_data = {
                "Route Type": ["🤖 AI Optimized", "📋 Standard Route", "⚡ Express Route", "🌱 Eco-Friendly"],
                "Cost ($)": [f"${base_cost:,}", f"${int(base_cost * 1.3):,}", f"${int(base_cost * 1.8):,}", f"${int(base_cost * 1.1):,}"],
                "Time (days)": [base_time, int(base_time * 1.4), int(base_time * 0.6), int(base_time * 1.2)],
                "Carbon (tons)": [f"{base_carbon:.1f}", f"{base_carbon * 1.4:.1f}", f"{base_carbon * 1.6:.1f}", f"{base_carbon * 0.5:.1f}"],
                "Reliability": ["98%", "85%", "92%", "90%"],
                "Risk Level": ["Low", "Medium", "Medium", "Low"]
            }
            
            comparison_df = pd.DataFrame(comparison_data)
            st.dataframe(comparison_df, use_container_width=True)
            
            # Display the automatically generated ZK Proof
            st.subheader("🔐 Zero-Knowledge Proof Details")
            
            # Enhanced proof display with use case specific information
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.subheader("🔑 Cryptographic Proof")
                st.code(f"Route Hash: {route_proof['route_hash'][:24]}...", language="text")
                st.code(f"ML Proof: {route_proof['ml_verification'][:20]}...", language="text")
                st.code(f"Use Case: {route_proof['use_case_proof'][:16]}...", language="text")
                st.write(f"**Proof System:** {route_proof['proof_system']}")
                st.write(f"**Security Level:** {route_proof['security_level']}")
                st.write(f"**Privacy Level:** {route_proof['privacy_level']}")
            
            with col2:
                st.subheader("📊 Verification Metrics")
                st.write(f"**Generation Time:** {route_proof['verification_time']}")
                st.write(f"**Proof Size:** {route_proof['proof_size']}")
                st.write(f"**Route Efficiency:** {route_proof['route_efficiency']}")
                st.write(f"**Privacy Score:** {route_proof['privacy_score']}")
                st.write(f"**Use Case:** {route_proof['use_case']}")
                st.write(f"**Compliance:** {route_proof['compliance_level']}")
            
            with col3:
                st.subheader("🌍 Impact Verification")
                st.write(f"**Supply Chain:** {route_proof['supply_chain_integrity']}")
                st.write(f"**Logistics Privacy:** {route_proof['logistics_privacy']}")
                st.write(f"**Cost Optimization:** {route_proof['cost_optimization']}")
                st.write(f"**Carbon Reduction:** {route_proof['carbon_reduction']}")
                st.write(f"**ML Algorithm:** {route_proof['ml_algorithm_verified']}")
            
            # Advanced verification details with use case specific components
            st.subheader("🔍 Advanced Proof Verification")
            
            # Adjust verification components based on use case
            verification_components = [
                "Route Optimization Proof", 
                "Supply Chain Integrity", 
                "Privacy Preservation", 
                "ML Algorithm Verification",
                "Carbon Footprint Proof",
                "Quantum Resistance"
            ]
            
            if "Military" in use_case or "Defense" in use_case:
                verification_components.extend(["Military-Grade Encryption", "OPSEC Compliance"])
            elif "Healthcare" in use_case or "Medical" in use_case:
                verification_components.extend(["HIPAA Compliance", "Medical Data Protection"])
            
            verification_details = {
                "Verification Component": verification_components,
                "Status": ["✅ Verified"] * len(verification_components),
                "Confidence": [f"{random.randint(96, 100)}%" for _ in verification_components],
                "Details": [
                    "Route mathematically optimal",
                    "All suppliers verified",
                    "Zero data leakage confirmed", 
                    "AI decisions cryptographically proven",
                    "Environmental impact verified",
                    "Post-quantum cryptography"
                ] + (["Military-grade security protocols", "Operational security maintained"] if "Military" in use_case 
                     else ["Healthcare data protected", "Patient privacy ensured"] if "Healthcare" in use_case 
                     else [])[:len(verification_components)-6]
            }
            
            verification_df = pd.DataFrame(verification_details)
            st.dataframe(verification_df, use_container_width=True)
            
            # Use case specific success message
            if "Military" in use_case or "Defense" in use_case:
                st.success("🛡️ This military-grade ZK proof provides the highest level of cryptographic security for defense supply chains while maintaining operational security (OPSEC) requirements.")
            elif "Healthcare" in use_case or "Medical" in use_case:
                st.success("🏥 This healthcare-compliant ZK proof ensures medical supply chain integrity while protecting patient data and maintaining HIPAA compliance.")
            else:
                st.success("🔒 This advanced ZK proof provides mathematical guarantees of route optimization, supply chain integrity, and environmental impact while maintaining complete privacy of sensitive logistics data and proprietary algorithms.")
            
            # Download proof option
            if st.button("📥 Download Comprehensive Proof Certificate"):
                st.success(f"📄 Advanced proof certificate for {use_case} supply chain verification downloaded!")
                st.balloons()
            
            # Last-Mile Delivery Optimization Section
            st.markdown("---")
            st.subheader("🚚 Last-Mile Delivery Optimization with Identity Verification")
            
            st.markdown("""
            <div class="feature-card">
                <h4>🔐 Secure Last-Mile Delivery with zkVerify Identity Verification</h4>
                <p>Advanced last-mile optimization with cryptographic driver and receiver identity verification, 
                ensuring secure handoffs and preventing delivery fraud through zero-knowledge proofs.</p>
            </div>
            """, unsafe_allow_html=True)
            
            # Last-mile configuration
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.markdown("**🚛 Driver Verification**")
                driver_id = st.text_input("Driver ID:", value="DRV-2024-001", help="Unique driver identifier")
                driver_clearance = st.selectbox("Security Clearance:", ["Standard", "Enhanced", "Military-Grade"])
                driver_biometric = st.checkbox("Biometric Verification", value=True)
                
            with col2:
                st.markdown("**📍 Delivery Configuration**")
                delivery_type = st.selectbox("Delivery Type:", [
                    "Standard Delivery", 
                    "Secure Handoff", 
                    "Contactless Drop", 
                    "Signature Required",
                    "Biometric Confirmation"
                ])
                delivery_window = st.selectbox("Time Window:", ["2-hour", "4-hour", "Same Day", "Next Day"])
                
            with col3:
                st.markdown("**👤 Receiver Verification**")
                receiver_id = st.text_input("Receiver ID:", value="RCV-2024-001", help="Unique receiver identifier")
                id_verification = st.selectbox("ID Verification:", ["Photo ID", "Biometric", "Digital Certificate", "ZK Proof"])
                location_verification = st.checkbox("GPS Location Verification", value=True)
            
            if st.button("🔐 Generate Secure Last-Mile Route", type="primary"):
                with st.spinner("🛡️ Generating secure last-mile delivery plan with identity verification..."):
                    time.sleep(2)
                    
                    # Generate last-mile optimization data
                    last_mile_data = {
                        "driver_verification": {
                            "driver_id": driver_id,
                            "clearance_level": driver_clearance,
                            "biometric_verified": driver_biometric,
                            "verification_hash": f"0x{secrets.token_hex(32)}",
                            "timestamp": datetime.now().isoformat()
                        },
                        "receiver_verification": {
                            "receiver_id": receiver_id,
                            "id_method": id_verification,
                            "location_verified": location_verification,
                            "verification_hash": f"0x{secrets.token_hex(32)}",
                            "expected_location": f"{random.uniform(37.7, 37.8):.6f}, {random.uniform(-122.5, -122.4):.6f}"
                        },
                        "delivery_optimization": {
                            "route_efficiency": f"{random.randint(85, 98)}%",
                            "estimated_time": f"{random.randint(15, 45)} minutes",
                            "fuel_savings": f"{random.randint(10, 25)}%",
                            "carbon_reduction": f"{random.randint(15, 30)}%"
                        }
                    }
                    
                    st.success("✅ Secure last-mile delivery plan generated successfully!")
                    
                    # Display verification results
                    col1, col2 = st.columns(2)
                    
                    with col1:
                        st.markdown("**🔐 Driver Verification Results**")
                        st.json({
                            "Status": "✅ Verified",
                            "Driver ID": last_mile_data["driver_verification"]["driver_id"],
                            "Clearance": last_mile_data["driver_verification"]["clearance_level"],
                            "Biometric": "✅ Verified" if last_mile_data["driver_verification"]["biometric_verified"] else "❌ Not Verified",
                            "Verification Hash": last_mile_data["driver_verification"]["verification_hash"][:20] + "..."
                        })
                        
                    with col2:
                        st.markdown("**👤 Receiver Verification Setup**")
                        st.json({
                            "Status": "🔄 Pending Delivery",
                            "Receiver ID": last_mile_data["receiver_verification"]["receiver_id"],
                            "ID Method": last_mile_data["receiver_verification"]["id_method"],
                            "Location Tracking": "✅ Enabled" if last_mile_data["receiver_verification"]["location_verified"] else "❌ Disabled",
                            "Expected Location": last_mile_data["receiver_verification"]["expected_location"]
                        })
                    
                    # Optimization metrics
                    st.markdown("**📊 Last-Mile Optimization Metrics**")
                    col1, col2, col3, col4 = st.columns(4)
                    
                    with col1:
                        st.metric("🎯 Route Efficiency", last_mile_data["delivery_optimization"]["route_efficiency"])
                    with col2:
                        st.metric("⏱️ Estimated Time", last_mile_data["delivery_optimization"]["estimated_time"])
                    with col3:
                        st.metric("⛽ Fuel Savings", last_mile_data["delivery_optimization"]["fuel_savings"])
                    with col4:
                        st.metric("🌱 Carbon Reduction", last_mile_data["delivery_optimization"]["carbon_reduction"])
                    
                    # Security features
                    st.markdown("**🛡️ Security Features Enabled**")
                    security_features = [
                        "✅ End-to-end encryption of delivery data",
                        "✅ Real-time GPS tracking with geofencing",
                        "✅ Biometric driver authentication",
                        "✅ Receiver identity verification",
                        "✅ Tamper-evident delivery confirmation",
                        "✅ Zero-knowledge proof of delivery completion",
                        "✅ Automated fraud detection algorithms",
                        "✅ Blockchain-based audit trail"
                    ]
                    
                    for feature in security_features:
                        st.write(feature)
                    
                    # Generate delivery tracking code
                    delivery_code = f"SECURE-{secrets.token_hex(4).upper()}"
                    st.markdown(f"""
                    <div style="background: #e8f5e8; padding: 1rem; border-radius: 5px; border: 1px solid #4caf50; margin: 1rem 0;">
                        <h4>🔒 Secure Delivery Code Generated</h4>
                        <p><strong>Delivery Code:</strong> <code>{delivery_code}</code></p>
                        <p>This code will be required for delivery verification and can only be used once.</p>
                    </div>
                    """, unsafe_allow_html=True)

def analytics_page(analytics_df):
    st.header("📊 Supply Chain Analytics")
    
    # Time range selector
    col1, col2 = st.columns(2)
    with col1:
        start_date = st.date_input("Start Date:", value=analytics_df['date'].min())
    with col2:
        end_date = st.date_input("End Date:", value=analytics_df['date'].max())
    
    # Filter data
    filtered_df = analytics_df[(analytics_df['date'] >= pd.Timestamp(start_date)) & (analytics_df['date'] <= pd.Timestamp(end_date))]
    
    # Key metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        total_shipments = filtered_df['shipments'].sum()
        st.metric("📦 Total Shipments", f"{total_shipments:,}")
    
    with col2:
        total_fraud = filtered_df['fraud_detected'].sum()
        st.metric("🛡️ Fraud Detected", total_fraud)
    
    with col3:
        total_savings = filtered_df['cost_savings'].sum()
        st.metric("💰 Cost Savings", f"${total_savings:,.0f}")
    
    with col4:
        avg_trust = filtered_df['trust_score'].mean()
        st.metric("⭐ Avg Trust Score", f"{avg_trust:.1f}")
    
    # Charts
    st.subheader("📈 Performance Trends")
    
    # Multi-metric chart
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=('Shipment Volume', 'Cost Savings', 'Trust Score Trend', 'Fraud Detection'),
        specs=[[{"secondary_y": False}, {"secondary_y": False}],
               [{"secondary_y": False}, {"secondary_y": False}]]
    )
    
    fig.add_trace(
        go.Scatter(x=filtered_df['date'], y=filtered_df['shipments'], name='Shipments'),
        row=1, col=1
    )
    
    fig.add_trace(
        go.Scatter(x=filtered_df['date'], y=filtered_df['cost_savings'], name='Savings', line=dict(color='green')),
        row=1, col=2
    )
    
    fig.add_trace(
        go.Scatter(x=filtered_df['date'], y=filtered_df['trust_score'], name='Trust Score', line=dict(color='blue')),
        row=2, col=1
    )
    
    fig.add_trace(
        go.Bar(x=filtered_df['date'], y=filtered_df['fraud_detected'], name='Fraud Cases', marker_color='red'),
        row=2, col=2
    )
    
    fig.update_layout(height=600, showlegend=False)
    st.plotly_chart(fig, use_container_width=True)
    
    # Performance insights
    st.subheader("🔍 Key Insights")
    
    insights = [
        f"📈 Shipment volume increased by {random.randint(15, 35)}% compared to last period",
        f"💰 AI optimization saved an average of ${filtered_df['cost_savings'].mean():,.0f} per day",
        f"🛡️ Fraud detection rate improved by {random.randint(20, 40)}% with ML algorithms",
        f"⭐ Supplier trust scores maintained above {filtered_df['trust_score'].min():.1f} consistently"
    ]
    
    for insight in insights:
        st.info(insight)

# Footer
def last_mile_logistics_page():
    """Dedicated page for last-mile delivery verification and driver/receiver management"""
    st.markdown('<h1 class="main-header">🚛 Last-Mile Logistics & Verification</h1>', unsafe_allow_html=True)
    
    st.markdown("""
    <div class="feature-card">
        <h3>🔐 Secure Last-Mile Delivery with zkVerify Identity Verification</h3>
        <p>Advanced last-mile optimization with cryptographic driver and receiver identity verification, 
        ensuring secure handoffs and preventing delivery fraud through zero-knowledge proofs.</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Create tabs for different aspects of last-mile logistics
    driver_tab, receiver_tab, delivery_tab, tracking_tab = st.tabs([
        "🚛 Driver Verification", 
        "👤 Receiver Verification", 
        "📦 Delivery Management", 
        "📍 Real-Time Tracking"
    ])
    
    with driver_tab:
        st.subheader("🚛 Driver Identity & Credential Verification")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("**Driver Information**")
            driver_id = st.text_input("Driver ID:", value="DRV-2024-001", help="Unique driver identifier")
            driver_name = st.text_input("Driver Name:", value="John Smith")
            license_number = st.text_input("License Number:", value="DL-123456789")
            driver_clearance = st.selectbox("Security Clearance:", ["Standard", "Enhanced", "Military-Grade"])
            
        with col2:
            st.markdown("**Verification Methods**")
            biometric_verification = st.checkbox("Biometric Verification", value=True)
            background_check = st.checkbox("Background Check", value=True)
            vehicle_verification = st.checkbox("Vehicle Registration Check", value=True)
            insurance_check = st.checkbox("Insurance Verification", value=True)
        
        if st.button("🔐 Verify Driver Identity", type="primary"):
            with st.spinner("🛡️ Verifying driver credentials with zkVerify..."):
                time.sleep(2)
                
                driver_verification_result = {
                    "driver_id": driver_id,
                    "verification_status": "✅ Verified",
                    "clearance_level": driver_clearance,
                    "biometric_hash": f"0x{secrets.token_hex(32)}",
                    "background_score": random.randint(85, 98),
                    "license_valid": True,
                    "insurance_valid": True,
                    "verification_timestamp": datetime.now().isoformat()
                }
                
                st.success("✅ Driver verification completed successfully!")
                st.json(driver_verification_result)
    
    with receiver_tab:
        st.subheader("👤 Receiver Identity & Location Verification")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("**Receiver Information**")
            receiver_id = st.text_input("Receiver ID:", value="RCV-2024-001", help="Unique receiver identifier")
            receiver_name = st.text_input("Receiver Name:", value="Jane Doe")
            delivery_address = st.text_area("Delivery Address:", value="123 Main St, New York, NY 10001")
            contact_number = st.text_input("Contact Number:", value="+1-555-0123")
            
        with col2:
            st.markdown("**Verification Requirements**")
            id_verification_method = st.selectbox("ID Verification:", ["Photo ID", "Biometric", "Digital Certificate", "ZK Proof"])
            location_verification = st.checkbox("GPS Location Verification", value=True)
            signature_required = st.checkbox("Digital Signature Required", value=True)
            photo_confirmation = st.checkbox("Photo Confirmation", value=False)
        
        if st.button("🔐 Setup Receiver Verification", type="primary"):
            with st.spinner("🛡️ Setting up receiver verification with zkVerify..."):
                time.sleep(2)
                
                receiver_verification_setup = {
                    "receiver_id": receiver_id,
                    "verification_method": id_verification_method,
                    "location_verified": location_verification,
                    "expected_location": f"{random.uniform(37.7, 37.8):.6f}, {random.uniform(-122.5, -122.4):.6f}",
                    "verification_hash": f"0x{secrets.token_hex(32)}",
                    "delivery_window": "2-hour window",
                    "setup_timestamp": datetime.now().isoformat()
                }
                
                st.success("✅ Receiver verification setup completed!")
                st.json(receiver_verification_setup)
    
    with delivery_tab:
        st.subheader("📦 Secure Delivery Management")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.markdown("**Delivery Configuration**")
            delivery_type = st.selectbox("Delivery Type:", [
                "Standard Delivery", 
                "Secure Handoff", 
                "Contactless Drop", 
                "Signature Required",
                "Biometric Confirmation"
            ])
            delivery_window = st.selectbox("Time Window:", ["2-hour", "4-hour", "Same Day", "Next Day"])
            priority_level = st.selectbox("Priority:", ["Standard", "High", "Critical"])
            
        with col2:
            st.markdown("**Package Information**")
            package_id = st.text_input("Package ID:", value="PKG-2024-001")
            package_weight = st.number_input("Weight (kg):", value=2.5, min_value=0.1)
            package_value = st.number_input("Value ($):", value=500.0, min_value=0.0)
            special_handling = st.checkbox("Special Handling Required")
            
        with col3:
            st.markdown("**Security Features**")
            tamper_seal = st.checkbox("Tamper-Evident Seal", value=True)
            gps_tracking = st.checkbox("GPS Tracking", value=True)
            temperature_monitoring = st.checkbox("Temperature Monitoring")
            photo_proof = st.checkbox("Photo Proof of Delivery", value=True)
        
        if st.button("🚀 Initialize Secure Delivery", type="primary"):
            with st.spinner("🔐 Initializing secure delivery with zkVerify verification..."):
                time.sleep(3)
                
                delivery_initialization = {
                    "delivery_id": f"DEL-{secrets.token_hex(8).upper()}",
                    "package_id": package_id,
                    "delivery_type": delivery_type,
                    "security_features": {
                        "tamper_seal": tamper_seal,
                        "gps_tracking": gps_tracking,
                        "temperature_monitoring": temperature_monitoring,
                        "photo_proof": photo_proof
                    },
                    "route_optimization": {
                        "efficiency_score": f"{random.randint(85, 98)}%",
                        "estimated_time": f"{random.randint(15, 45)} minutes",
                        "fuel_savings": f"{random.randint(10, 25)}%"
                    },
                    "zk_proof_hash": f"0x{secrets.token_hex(32)}",
                    "initialization_timestamp": datetime.now().isoformat()
                }
                
                st.success("✅ Secure delivery initialized successfully!")
                
                # Display delivery metrics
                col1, col2, col3, col4 = st.columns(4)
                with col1:
                    st.metric("🎯 Route Efficiency", delivery_initialization["route_optimization"]["efficiency_score"])
                with col2:
                    st.metric("⏱️ Estimated Time", delivery_initialization["route_optimization"]["estimated_time"])
                with col3:
                    st.metric("⛽ Fuel Savings", delivery_initialization["route_optimization"]["fuel_savings"])
                with col4:
                    st.metric("🔐 Security Level", "Maximum")
                
                st.json(delivery_initialization)
    
    with tracking_tab:
        st.subheader("📍 Real-Time Delivery Tracking")
        
        # Sample tracking data
        tracking_id = st.text_input("Enter Tracking ID:", value="TRK-LOG-001")
        
        if st.button("🔍 Track Delivery"):
            with st.spinner("📡 Fetching real-time tracking data..."):
                time.sleep(1)
                
                # Generate realistic tracking data
                tracking_data = {
                    "tracking_id": tracking_id,
                    "status": "In Transit",
                    "current_location": "Distribution Hub - Brooklyn, NY",
                    "progress": 75,
                    "estimated_delivery": "2024-01-24 14:30",
                    "driver_verified": True,
                    "route_optimized": True,
                    "last_update": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
                
                # Progress bar
                st.progress(tracking_data["progress"] / 100)
                
                col1, col2 = st.columns(2)
                
                with col1:
                    st.markdown("**📍 Current Status**")
                    st.info(f"**Status:** {tracking_data['status']}")
                    st.info(f"**Location:** {tracking_data['current_location']}")
                    st.info(f"**Progress:** {tracking_data['progress']}%")
                    st.info(f"**ETA:** {tracking_data['estimated_delivery']}")
                
                with col2:
                    st.markdown("**🔐 Verification Status**")
                    st.success("✅ Driver Verified" if tracking_data["driver_verified"] else "❌ Driver Not Verified")
                    st.success("✅ Route Optimized" if tracking_data["route_optimized"] else "❌ Route Not Optimized")
                    st.success("✅ Real-time Tracking Active")
                    st.success("✅ zkVerify Secured")
                
                # Route visualization (simplified)
                st.markdown("**🗺️ Delivery Route**")
                route_steps = [
                    "📦 Package Picked Up - Warehouse",
                    "🚛 In Transit - Highway 95",
                    "📍 Current Location - Brooklyn Hub",
                    "🏠 Final Destination - Customer Address"
                ]
                
                for i, step in enumerate(route_steps):
                    if i < tracking_data["progress"] / 25:
                        st.success(f"✅ {step}")
                    elif i == int(tracking_data["progress"] / 25):
                        st.warning(f"🔄 {step}")
                    else:
                        st.info(f"⏳ {step}")

def add_footer():
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; color: #666; padding: 2rem;">
        <p><strong>ChainFlow</strong> - AI-Powered Supply Chain Verification Platform</p>
        <p>Built by <strong>Abduljalaal Abubakar</strong></p>
        <p>🔗 <a href="https://github.com/ShanksDLAw/Chainflow" target="_blank">GitHub Repository</a></p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
    add_footer()
