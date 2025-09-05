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

# Load sample data
@st.cache_data
def load_sample_data():
    # Expanded products data with more variety
    products = [
        {"id": "PRD-001", "name": "Organic Coffee Beans", "category": "Food & Beverage", "supplier": "Ethiopian Highlands Co.", "trust_score": 95, "price": 24.99, "origin": "Ethiopia", "image": "images/coffee_beans.svg"},
        {"id": "PRD-002", "name": "Sustainable Cotton T-Shirt", "category": "Apparel", "supplier": "EcoTextiles Ltd.", "trust_score": 88, "price": 29.99, "origin": "India", "image": "images/cotton_tshirt.svg"},
        {"id": "PRD-003", "name": "Artisan Chocolate Bar", "category": "Food & Beverage", "supplier": "Cacao Dreams", "trust_score": 92, "price": 8.99, "origin": "Ecuador", "image": "images/chocolate_bar.svg"},
        {"id": "PRD-004", "name": "Bamboo Phone Case", "category": "Electronics", "supplier": "GreenTech Solutions", "trust_score": 85, "price": 19.99, "origin": "Vietnam", "image": "images/bamboo_phone_case.svg"},
        {"id": "PRD-005", "name": "Fair Trade Vanilla Extract", "category": "Food & Beverage", "supplier": "Madagascar Vanilla Co.", "trust_score": 97, "price": 15.99, "origin": "Madagascar", "image": "images/vanilla_extract.svg"},
        {"id": "PRD-006", "name": "Swiss Luxury Watch", "category": "Luxury", "supplier": "Alpine Timepieces", "trust_score": 99, "price": 2499.99, "origin": "Switzerland", "image": "images/swiss_watch.svg"},
        {"id": "PRD-007", "name": "Japanese Green Tea", "category": "Food & Beverage", "supplier": "Kyoto Tea Gardens", "trust_score": 94, "price": 45.99, "origin": "Japan", "image": "images/green_tea.svg"},
        {"id": "PRD-008", "name": "Italian Leather Handbag", "category": "Fashion", "supplier": "Milano Crafters", "trust_score": 91, "price": 399.99, "origin": "Italy", "image": "images/leather_handbag.svg"},
        {"id": "PRD-009", "name": "Norwegian Salmon", "category": "Food & Beverage", "supplier": "Arctic Fisheries", "trust_score": 96, "price": 89.99, "origin": "Norway", "image": "images/norwegian_salmon.svg"},
        {"id": "PRD-010", "name": "Australian Wool Blanket", "category": "Home & Living", "supplier": "Outback Textiles", "trust_score": 89, "price": 159.99, "origin": "Australia", "image": "images/wool_blanket.svg"}
    ]
    
    # Sample tracking data
    tracking_data = {
        "TRK-PAY-001": {
            "product": "Organic Coffee Beans",
            "status": "In Transit",
            "current_location": "Port of Hamburg",
            "progress": 65,
            "estimated_delivery": "2024-01-25",
            "route": ["Addis Ababa", "Dubai", "Hamburg", "London"],
            "zk_verified": True
        },
        "TRK-PAY-002": {
            "product": "Sustainable Cotton T-Shirt",
            "status": "Delivered",
            "current_location": "New York",
            "progress": 100,
            "estimated_delivery": "2024-01-20",
            "route": ["Mumbai", "Singapore", "Los Angeles", "New York"],
            "zk_verified": True
        },
        "TRK-PAY-003": {
            "product": "Swiss Luxury Watch",
            "status": "Processing",
            "current_location": "Geneva",
            "progress": 15,
            "estimated_delivery": "2024-01-30",
            "route": ["Geneva", "Frankfurt", "Amsterdam", "London"],
            "zk_verified": True
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

# Generate ZK proof simulation
def generate_zk_proof(product_id):
    return {
        "proof_hash": f"0x{random.getrandbits(256):064x}",
        "verification_time": f"{random.uniform(0.1, 0.5):.2f}s",
        "verified": True,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

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
        st.markdown('<p style="text-align: center; font-size: 1.2rem; color: #666;">AI-Powered Supply Chain Verification Platform</p>', unsafe_allow_html=True)
    
    # Load data
    products, tracking_data = load_sample_data()
    analytics_df = generate_analytics_data()
    
    # Sidebar navigation
    st.sidebar.title("🚀 Navigation")
    page = st.sidebar.selectbox(
        "Choose a section:",
        ["🏠 Dashboard", "📦 Product Verification", "🚚 Shipment Tracking", "💳 Payment & Receipts", "🤖 AI Route Optimization", "📊 Analytics", "🔐 ZK Proof Demo"]
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
    elif page == "📊 Analytics":
        analytics_page(analytics_df)
    elif page == "🔐 ZK Proof Demo":
        zk_proof_page(products)

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
        st.subheader("🛡️ Fraud Detection")
        fig = px.bar(analytics_df, x='date', y='fraud_detected', title="Fraud Cases Detected")
        fig.update_layout(height=400)
        st.plotly_chart(fig, use_container_width=True)
    
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
                # Simulate ZK proof generation
                progress_bar = st.progress(0)
                steps = ["Initializing circuit", "Computing witness", "Generating proof", "Verifying proof"]
                
                for i, step in enumerate(steps):
                    time.sleep(0.8)
                    progress_bar.progress((i + 1) / len(steps))
                
                proof = generate_zk_proof(product['id'])
                
                st.success("✅ Zero-Knowledge Proof Generated Successfully!")
                
                # Enhanced proof display
                col1, col2 = st.columns(2)
                
                with col1:
                    st.subheader("🔑 Proof Details")
                    st.code(f"Proof Hash: {proof['proof_hash'][:32]}...", language="text")
                    st.code(f"Public Inputs: {proof['proof_hash'][32:64]}...", language="text")
                    st.write(f"**Proof Type:** {proof_type}")
                    st.write(f"**Privacy Level:** {privacy_level}")
                
                with col2:
                    st.subheader("📊 Verification Metrics")
                    st.write(f"**Generation Time:** {proof['verification_time']}")
                    st.write(f"**Proof Size:** 248 bytes")
                    st.write(f"**Verification Time:** <1ms")
                    st.write(f"**Status:** ✅ Valid & Verified")
                    st.write(f"**Timestamp:** {proof['timestamp']}")
                
                # Proof verification section
                st.subheader("🔍 Proof Verification")
                
                verification_result = {
                    "Verification Check": ["Proof Validity", "Circuit Integrity", "Public Input Consistency", "Cryptographic Signature"],
                    "Result": ["✅ Valid", "✅ Verified", "✅ Consistent", "✅ Authentic"],
                    "Details": ["Proof mathematically sound", "Circuit hash matches", "Inputs properly formatted", "Signature verified"]
                }
                
                verification_result_df = pd.DataFrame(verification_result)
                st.dataframe(verification_result_df, use_container_width=True)
                
                st.info("🔒 This ZK proof mathematically guarantees product authenticity while keeping sensitive supply chain data completely private.")
                
                # Download proof option
                if st.button("📥 Download Proof Certificate"):
                    st.success("📄 Proof certificate downloaded successfully!")
                    st.balloons()

def tracking_page(tracking_data):
    st.header("🚚 Shipment Tracking")
    
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
            st.image('images/world_map.svg', caption="Live Shipment Tracking", use_column_width=True)
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
                "zk_verified": True
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
    st.header("🤖 AI Route Optimization")
    
    # Introduction
    st.markdown("""
    <div class="feature-card">
        <h4>🧠 Machine Learning Powered Route Planning</h4>
        <p>Our AI analyzes global shipping data, weather patterns, geopolitical factors, and real-time logistics 
        to find the most efficient routes for your supply chain needs.</p>
    </div>
    """, unsafe_allow_html=True)
    
    countries = get_global_countries()
    
    # Route optimization form
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📍 Route Configuration")
        origin = st.selectbox("Origin Country:", countries, index=countries.index("China"))
        destination = st.selectbox("Destination Country:", countries, index=countries.index("United States"))
        
    with col2:
        st.subheader("⚙️ Optimization Settings")
        priority = st.selectbox("Optimization Priority:", ["Cost", "Time", "Sustainability"])
        cargo_type = st.selectbox("Cargo Type:", ["Standard", "Fragile", "Perishable", "Hazardous", "Electronics", "Textiles"])
    
    # Advanced options
    with st.expander("🔧 Advanced Options"):
        col1, col2 = st.columns(2)
        with col1:
            max_stops = st.slider("Maximum Transit Stops:", 1, 8, 4)
            avoid_regions = st.multiselect("Avoid Regions:", ["High Risk Areas", "Weather Affected", "Port Congestion"])
        with col2:
            insurance_level = st.selectbox("Insurance Level:", ["Basic", "Standard", "Premium", "Full Coverage"])
            tracking_frequency = st.selectbox("Tracking Updates:", ["Daily", "Real-time", "On Milestones"])
    
    if st.button("🚀 Optimize Route", type="primary"):
        with st.spinner("🧠 AI is analyzing global logistics data..."):
            progress_bar = st.progress(0)
            for i in range(100):
                time.sleep(0.02)
                progress_bar.progress(i + 1)
            
            route_data = optimize_route(origin, destination, priority)
            
            st.success("✅ Route optimization complete!")
            
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
            
            # ZK Proof for route verification
            st.subheader("🔐 Route Verification with Zero-Knowledge Proof")
            if st.button("🔒 Generate Route ZK Proof"):
                with st.spinner("Generating cryptographic proof for route authenticity..."):
                    time.sleep(1.5)
                    route_proof = generate_zk_proof(f"ROUTE-{origin}-{destination}")
                    
                    st.success("✅ Route ZK Proof generated successfully!")
                    
                    col1, col2 = st.columns(2)
                    with col1:
                        st.code(f"Proof Hash: {route_proof['proof_hash'][:32]}...", language="text")
                        st.write(f"**Verification Time:** {route_proof['verification_time']}")
                    with col2:
                        st.write(f"**Status:** ✅ Verified")
                        st.write(f"**Generated:** {route_proof['timestamp']}")
                    
                    st.info("🔒 This ZK proof ensures route authenticity without revealing sensitive logistics data.")

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

def zk_proof_page(products):
    st.header("🔐 Zero-Knowledge Proof Technology Demo")
    
    # Educational introduction
    st.markdown("""
    <div class="feature-card">
        <h4>🧠 Understanding Zero-Knowledge Proofs</h4>
        <p>Zero-Knowledge Proofs are cryptographic methods that allow one party to prove to another 
        that they know a value, without conveying any information apart from the fact that they know the value.</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Benefits section
    st.subheader("🌟 Benefits in Supply Chain Management")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        **🔒 Privacy Protection**
        - Prove authenticity without revealing supplier details
        - Verify compliance without exposing processes
        - Confirm quality without sharing sensitive data
        """)
    
    with col2:
        st.markdown("""
        **⚡ Efficiency**
        - Instant verification
        - Reduced data sharing
        - Lower compliance costs
        """)
    
    with col3:
        st.markdown("""
        **🛡️ Security**
        - Cryptographically secure
        - Tamper-proof verification
        - Decentralized trust
        """)
    
    # Interactive demo section
    st.subheader("🧪 Interactive ZK Proof Generator")
    
    # Demo configuration
    col1, col2 = st.columns(2)
    
    with col1:
        demo_type = st.selectbox("Select proof scenario:", 
                                ["🔍 Product Authenticity", "🌍 Origin Verification", 
                                 "📋 Quality Compliance", "💰 Price Verification", 
                                 "🚚 Logistics Confirmation"])
        
        circuit_type = st.selectbox("Circuit Complexity:", 
                                   ["Simple (Hash)", "Medium (Merkle Tree)", "Advanced (Custom Circuit)"])
    
    with col2:
        proof_system = st.selectbox("Proof System:", 
                                   ["Groth16", "PLONK", "STARK", "Bulletproofs"])
        
        security_level = st.selectbox("Security Level:", 
                                     ["128-bit", "192-bit", "256-bit"])
    
    # Secret data input
    st.subheader("🔐 Secret Information")
    
    secret_data = st.text_area("Enter confidential supply chain data:", 
                              value="Supplier: SecretCorp\nLocation: Confidential\nPrice: $1,250\nQuality: Grade A+", 
                              height=100,
                              help="This sensitive information will be proven without being revealed")
    
    # Public parameters
    with st.expander("🔧 Advanced Configuration"):
        col1, col2 = st.columns(2)
        with col1:
            include_timestamp = st.checkbox("Include Timestamp", value=True)
            batch_verification = st.checkbox("Enable Batch Verification", value=False)
        with col2:
            recursive_proof = st.checkbox("Recursive Proof", value=False)
            zero_knowledge_level = st.slider("Zero-Knowledge Level", 1, 10, 8)
    
    # Generate proof button
    if st.button("🔒 Generate Zero-Knowledge Proof", type="primary"):
        with st.spinner("🔐 Generating cryptographic proof..."):
            # Simulate proof generation steps
            steps = [
                "Initializing trusted setup...",
                "Compiling circuit...",
                "Computing witness...",
                "Generating proof...",
                "Verifying proof...",
                "Finalizing output..."
            ]
            
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            for i, step in enumerate(steps):
                status_text.text(step)
                time.sleep(0.7)
                progress_bar.progress((i + 1) / len(steps))
            
            proof = generate_zk_proof(secret_data)
            
            # Store proof in session state
            st.session_state.zk_proof_data = {
                'proof': proof,
                'proof_system': proof_system,
                'security_level': security_level,
                'circuit_type': circuit_type,
                'zero_knowledge_level': zero_knowledge_level
            }
            
            st.success("✅ Zero-Knowledge Proof Generated Successfully!")
    
    # Display proof results if available
    if 'zk_proof_data' in st.session_state:
        proof_data = st.session_state.zk_proof_data
        proof = proof_data['proof']
        proof_system = proof_data['proof_system']
        security_level = proof_data['security_level']
        circuit_type = proof_data['circuit_type']
        zero_knowledge_level = proof_data['zero_knowledge_level']
        
        # Enhanced proof display
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("🔑 Generated Proof")
            st.code(f"Proof Hash:\n{proof['proof_hash'][:64]}...\n\nPublic Inputs:\n{proof['proof_hash'][64:128]}...\n\nVerification Key:\n{proof['proof_hash'][128:192]}...", language="text")
            
            st.subheader("📊 Proof Metrics")
            st.write(f"**Proof System:** {proof_system}")
            st.write(f"**Security Level:** {security_level}")
            st.write(f"**Circuit Type:** {circuit_type}")
            st.write(f"**Proof Size:** 248 bytes")
        
        with col2:
            st.subheader("✅ Verification Results")
            
            verification_checks = {
                "Check": ["Proof Validity", "Circuit Integrity", "Public Input Consistency", 
                         "Cryptographic Signature", "Zero-Knowledge Property"],
                "Status": ["✅ Valid", "✅ Verified", "✅ Consistent", "✅ Authentic", "✅ Preserved"],
                "Time": ["<1ms", "<1ms", "<1ms", "<1ms", "<1ms"]
            }
            
            verification_df = pd.DataFrame(verification_checks)
            st.dataframe(verification_df, use_container_width=True)
            
            st.write(f"**Generation Time:** {proof['verification_time']}")
            st.write(f"**Verification Time:** <1ms")
            st.write(f"**Status:** ✅ Valid & Verified")
            st.write(f"**Timestamp:** {proof['timestamp']}")
        
        # What was proven section
        st.subheader("🎯 What Was Proven")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("""
            **✅ Proven (without revealing):**
            - Data authenticity and integrity
            - Compliance with specified criteria
            - Possession of valid credentials
            - Meeting quality standards
            - Authorized access to information
            """)
        
        with col2:
            st.markdown("""
            **🔒 Kept Private:**
            - Actual supplier names and details
            - Specific pricing information
            - Proprietary processes and methods
            - Sensitive location data
            - Trade secrets and formulations
            """)
        
        # Technical details
        with st.expander("🔬 Technical Details"):
            st.markdown(f"""
            **Circuit Information:**
            - **Constraints:** 15,847
            - **Variables:** 8,923
            - **Proof System:** {proof_system}
            - **Security Level:** {security_level}
            - **Zero-Knowledge Level:** {zero_knowledge_level}/10
            
            **Cryptographic Properties:**
            - **Completeness:** If the statement is true, an honest prover can convince an honest verifier
            - **Soundness:** If the statement is false, no cheating prover can convince an honest verifier
            - **Zero-Knowledge:** The verifier learns nothing beyond the validity of the statement
            """)
        
        st.info("🔒 This proof mathematically guarantees the authenticity and compliance of your supply chain data while keeping all sensitive information completely private!")
    
    # Download options (outside the button conditional)
    if 'zk_proof_data' in st.session_state:
        st.subheader("📥 Download Options")
        col1, col2, col3 = st.columns(3)
        
        with col1:
            if st.button("📥 Download Proof"):
                st.success("📄 Proof downloaded successfully!")
        
        with col2:
            if st.button("📋 Copy Verification Code"):
                st.success("📋 Verification code copied to clipboard!")
        
        with col3:
            if st.button("🔗 Share Proof Link"):
                st.success("🔗 Shareable proof link generated!")
                st.balloons()
    
    # ZK Proof benefits
    st.subheader("🌟 ZK Proof Benefits")
    
    benefits = [
        "🔒 **Privacy**: Verify authenticity without revealing sensitive supply chain data",
        "⚡ **Efficiency**: Fast verification with minimal computational overhead",
        "🛡️ **Security**: Cryptographically secure proofs that cannot be forged",
        "📏 **Scalability**: Batch verification for thousands of products simultaneously",
        "🔗 **Interoperability**: Compatible with multiple blockchain networks"
    ]
    
    for benefit in benefits:
        st.markdown(benefit)
    
    # Technical details
    with st.expander("🔧 Technical Implementation"):
        st.code("""
        // ZK Circuit (Circom)
        pragma circom 2.0.0;
        
        template SupplyChainVerifier() {
            signal input productId;
            signal input supplierHash;
            signal input timestamp;
            signal output isValid;
            
            // Verification logic
            component hasher = Poseidon(3);
            hasher.inputs[0] <== productId;
            hasher.inputs[1] <== supplierHash;
            hasher.inputs[2] <== timestamp;
            
            isValid <== hasher.out;
        }
        
        component main = SupplyChainVerifier();
        """, language="javascript")

# Footer
def add_footer():
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; color: #666; padding: 2rem;">
        <p><strong>ChainFlow</strong> - AI-Powered Supply Chain Verification Platform</p>
        <p>Built for Ethereum Accra Hackathon by <strong>Abduljalaal Abubakar</strong></p>
        <p>🔗 <a href="https://github.com/ShanksDLAw/Chainflow" target="_blank">GitHub Repository</a></p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
    add_footer()