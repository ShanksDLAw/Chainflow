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
    # Sample products data
    products = [
        {"id": "PRD-001", "name": "Organic Coffee Beans", "category": "Food & Beverage", "supplier": "Ethiopian Highlands Co.", "trust_score": 95, "price": 24.99, "origin": "Ethiopia"},
        {"id": "PRD-002", "name": "Sustainable Cotton T-Shirt", "category": "Apparel", "supplier": "EcoTextiles Ltd.", "trust_score": 88, "price": 29.99, "origin": "India"},
        {"id": "PRD-003", "name": "Artisan Chocolate Bar", "category": "Food & Beverage", "supplier": "Cacao Dreams", "trust_score": 92, "price": 8.99, "origin": "Ecuador"},
        {"id": "PRD-004", "name": "Bamboo Phone Case", "category": "Electronics", "supplier": "GreenTech Solutions", "trust_score": 85, "price": 19.99, "origin": "Vietnam"},
        {"id": "PRD-005", "name": "Fair Trade Vanilla Extract", "category": "Food & Beverage", "supplier": "Madagascar Vanilla Co.", "trust_score": 97, "price": 15.99, "origin": "Madagascar"}
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

# Simulate ML route optimization
def optimize_route(origin, destination):
    routes = {
        ("Ethiopia", "London"): {
            "optimal": ["Addis Ababa", "Dubai", "Hamburg", "London"],
            "cost": 2450,
            "time": "14 days",
            "carbon": "2.1 tons CO2"
        },
        ("India", "New York"): {
            "optimal": ["Mumbai", "Singapore", "Los Angeles", "New York"],
            "cost": 3200,
            "time": "18 days",
            "carbon": "3.2 tons CO2"
        }
    }
    
    return routes.get((origin, destination), {
        "optimal": [origin, "Transit Hub", destination],
        "cost": random.randint(2000, 4000),
        "time": f"{random.randint(10, 25)} days",
        "carbon": f"{random.uniform(1.5, 4.0):.1f} tons CO2"
    })

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
    # Header
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
    
    # Key metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown("""
        <div class="metric-card">
            <h3>2,847</h3>
            <p>Total Shipments</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="metric-card">
            <h3>98.5%</h3>
            <p>Verification Rate</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class="metric-card">
            <h3>$2.4M</h3>
            <p>Cost Savings</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        st.markdown("""
        <div class="metric-card">
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
    st.header("📦 Product Verification")
    
    # Search functionality
    col1, col2 = st.columns([3, 1])
    with col1:
        search_term = st.text_input("🔍 Search products by name or ID:", placeholder="Enter product name or ID...")
    with col2:
        category_filter = st.selectbox("Category:", ["All"] + list(set([p["category"] for p in products])))
    
    # Filter products
    filtered_products = products
    if search_term:
        filtered_products = [p for p in products if search_term.lower() in p["name"].lower() or search_term.lower() in p["id"].lower()]
    if category_filter != "All":
        filtered_products = [p for p in filtered_products if p["category"] == category_filter]
    
    # Display products
    for product in filtered_products:
        with st.expander(f"🏷️ {product['name']} ({product['id']})"):
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.write(f"**Category:** {product['category']}")
                st.write(f"**Supplier:** {product['supplier']}")
                st.write(f"**Origin:** {product['origin']}")
            
            with col2:
                st.write(f"**Price:** ${product['price']}")
                trust_color = "green" if product['trust_score'] >= 90 else "orange" if product['trust_score'] >= 80 else "red"
                st.write(f"**Trust Score:** :{trust_color}[{product['trust_score']}/100]")
            
            with col3:
                if st.button(f"🔍 Verify {product['id']}", key=f"verify_{product['id']}"):
                    with st.spinner("Generating ZK proof..."):
                        time.sleep(1)
                        proof = generate_zk_proof(product['id'])
                        st.success(f"✅ Product verified! Proof: {proof['proof_hash'][:16]}...")

def tracking_page(tracking_data):
    st.header("🚚 Shipment Tracking")
    
    # Tracking ID input
    tracking_id = st.selectbox("Select Tracking ID:", list(tracking_data.keys()))
    
    if tracking_id in tracking_data:
        shipment = tracking_data[tracking_id]
        
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
        if st.button("🔄 Refresh Tracking"):
            with st.spinner("Fetching latest updates..."):
                time.sleep(1)
                st.success("📡 Tracking data updated successfully!")

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
        
        if submitted:
            with st.spinner("Processing payment..."):
                time.sleep(2)
                tracking_id = f"TRK-PAY-{random.randint(100, 999)}"
                
                st.success(f"✅ Payment processed successfully!")
                st.info(f"📋 Tracking ID: {tracking_id}")
                
                # Generate receipt
                receipt_data = {
                    "Receipt ID": f"RCP-{random.randint(10000, 99999)}",
                    "Tracking ID": tracking_id,
                    "Product": selected_product.split(" - ")[0],
                    "Amount": f"${amount:.2f} {currency}",
                    "Payment Method": payment_method,
                    "Timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "ZK Proof": f"0x{random.getrandbits(128):032x}"
                }
                
                st.subheader("🧾 Digital Receipt")
                for key, value in receipt_data.items():
                    st.write(f"**{key}:** {value}")
                
                if st.button("📥 Download Receipt (PDF)"):
                    st.success("📄 Receipt downloaded successfully!")

def route_optimization_page():
    st.header("🤖 AI Route Optimization")
    
    # Route optimization form
    col1, col2 = st.columns(2)
    
    with col1:
        origin = st.selectbox("Origin:", ["Ethiopia", "India", "Ecuador", "Vietnam", "Madagascar"])
        destination = st.selectbox("Destination:", ["London", "New York", "Tokyo", "Sydney", "Berlin"])
    
    with col2:
        priority = st.selectbox("Optimization Priority:", ["Cost", "Time", "Sustainability"])
        cargo_type = st.selectbox("Cargo Type:", ["Standard", "Fragile", "Perishable", "Hazardous"])
    
    if st.button("🚀 Optimize Route"):
        with st.spinner("AI is calculating optimal route..."):
            time.sleep(2)
            
            route_data = optimize_route(origin, destination)
            
            st.success("✅ Route optimization complete!")
            
            # Display results
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric("💰 Estimated Cost", f"${route_data['cost']:,}")
            
            with col2:
                st.metric("⏱️ Transit Time", route_data['time'])
            
            with col3:
                st.metric("🌱 Carbon Footprint", route_data['carbon'])
            
            # Route details
            st.subheader("🗺️ Optimal Route")
            route_steps = route_data['optimal']
            
            for i, step in enumerate(route_steps):
                if i == 0:
                    st.write(f"🏁 **Start:** {step}")
                elif i == len(route_steps) - 1:
                    st.write(f"🎯 **Destination:** {step}")
                else:
                    st.write(f"📍 **Stop {i}:** {step}")
            
            # Comparison with alternatives
            st.subheader("📊 Route Comparison")
            comparison_data = {
                "Route Type": ["AI Optimized", "Standard", "Express"],
                "Cost ($)": [route_data['cost'], route_data['cost'] * 1.3, route_data['cost'] * 1.8],
                "Time (days)": [int(route_data['time'].split()[0]), int(route_data['time'].split()[0]) * 1.2, int(route_data['time'].split()[0]) * 0.7],
                "Carbon (tons)": [float(route_data['carbon'].split()[0]), float(route_data['carbon'].split()[0]) * 1.4, float(route_data['carbon'].split()[0]) * 1.1]
            }
            
            comparison_df = pd.DataFrame(comparison_data)
            st.dataframe(comparison_df, use_container_width=True)

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
    st.header("🔐 Zero-Knowledge Proof Demo")
    
    st.markdown("""
    <div class="feature-card">
        <h4>🔒 Privacy-Preserving Verification</h4>
        <p>Zero-Knowledge proofs allow verification of supply chain data without revealing sensitive information. 
        This demo shows how ChainFlow generates and verifies ZK proofs for product authenticity.</p>
    </div>
    """, unsafe_allow_html=True)
    
    # ZK Proof generation
    selected_product = st.selectbox("Select Product for ZK Proof:", [f"{p['name']} ({p['id']})" for p in products])
    
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("🔐 Generate ZK Proof"):
            with st.spinner("Generating zero-knowledge proof..."):
                time.sleep(2)
                
                product_id = selected_product.split("(")[1].split(")")[0]
                proof = generate_zk_proof(product_id)
                
                st.session_state.current_proof = proof
                st.success("✅ ZK Proof generated successfully!")
    
    with col2:
        if st.button("✅ Verify ZK Proof") and 'current_proof' in st.session_state:
            with st.spinner("Verifying proof..."):
                time.sleep(1)
                
                if st.session_state.current_proof['verified']:
                    st.success("🎉 Proof verification successful!")
                else:
                    st.error("❌ Proof verification failed!")
    
    # Display proof details
    if 'current_proof' in st.session_state:
        st.subheader("📋 Proof Details")
        
        proof_details = {
            "Proof Hash": st.session_state.current_proof['proof_hash'],
            "Verification Time": st.session_state.current_proof['verification_time'],
            "Status": "✅ Verified" if st.session_state.current_proof['verified'] else "❌ Invalid",
            "Generated At": st.session_state.current_proof['timestamp']
        }
        
        for key, value in proof_details.items():
            st.write(f"**{key}:** {value}")
    
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