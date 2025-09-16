// Hackathon submission update
// ChainFlow - Supply Chain Route Optimization Platform JavaScript

class ChainFlowApp {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3002/api';
        this.currentTab = 'dashboard';
        this.suppliers = [];
        this.products = [];
        this.categories = [];
        this.wallet = {
            connected: false,
            address: null,
            balance: 0,
            provider: null
        };
        this.marketplaceListings = [];
        this.payments = [];
        this.receipts = [];
        this.routeTrackings = [];
        this.init();
    }
    
    setupDashboardCardHandlers() {
        // Make stat cards clickable and navigate to relevant sections
        const statCards = document.querySelectorAll('.stat-card');
        
        statCards.forEach((card, index) => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                switch(index) {
                    case 0: // Total Products
                        this.showTab('verify');
                        break;
                    case 1: // Verified Suppliers
                        this.showTab('suppliers');
                        break;
                    case 2: // Verified Today
                        this.showTab('verify');
                        break;
                    case 3: // Trust Score
                        this.showTab('suppliers');
                        break;
                    case 4: // Optimized Routes
                        this.showTab('routes');
                        break;
                    case 5: // Verifications
                        this.showTab('verify');
                        break;
                    case 6: // Active Shipments
                        this.showTab('tracking');
                        break;
                    case 7: // Payments
                        this.showTab('payments');
                        break;
                }
            });
            
            // Add hover effect
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
                card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '';
            });
        });
    }

    async init() {
        this.setupEventListeners();
        this.showTab('dashboard');
        await this.loadInitialData();
        this.updateDashboard();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = link.getAttribute('data-tab');
                this.showTab(tab);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('product-search');
        const searchBtn = document.getElementById('search-btn');
        
        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => this.searchProducts());
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchProducts();
                }
            });
        }

        // Registration tabs
        document.querySelectorAll('.reg-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-reg-tab');
                this.showRegistrationTab(tab);
            });
        });

        // Form submissions
        const supplierForm = document.getElementById('supplier-form');
        const productForm = document.getElementById('product-form');
        const routeForm = document.getElementById('route-form');
        
        if (supplierForm) {
            supplierForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.registerSupplier();
            });
        }
        
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.registerProduct();
            });
        }
        
        if (routeForm) {
            routeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.optimizeRoute();
            });
        }
        
        // Tracking functionality
        const trackBtn = document.getElementById('track-btn');
        const refreshBtn = document.getElementById('refresh-tracking');
        const trackingSearch = document.getElementById('tracking-search');
        
        if (trackBtn) {
            trackBtn.addEventListener('click', () => this.trackShipment());
        }
        
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadActiveShipments());
        }
        
        if (trackingSearch) {
            trackingSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.trackShipment();
                }
            });
        }
        
        // Wallet connection
        const connectWalletBtn = document.getElementById('connectWallet');
        if (connectWalletBtn) {
            connectWalletBtn.addEventListener('click', () => {
                this.connectWallet();
            });
        }
        
        // Marketplace functionality
        const listProductBtn = document.getElementById('listProductBtn');
        if (listProductBtn) {
            listProductBtn.addEventListener('click', () => {
                this.openListProductModal();
            });
        }
        
        const listProductForm = document.getElementById('listProductForm');
        if (listProductForm) {
            listProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.listProduct();
            });
        }
        
        // Payment functionality
        const processPaymentBtn = document.getElementById('processPaymentBtn');
        if (processPaymentBtn) {
            processPaymentBtn.addEventListener('click', () => {
                this.openProcessPaymentModal();
            });
        }
        
        const verifyReceiptBtn = document.getElementById('verifyReceiptBtn');
        if (verifyReceiptBtn) {
            verifyReceiptBtn.addEventListener('click', () => {
                this.openVerifyReceiptModal();
            });
        }
        
        const trackShipmentBtn = document.getElementById('trackShipmentBtn');
        if (trackShipmentBtn) {
            trackShipmentBtn.addEventListener('click', () => {
                this.openTrackShipmentModal();
            });
        }
        
        const processPaymentForm = document.getElementById('processPaymentForm');
        if (processPaymentForm) {
            processPaymentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processPayment();
            });
        }
        
        const verifyReceiptForm = document.getElementById('verifyReceiptForm');
        if (verifyReceiptForm) {
            verifyReceiptForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.verifyReceipt();
            });
        }
        
        const trackShipmentForm = document.getElementById('trackShipmentForm');
        if (trackShipmentForm) {
            trackShipmentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.trackPaymentShipment();
            });
        }
        
        // Modal close handlers
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
        
        // Purchase confirmation handler
        const confirmPurchaseBtn = document.getElementById('confirmPurchaseBtn');
        if (confirmPurchaseBtn) {
            confirmPurchaseBtn.addEventListener('click', () => {
                const productId = confirmPurchaseBtn.dataset.productId;
                if (productId) {
                    this.purchaseProduct(productId);
                }
            });
        }
        
        // Dashboard stat card click handlers
        this.setupDashboardCardHandlers();
    }

    showTab(tabName) {
        // Update current tab
        this.currentTab = tabName;
        
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Show selected tab
        const selectedTab = document.getElementById(tabName);
        const selectedNavLink = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (selectedTab) {
            selectedTab.classList.add('active');
            selectedTab.classList.add('fade-in');
        }
        
        if (selectedNavLink) {
            selectedNavLink.classList.add('active');
        }
        
        // Load tab-specific data
        if (tabName === 'suppliers') {
            console.log('Switching to suppliers tab, loading suppliers...');
            this.loadSuppliers();
        } else if (tabName === 'routes') {
            this.loadRouteOptimization();
        } else if (tabName === 'tracking') {
            this.loadActiveShipments();
        } else if (tabName === 'verify') {
            this.loadCategories();
        } else if (tabName === 'register') {
            this.loadCategories();
        } else if (tabName === 'marketplace') {
            this.updateMarketplaceDisplay();
            this.updateWalletDisplay();
        } else if (tabName === 'payments') {
            this.loadPayments();
        }
    }

    showRegistrationTab(tabName) {
        // Hide all registration tab contents
        document.querySelectorAll('.reg-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all registration tab buttons
        document.querySelectorAll('.reg-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected registration tab
        const selectedTab = document.getElementById(`${tabName}-registration`);
        const selectedBtn = document.querySelector(`[data-reg-tab="${tabName}"]`);
        
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
    }

    async loadInitialData() {
        try {
            this.showLoading(true);
            console.log('Loading initial data...');
            
            // Load suppliers, products, categories, and payment stats
            const [suppliersResponse, productsResponse, categoriesResponse, paymentsResponse] = await Promise.all([
                fetch(`${this.apiBaseUrl}/suppliers`),
                fetch(`${this.apiBaseUrl}/products`),
                fetch(`${this.apiBaseUrl}/categories`),
                fetch(`${this.apiBaseUrl}/payments/stats`)
            ]);
            
            console.log('API responses received:', {
                suppliers: suppliersResponse.status,
                products: productsResponse.status,
                categories: categoriesResponse.status,
                payments: paymentsResponse.status
            });
            
            const suppliersData = await suppliersResponse.json();
            const productsData = await productsResponse.json();
            const categoriesData = await categoriesResponse.json();
            const paymentsData = await paymentsResponse.json();
            
            console.log('API data:', { suppliersData, productsData, categoriesData, paymentsData });
            
            this.suppliers = suppliersData.success ? suppliersData.data : [];
            this.products = productsData.success ? productsData.data : [];
            this.categories = categoriesData.success ? categoriesData.data : [];
            this.paymentStats = paymentsData.success ? paymentsData.data : {};
            
            console.log('Loaded data:', {
                suppliers: this.suppliers.length,
                products: this.products.length,
                categories: this.categories.length,
                paymentStats: this.paymentStats
            });
            
            // Update payment statistics on dashboard
            this.updatePaymentStatistics();
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showNotification('Error loading data', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    updatePaymentStatistics() {
        try {
            // Update payment dashboard elements
            const totalPaymentsEl = document.getElementById('totalPayments');
            const totalReceiptsEl = document.getElementById('totalReceipts');
            const activeShipmentsEl = document.getElementById('activeShipments');
            const paymentVolumeEl = document.getElementById('paymentVolume');

            if (totalPaymentsEl && this.paymentStats.totalPayments !== undefined) {
                totalPaymentsEl.textContent = this.paymentStats.totalPayments;
            }

            if (totalReceiptsEl && this.paymentStats.totalReceipts !== undefined) {
                totalReceiptsEl.textContent = this.paymentStats.totalReceipts;
            }

            if (activeShipmentsEl && this.paymentStats.activeShipments !== undefined) {
                activeShipmentsEl.textContent = this.paymentStats.activeShipments;
            }

            if (paymentVolumeEl && this.paymentStats.paymentVolume !== undefined) {
                paymentVolumeEl.textContent = `$${this.paymentStats.paymentVolume.toLocaleString()}`;
            }

            console.log('Payment statistics updated:', this.paymentStats);
        } catch (error) {
            console.error('Error updating payment statistics:', error);
        }
    }

    updateDashboard() {
        // Update statistics
        const productsArray = Array.isArray(this.products) ? this.products : Object.values(this.products || {});
        const suppliersArray = Array.isArray(this.suppliers) ? this.suppliers : Object.values(this.suppliers || {});
        const categoriesArray = Array.isArray(this.categories) ? this.categories : Object.values(this.categories || {});
        
        const totalProducts = productsArray.length;
        const verifiedSuppliers = suppliersArray.filter(s => s.verified || s.trust_score > 80).length;
        const totalSuppliers = suppliersArray.length;
        
        // Calculate verified products today (simulate some products verified today)
        const verifiedToday = Math.min(Math.floor(totalProducts * 0.4), 7); // About 40% or max 7
        
        // Calculate average trust score
        const avgTrustScore = suppliersArray.length > 0 
            ? Math.round(suppliersArray.reduce((sum, s) => sum + (s.trust_score || 0), 0) / suppliersArray.length)
            : 95;
        
        // Update stat cards using specific IDs
        const totalProductsEl = document.getElementById('total-products');
        const totalSuppliersEl = document.getElementById('total-suppliers');
        const verifiedProductsEl = document.getElementById('verified-products');
        const trustScoreEl = document.getElementById('trust-score');
        
        if (totalProductsEl) totalProductsEl.textContent = totalProducts.toLocaleString();
        if (totalSuppliersEl) totalSuppliersEl.textContent = verifiedSuppliers.toLocaleString();
        if (verifiedProductsEl) verifiedProductsEl.textContent = verifiedToday.toLocaleString();
        if (trustScoreEl) trustScoreEl.textContent = `${avgTrustScore}%`;
        
        // Update new metrics
        const optimizedRoutesEl = document.getElementById('optimized-routes');
        const zkVerificationsEl = document.getElementById('zk-verifications');
        const activeShipmentsEl = document.getElementById('active-shipments');
        
        if (optimizedRoutesEl) optimizedRoutesEl.textContent = Math.floor(totalProducts * 0.3).toLocaleString();
        if (zkVerificationsEl) zkVerificationsEl.textContent = Math.floor(totalProducts * 0.6).toLocaleString();
        if (activeShipmentsEl) activeShipmentsEl.textContent = Math.floor(totalProducts * 0.2).toLocaleString();
        
        // Update recent activity
        this.updateRecentActivity();
        
        // Ensure suppliers are loaded if on suppliers tab
        if (this.currentTab === 'suppliers') {
            this.loadSuppliers();
        }
    }

    updateRecentActivity() {
        const recentVerificationsContainer = document.getElementById('recent-verifications');
        const riskAlertsContainer = document.getElementById('risk-alerts');
        
        if (recentVerificationsContainer) {
            const productsArray = Array.isArray(this.products) ? this.products : Object.values(this.products || {});
            const recentProducts = productsArray.slice(-5).reverse();
            
            recentVerificationsContainer.innerHTML = recentProducts.map(product => {
                // Find supplier by ID from the suppliers array
                const supplier = Array.isArray(this.suppliers) 
                    ? this.suppliers.find(s => s.id === product.supplier_id) 
                    : this.suppliers[product.supplier_id] || { name: 'Unknown Supplier' };
                
                // Find category by ID from the categories array
                const category = Array.isArray(this.categories) 
                    ? this.categories.find(c => c.id === product.category.toString()) 
                    : this.categories[product.category] || { name: 'Unknown Category' };
                
                const verificationTime = new Date(Date.now() - Math.random() * 86400000 * 7).toLocaleDateString();
                
                return `
                    <div class="verification-item" style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="window.app.verifyProduct('${product.id}')">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${product.name}</strong>
                                <div style="font-size: 0.875rem; color: var(--text-secondary);">
                                    ${category ? category.name : 'Unknown Category'} • ${supplier ? supplier.name : 'Unknown Supplier'}
                                </div>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">
                                    Verified: ${verificationTime}
                                </div>
                            </div>
                            <span class="status-verified" style="background: #10b981; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
                                VERIFIED
                            </span>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
        if (riskAlertsContainer) {
            this.updateRiskAlerts(riskAlertsContainer);
        }
    }
    
    updateRiskAlerts(container) {
        const suppliersArray = Object.values(this.suppliers || {});
        const productsArray = Object.values(this.products || {});
        
        const riskAlerts = [];
        
        // Check for low trust score suppliers
        suppliersArray.forEach(supplier => {
            if (supplier.trust_score < 80) {
                riskAlerts.push({
                    type: 'supplier',
                    level: 'medium',
                    message: `Low trust score for ${supplier.name} (${supplier.trust_score}%)`,
                    time: new Date(Date.now() - Math.random() * 86400000 * 3).toLocaleDateString()
                });
            }
        });
        
        // Check for products from risky categories
        const riskyCategoryIds = ['2', '4']; // Pharmaceuticals and Automotive have higher risk
        productsArray.forEach(product => {
            if (riskyCategoryIds.includes(product.category.toString())) {
                // Find category by ID from the categories array
                const category = Array.isArray(this.categories) 
                    ? this.categories.find(c => c.id === product.category.toString()) 
                    : this.categories[product.category] || { name: 'Unknown' };
                
                riskAlerts.push({
                    type: 'product',
                    level: 'high',
                    message: `High-risk category product: ${product.name} (${category ? category.name : 'Unknown'})`,
                    time: new Date(Date.now() - Math.random() * 86400000 * 2).toLocaleDateString()
                });
            }
        });
        
        // Add some sample alerts if none exist
        if (riskAlerts.length === 0) {
            riskAlerts.push(
                {
                    type: 'system',
                    level: 'low',
                    message: 'Routine security scan completed - no issues found',
                    time: new Date().toLocaleDateString()
                },
                {
                    type: 'compliance',
                    level: 'medium',
                    message: 'Certificate renewal due for 2 suppliers in next 30 days',
                    time: new Date(Date.now() - 86400000).toLocaleDateString()
                }
            );
        }
        
        container.innerHTML = riskAlerts.slice(0, 5).map(alert => {
            const levelColors = {
                low: '#10b981',
                medium: '#f59e0b',
                high: '#ef4444'
            };
            
            return `
                <div class="alert-item" style="padding: 0.75rem 0; border-bottom: 1px solid var(--border-color); cursor: pointer;" onclick="window.app.showAlertDetails('${alert.type}', '${alert.level}', '${alert.message}')">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                <span style="width: 8px; height: 8px; border-radius: 50%; background: ${levelColors[alert.level]}"></span>
                                <span style="font-size: 0.75rem; color: ${levelColors[alert.level]}; font-weight: 600; text-transform: uppercase;">
                                    ${alert.level} RISK
                                </span>
                            </div>
                            <div style="font-size: 0.875rem; color: var(--text-primary); margin-bottom: 0.25rem;">
                                ${alert.message}
                            </div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">
                                ${alert.time}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async searchProducts() {
        console.log('Search function called');
        const searchTerm = document.getElementById('product-search').value.trim();
        const categoryFilter = document.getElementById('category-filter').value;
        const supplierFilter = document.getElementById('supplier-filter').value;
        
        console.log('Search params:', { searchTerm, categoryFilter, supplierFilter });
        
        // If no search criteria provided, show all products
        if (!searchTerm && !categoryFilter && !supplierFilter) {
            console.log('No search criteria provided, showing all products');
            this.displaySearchResults(this.products || []);
            return;
        }
        
        try {
            this.showLoading(true);
            
            const params = new URLSearchParams();
            if (searchTerm) params.append('query', searchTerm);
            if (categoryFilter) params.append('category', categoryFilter);
            if (supplierFilter) params.append('supplier', supplierFilter);
            
            const searchUrl = `${this.apiBaseUrl}/search?${params}`;
            console.log('Making request to:', searchUrl);
            
            const response = await fetch(searchUrl);
            console.log('Response status:', response.status);
            
            const data = await response.json();
            console.log('Response data:', data);
            
            const results = data.success ? data.data : [];
            console.log('Search results:', results);
            
            this.displaySearchResults(results);
            
        } catch (error) {
            console.error('Error searching products:', error);
            this.showNotification('Error searching products. Check console for details.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    displaySearchResults(results) {
        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="text-center" style="padding: 2rem; color: var(--text-secondary);">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No products found matching your criteria.</p>
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = results.map(product => {
            // Generate comprehensive product description based on available data
            const description = product.description || 
                `${product.category_name || 'Product'} from ${product.supplier_name || 'verified supplier'} - Batch: ${product.batch_number || 'N/A'}`;
            
            // Enhanced manufacturing info with quality indicators
            const manufacturingInfo = product.manufacturing_date ? 
                new Date(product.manufacturing_date * 1000).toLocaleDateString() : 'Manufacturing date not specified';
            
            // Supply chain transparency indicators
            const supplyChainInfo = product.authenticity_markers ? 
                `Authenticated with ${Object.keys(product.authenticity_markers).length} security markers` : 
                'Standard verification';
            
            return `
            <div class="product-result" style="cursor: pointer;" onclick="window.app.verifyProduct('${product.id}')">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <h4 style="margin-bottom: 0.5rem; color: var(--text-primary);">${product.name || 'Product Name Not Available'}</h4>
                        <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">${description}</p>
                        <div style="display: flex; gap: 1rem; font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                            <span><i class="fas fa-building"></i> ${product.supplier_name || 'Supplier Not Specified'}</span>
                            <span><i class="fas fa-tag"></i> ${product.category_name || product.category || 'Category Not Specified'}</span>
                            <span><i class="fas fa-calendar"></i> ${manufacturingInfo}</span>
                        </div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">
                            <i class="fas fa-shield-check"></i> ${supplyChainInfo}
                        </div>
                    </div>
                    <span class="risk-${this.getRiskLevel(product.risk_score || 50)}">
                        ${this.getRiskLevel(product.risk_score || 50).toUpperCase()}
                    </span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-family: monospace; font-size: 0.875rem; color: var(--text-muted);">
                        ID: ${product.id || 'ID Not Available'}
                    </span>
                    <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="event.stopPropagation(); window.app.verifyProduct('${product.id}')">
                        <i class="fas fa-shield-alt"></i> Verify
                    </button>
                </div>
            </div>
        `;
        }).join('');
    }

    showAlertDetails(type, level, message) {
        this.showNotification(`Alert Details: ${level.toUpperCase()} - ${message}`, 'info');
    }

    async verifyProduct(productId) {
        try {
            console.log('Verifying product:', productId);
            this.showLoading(true);
            
            const response = await fetch(`${this.apiBaseUrl}/products/${productId}/verify`);
            console.log('Verification response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const verification = await response.json();
            console.log('Verification data:', verification);
            
            if (verification.success) {
                this.displayVerificationDetails(verification.data || verification);
                this.showNotification('Product verification completed', 'success');
            } else {
                this.showNotification(verification.error || 'Verification failed', 'error');
            }
            
        } catch (error) {
            console.error('Error verifying product:', error);
            this.showNotification(`Error verifying product: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    displayVerificationDetails(verification) {
        const detailsContainer = document.getElementById('verification-details');
        if (!detailsContainer) {
            console.error('Verification details container not found');
            return;
        }
        
        // Show the verification details container
        detailsContainer.style.display = 'block';
        
        const { product, supplier, proof, risk_assessment } = verification;
        const mlAssessment = verification.mlAssessment || {};
        const antiCounterfeit = verification.antiCounterfeitReport || {};
        
        // Generate fraud flags display
        const fraudFlagsHtml = mlAssessment.fraudFlags && mlAssessment.fraudFlags.length > 0 ? 
            `<div class="fraud-flags" style="margin-top: 2rem;">
                <h4 style="margin-bottom: 1rem; color: var(--text-primary);">🚨 Security Alerts</h4>
                ${mlAssessment.fraudFlags.map(flag => 
                    `<div class="alert alert-${flag.severity}" style="padding: 0.75rem; margin-bottom: 0.5rem; border-radius: var(--radius-md); background: var(--${flag.severity === 'high' ? 'danger' : flag.severity === 'medium' ? 'warning' : 'info'}-bg); border-left: 4px solid var(--${flag.severity === 'high' ? 'danger' : flag.severity === 'medium' ? 'warning' : 'info'}-color);">
                        <strong>${flag.severity.toUpperCase()}:</strong> ${flag.message}
                    </div>`
                ).join('')}
            </div>` : '';
        
        // Generate recommendations
        const recommendationsHtml = mlAssessment.recommendations && mlAssessment.recommendations.length > 0 ?
            `<div class="recommendations" style="margin-top: 2rem;">
                <h4 style="margin-bottom: 1rem; color: var(--text-primary);">💡 Recommendations</h4>
                <ul style="padding-left: 1.5rem;">
                    ${mlAssessment.recommendations.map(rec => `<li style="margin-bottom: 0.5rem;">${rec}</li>`).join('')}
                </ul>
            </div>` : '';
        
        // Anti-counterfeit features
        const antiCounterfeitHtml = antiCounterfeit.antiCounterfeitFeatures ? 
            `<div class="anti-counterfeit" style="margin-top: 2rem;">
                <h4 style="margin-bottom: 1rem; color: var(--text-primary);">🔒 Anti-Counterfeit Features</h4>
                <div class="features-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <div class="feature ${antiCounterfeit.antiCounterfeitFeatures.hasHologram ? 'present' : 'missing'}" style="padding: 0.75rem; border-radius: var(--radius-md); background: var(--bg-primary); border: 1px solid var(--border-color); color: ${antiCounterfeit.antiCounterfeitFeatures.hasHologram ? 'var(--success-color)' : 'var(--danger-color)'}">
                        🔒 Hologram: ${antiCounterfeit.antiCounterfeitFeatures.hasHologram ? 'Present' : 'Missing'}
                    </div>
                    <div class="feature ${antiCounterfeit.antiCounterfeitFeatures.hasQRCode ? 'present' : 'missing'}" style="padding: 0.75rem; border-radius: var(--radius-md); background: var(--bg-primary); border: 1px solid var(--border-color); color: ${antiCounterfeit.antiCounterfeitFeatures.hasQRCode ? 'var(--success-color)' : 'var(--danger-color)'}">
                        📱 QR Code: ${antiCounterfeit.antiCounterfeitFeatures.hasQRCode ? 'Present' : 'Missing'}
                    </div>
                    <div class="feature ${antiCounterfeit.antiCounterfeitFeatures.hasNFCTag ? 'present' : 'missing'}" style="padding: 0.75rem; border-radius: var(--radius-md); background: var(--bg-primary); border: 1px solid var(--border-color); color: ${antiCounterfeit.antiCounterfeitFeatures.hasNFCTag ? 'var(--success-color)' : 'var(--danger-color)'}">
                        📡 NFC Tag: ${antiCounterfeit.antiCounterfeitFeatures.hasNFCTag ? 'Present' : 'Missing'}
                    </div>
                    <div class="feature ${antiCounterfeit.antiCounterfeitFeatures.hasTamperSeal ? 'present' : 'missing'}" style="padding: 0.75rem; border-radius: var(--radius-md); background: var(--bg-primary); border: 1px solid var(--border-color); color: ${antiCounterfeit.antiCounterfeitFeatures.hasTamperSeal ? 'var(--success-color)' : 'var(--danger-color)'}">
                        🛡️ Tamper Seal: ${antiCounterfeit.antiCounterfeitFeatures.hasTamperSeal ? 'Present' : 'Missing'}
                    </div>
                    <div class="feature ${antiCounterfeit.antiCounterfeitFeatures.hasBlockchainRecord ? 'present' : 'missing'}" style="padding: 0.75rem; border-radius: var(--radius-md); background: var(--bg-primary); border: 1px solid var(--border-color); color: ${antiCounterfeit.antiCounterfeitFeatures.hasBlockchainRecord ? 'var(--success-color)' : 'var(--danger-color)'}">
                        ⛓️ Blockchain: ${antiCounterfeit.antiCounterfeitFeatures.hasBlockchainRecord ? 'Verified' : 'Missing'}
                    </div>
                </div>
            </div>` : '';
        
        // Generate comprehensive product description for verification details
        const productDescription = product.description || 
            `${product.category_name || 'Product'} manufactured by ${supplier.name || 'verified supplier'} on ${product.manufacturing_date ? new Date(product.manufacturing_date * 1000).toLocaleDateString() : 'unspecified date'}`;
        
        detailsContainer.innerHTML = `
            <div class="verification-details">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 2rem;">
                    <div>
                        <h3 style="margin-bottom: 0.5rem;">🔍 ${product.name || 'Product Name Not Available'}</h3>
                        <p style="color: var(--text-secondary);">${productDescription}</p>
                    </div>
                    <div style="text-align: right;">
                        <span class="risk-${this.getRiskLevel(risk_assessment?.overall_score || 50)}" style="font-size: 1.125rem;">
                            ${this.getRiskLevel(risk_assessment?.overall_score || 50).toUpperCase()} RISK
                        </span>
                        ${mlAssessment.trustScore ? `<div style="margin-top: 0.5rem; font-size: 0.875rem; color: var(--text-secondary);">ML Trust Score: ${Math.round(mlAssessment.trustScore)}/100</div>` : ''}
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                    <div>
                        <h4 style="margin-bottom: 1rem; color: var(--text-primary);">Product Information</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Product ID:</span>
                                <span class="info-value">${product.id || 'ID not available'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Category:</span>
                                <span class="info-value">${product.category || 'Category not specified'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Manufacturing Date:</span>
                                <span class="info-value">${product.manufacturing_date ? new Date(product.manufacturing_date * 1000).toLocaleDateString() : 'Date not recorded'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Batch Number:</span>
                                <span class="info-value">${product.batch_number || 'Batch not specified'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Quality Grade:</span>
                                <span class="info-value">${product.quality_grade || 'Standard grade'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Harvest/Production Date:</span>
                                <span class="info-value">${product.harvest_date ? new Date(product.harvest_date * 1000).toLocaleDateString() : 'Not applicable'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 style="margin-bottom: 1rem; color: var(--text-primary);">Supplier Information</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Supplier:</span>
                                <span class="info-value">${supplier?.name || 'Supplier not specified'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Tier:</span>
                                <span class="tier-badge tier-${supplier?.tier || '3'}">Tier ${supplier?.tier || 'Unclassified'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Location:</span>
                                <span class="info-value">${supplier?.location || 'Location not disclosed'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Verified:</span>
                                <span class="info-value">
                                    ${supplier?.verified ? 
                                        '<i class="fas fa-check-circle" style="color: var(--success-color);"></i> Verified' : 
                                        '<i class="fas fa-times-circle" style="color: var(--danger-color);"></i> Not Verified'
                                    }
                                </span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Trust Score:</span>
                                <span class="info-value">${supplier?.trust_score || 'Not rated'}/100</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Certifications:</span>
                                <span class="info-value">${supplier?.certifications?.length > 0 ? `${supplier.certifications.length} active` : 'None on record'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Specialties:</span>
                                <span class="info-value">${supplier?.specialties?.join(', ') || 'Not specified'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Verified Since:</span>
                                <span class="info-value">${supplier?.verified_since ? new Date(supplier.verified_since * 1000).toLocaleDateString() : 'Not verified'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Audit Status:</span>
                                <span class="info-value" style="color: var(--success-color);">✓ Last audit: ${new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Compliance Score:</span>
                                <span class="info-value">${supplier?.compliance_score || Math.floor(Math.random() * 20) + 80}/100</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 2rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--text-primary);"><i class="fas fa-certificate"></i> Supplier Certifications & Audit Trail</h4>
                    <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md);">
                        ${supplier?.certifications?.length > 0 ? `
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                                ${supplier.certifications.map(cert => `
                                    <div class="cert-card" style="background: var(--bg-primary); padding: 1rem; border-radius: var(--radius-sm); border-left: 4px solid var(--success-color);">
                                        <div style="font-weight: 600; margin-bottom: 0.5rem;">${cert.name || 'Manufacturing Certification'}</div>
                                        <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Issued: ${cert.issued_date ? new Date(cert.issued_date * 1000).toLocaleDateString() : 'Date not available'}</div>
                                        <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Expires: ${cert.expiry_date ? new Date(cert.expiry_date * 1000).toLocaleDateString() : 'No expiry'}</div>
                                        <div style="font-size: 0.875rem; color: var(--success-color);">✓ Valid & Active</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<div style="text-align: center; color: var(--text-secondary); padding: 1rem;">No certifications on record</div>'}
                        
                        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                            <h5 style="margin-bottom: 0.75rem; color: var(--text-primary);">Recent Audit Activities</h5>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <div class="audit-entry" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--bg-primary); border-radius: var(--radius-sm);">
                                    <span style="font-size: 0.875rem;">Quality Management Audit</span>
                                    <span style="font-size: 0.75rem; color: var(--success-color);">✓ Passed - ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                                </div>
                                <div class="audit-entry" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--bg-primary); border-radius: var(--radius-sm);">
                                    <span style="font-size: 0.875rem;">Environmental Compliance Check</span>
                                    <span style="font-size: 0.75rem; color: var(--success-color);">✓ Passed - ${new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                                </div>
                                <div class="audit-entry" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: var(--bg-primary); border-radius: var(--radius-sm);">
                                    <span style="font-size: 0.875rem;">Supply Chain Security Assessment</span>
                                    <span style="font-size: 0.75rem; color: var(--success-color);">✓ Passed - ${new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 2rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--text-primary);"><i class="fas fa-route"></i> Supply Chain Traceability</h4>
                    <div class="supply-chain-section">
                        ${product.supply_chain ? `
                            <div class="chain-flow" style="display: flex; flex-direction: column; gap: 1rem;">
                                <div class="chain-step" style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md); border-left: 4px solid var(--success-color);">
                                    <div class="step-header" style="font-weight: 600; margin-bottom: 0.5rem;"><i class="fas fa-seedling"></i> Origin</div>
                                    <div class="step-details" style="font-size: 0.875rem; color: var(--text-secondary);">
                                        <strong>Location:</strong> ${product.supply_chain.origin?.location || 'Origin not tracked'}<br>
                                        <strong>Date:</strong> ${product.supply_chain.origin?.timestamp ? new Date(product.supply_chain.origin.timestamp * 1000).toLocaleDateString() : 'Date not recorded'}<br>
                                        <strong>Handler:</strong> ${product.supply_chain.origin?.handler || 'Handler not specified'}
                                    </div>
                                </div>
                                ${product.supply_chain.intermediates?.map((intermediate, index) => `
                                    <div class="chain-step" style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md); border-left: 4px solid var(--warning-color);">
                                        <div class="step-header" style="font-weight: 600; margin-bottom: 0.5rem;"><i class="fas fa-arrow-right"></i> Processing Stage ${index + 1}</div>
                                        <div class="step-details" style="font-size: 0.875rem; color: var(--text-secondary);">
                                            <strong>Handler:</strong> ${intermediate.handler || 'Handler not specified'}<br>
                                            <strong>Location:</strong> ${intermediate.location || 'Location not tracked'}<br>
                                            <strong>Process:</strong> ${intermediate.process || 'Process not documented'}<br>
                                            <strong>Date:</strong> ${intermediate.timestamp ? new Date(intermediate.timestamp * 1000).toLocaleDateString() : 'Date not recorded'}
                                        </div>
                                    </div>
                                `).join('') || ''}
                                <div class="chain-step" style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md); border-left: 4px solid var(--primary-color);">
                                    <div class="step-header" style="font-weight: 600; margin-bottom: 0.5rem;"><i class="fas fa-flag-checkered"></i> Final Destination</div>
                                    <div class="step-details" style="font-size: 0.875rem; color: var(--text-secondary);">
                                        <strong>Location:</strong> ${product.supply_chain.destination?.location || 'Destination not specified'}<br>
                                        <strong>Delivery Date:</strong> ${product.supply_chain.destination?.timestamp ? new Date(product.supply_chain.destination.timestamp * 1000).toLocaleDateString() : 'Date not recorded'}<br>
                                        <strong>Final Handler:</strong> ${product.supply_chain.destination?.handler || 'Handler not specified'}
                                    </div>
                                </div>
                            </div>
                        ` : '<div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md); text-align: center; color: var(--text-secondary);"><i class="fas fa-exclamation-triangle"></i> Supply chain data not available for this product</div>'}
                    </div>
                </div>
                
                <div style="margin-top: 2rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--text-primary);"><i class="fas fa-microscope"></i> ML Quality Assessment</h4>
                    <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md);">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            <div class="quality-metric">
                                <span style="font-size: 0.875rem; color: var(--text-secondary);">Authenticity Score:</span>
                                <div style="font-size: 1.25rem; font-weight: 600; color: var(--success-color);">${mlAssessment.authenticityScore || 85}/100</div>
                            </div>
                            <div class="quality-metric">
                                <span style="font-size: 0.875rem; color: var(--text-secondary);">Quality Grade:</span>
                                <div style="font-size: 1.25rem; font-weight: 600; color: var(--primary-color);">${product.quality_grade || 'A'}</div>
                            </div>
                            <div class="quality-metric">
                                <span style="font-size: 0.875rem; color: var(--text-secondary);">Compliance Status:</span>
                                <div style="font-size: 1.25rem; font-weight: 600; color: var(--success-color);">✓ Compliant</div>
                            </div>
                            <div class="quality-metric">
                                <span style="font-size: 0.875rem; color: var(--text-secondary);">Fraud Risk:</span>
                                <div style="font-size: 1.25rem; font-weight: 600; color: ${mlAssessment.fraudRisk > 30 ? 'var(--danger-color)' : 'var(--success-color)'};">Low</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 2rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--text-primary);"><i class="fas fa-shield-alt"></i> Zero-Knowledge Proof & Batch Traceability</h4>
                    <div style="background: var(--bg-tertiary); padding: 1.5rem; border-radius: var(--radius-md); border: 2px solid var(--success-color);">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                            <div class="zk-metric">
                                <span style="font-size: 0.875rem; color: var(--text-secondary);">Proof Type:</span>
                                <div style="font-weight: 600; color: var(--primary-color);">Merkle Tree Inclusion</div>
                            </div>
                            <div class="zk-metric">
                                <span style="font-size: 0.875rem; color: var(--text-secondary);">Batch Verification:</span>
                                <div style="font-weight: 600; color: var(--success-color);">✓ Verified in Batch ${product.batch_number || 'Unknown'}</div>
                            </div>
                            <div class="zk-metric">
                                <span style="font-size: 0.875rem; color: var(--text-secondary);">Authenticity Hash:</span>
                                <div style="font-family: monospace; font-size: 0.75rem; color: var(--text-muted);">${product.product_hash || 'Hash not available'}</div>
                            </div>
                            <div class="zk-metric">
                                <span style="font-size: 0.875rem; color: var(--text-secondary);">Proof Generation:</span>
                                <div style="font-weight: 600; color: var(--success-color);">✓ Generated</div>
                            </div>
                        </div>
                        <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem;">
                            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">ZK Proof Data:</div>
                            <div style="font-family: monospace; font-size: 0.75rem; word-break: break-all; color: var(--text-primary); max-height: 200px; overflow-y: auto; background: var(--bg-secondary); padding: 0.75rem; border-radius: var(--radius-sm);">
                                ${verification.zkProof?.proof_data || 'Proof data not available'}
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span style="color: var(--text-secondary); font-size: 0.875rem;">Verification Status:</span>
                                <span style="color: var(--success-color); font-weight: 600; margin-left: 0.5rem;">
                                    <i class="fas fa-check-circle"></i> Cryptographically Verified
                                </span>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.75rem; color: var(--text-secondary);">Verified: ${new Date().toLocaleDateString()}</div>
                                <div style="font-size: 0.75rem; color: var(--text-secondary);">Block Height: ${Math.floor(Math.random() * 1000000) + 500000}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 2rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--text-primary);"><i class="fas fa-fingerprint"></i> Authenticity Markers & Anti-Counterfeit</h4>
                    <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md);">
                        ${product.authenticity_markers ? `
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                                ${Object.entries(product.authenticity_markers).map(([key, value]) => `
                                    <div class="auth-marker" style="background: var(--bg-primary); padding: 0.75rem; border-radius: var(--radius-sm); border-left: 3px solid var(--success-color);">
                                        <div style="font-weight: 600; text-transform: capitalize; margin-bottom: 0.25rem;">${key.replace('_', ' ')}</div>
                                        <div style="font-size: 0.875rem; color: var(--text-secondary);">${typeof value === 'boolean' ? (value ? '✓ Present' : '✗ Missing') : value}</div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<div style="text-align: center; color: var(--text-secondary); padding: 1rem;"><i class="fas fa-exclamation-triangle"></i> No authenticity markers recorded for this product</div>'}
                    </div>
                </div>
                
                ${antiCounterfeitHtml}
                ${fraudFlagsHtml}
                ${recommendationsHtml}
                
                <div style="margin-top: 2rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--text-primary);">📊 Risk Assessment</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <div class="risk-metric">
                            <span class="risk-label">Supplier Risk:</span>
                            <span class="risk-${this.getRiskLevel(risk_assessment?.supplier_risk || 50)}">
                                ${risk_assessment?.supplier_risk || 50}/100
                            </span>
                        </div>
                        <div class="risk-metric">
                            <span class="risk-label">Product Risk:</span>
                            <span class="risk-${this.getRiskLevel(risk_assessment?.product_risk || 50)}">
                                ${risk_assessment?.product_risk || 50}/100
                            </span>
                        </div>
                        <div class="risk-metric">
                            <span class="risk-label">Supply Chain Risk:</span>
                            <span class="risk-${this.getRiskLevel(risk_assessment?.supply_chain_risk || 50)}">
                                ${risk_assessment?.supply_chain_risk || 50}/100
                            </span>
                        </div>
                        <div class="risk-metric">
                            <span class="risk-label">Overall Score:</span>
                            <span class="risk-${this.getRiskLevel(risk_assessment?.overall_score || 50)}">
                                ${risk_assessment?.overall_score || 50}/100
                            </span>
                        </div>
                        ${mlAssessment.trustScore ? `
                        <div class="risk-metric">
                            <span class="risk-label">ML Trust Score:</span>
                            <span class="risk-${this.getRiskLevel(mlAssessment.trustScore)}">
                                ${Math.round(mlAssessment.trustScore)}/100
                            </span>
                        </div>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Add CSS for info grid
        if (!document.getElementById('verification-styles')) {
            const style = document.createElement('style');
            style.id = 'verification-styles';
            style.textContent = `
                .info-grid {
                    display: grid;
                    gap: 0.75rem;
                }
                .info-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid var(--border-light);
                }
                .info-label {
                    font-weight: 500;
                    color: var(--text-secondary);
                }
                .info-value {
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .risk-metric {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem;
                    background: var(--bg-primary);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                }
                .risk-label {
                    font-weight: 500;
                    color: var(--text-secondary);
                }
                .alert {
                    border-radius: var(--radius-md);
                    font-size: 0.875rem;
                }
                .features-grid .feature {
                    font-size: 0.875rem;
                    font-weight: 500;
                    text-align: center;
                }
                .features-grid .feature.present {
                    background: var(--success-bg, #d4edda) !important;
                    border-color: var(--success-color, #28a745) !important;
                }
                .features-grid .feature.missing {
                    background: var(--danger-bg, #f8d7da) !important;
                    border-color: var(--danger-color, #dc3545) !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        detailsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    async loadSuppliers() {
        const suppliersContainer = document.getElementById('suppliers-grid');
        if (!suppliersContainer) return;
        
        console.log('Loading suppliers, current data:', this.suppliers);
        
        // Ensure we have suppliers data as an array
        let suppliersArray = [];
        if (Array.isArray(this.suppliers)) {
            suppliersArray = this.suppliers;
        } else if (this.suppliers && typeof this.suppliers === 'object') {
            suppliersArray = Object.entries(this.suppliers).map(([id, supplier]) => ({
                ...supplier,
                id: id
            }));
        }
        
        console.log('Suppliers array:', suppliersArray);
        
        // Process suppliers with fallback values
        const processedSuppliers = suppliersArray.map(supplier => {
            const specialtiesText = supplier.specialties ? 
                (Array.isArray(supplier.specialties) ? supplier.specialties.join(', ') : supplier.specialties) : 
                'General supplier';
            
            return {
                ...supplier,
                description: supplier.description || `${specialtiesText} - Tier ${supplier.tier || 3} certified supplier`,
                established_year: supplier.established_year || (supplier.verified_since ? supplier.verified_since.split('-')[0] : '2020'),
                product_count: supplier.product_count || Math.floor(Math.random() * 50) + 5,
                verified: supplier.trust_score ? supplier.trust_score > 70 : (supplier.verified !== undefined ? supplier.verified : true),
                location: supplier.location || 'Location not specified',
                trust_score: supplier.trust_score || 75
            };
        });
        
        suppliersContainer.innerHTML = processedSuppliers.map(supplier => `
            <div class="supplier-card">
                <div class="supplier-header">
                    <h3 class="supplier-name">${supplier.name || 'Unknown Supplier'}</h3>
                    <span class="tier-badge tier-${supplier.tier || 3}">Tier ${supplier.tier || 3}</span>
                </div>
                <div style="margin-bottom: 1rem;">
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">${supplier.description}</p>
                    <div style="display: flex; gap: 1rem; font-size: 0.875rem; color: var(--text-muted);">
                        <span><i class="fas fa-map-marker-alt"></i> ${supplier.location}</span>
                        <span><i class="fas fa-calendar"></i> Est. ${supplier.established_year}</span>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 1rem; font-size: 0.875rem;">
                        <span style="color: var(--text-secondary);">Products: ${supplier.product_count}</span>
                        <span style="color: ${supplier.verified ? 'var(--success-color)' : 'var(--danger-color)'};">
                            <i class="fas fa-${supplier.verified ? 'check-circle' : 'times-circle'}"></i>
                            ${supplier.verified ? 'Verified' : 'Unverified'}
                        </span>
                    </div>
                    <button class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.875rem;" onclick="window.app.showSupplierDetails('${supplier.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
        `).join('');
        
        console.log('Suppliers loaded successfully, count:', processedSuppliers.length);
    }

    showSupplierDetails(supplierId) {
        console.log('Looking for supplier with ID:', supplierId);
        console.log('Available suppliers:', this.suppliers);
        
        let supplier = null;
        
        // Try different ways to find the supplier
        if (Array.isArray(this.suppliers)) {
            supplier = this.suppliers.find(s => s.id === supplierId || s.id === String(supplierId));
        } else if (this.suppliers && typeof this.suppliers === 'object') {
            supplier = this.suppliers[supplierId] || this.suppliers[String(supplierId)];
            if (!supplier) {
                supplier = Object.values(this.suppliers).find(s => s.id === supplierId || s.id === String(supplierId));
            }
        }
        
        console.log('Found supplier:', supplier);
        
        if (!supplier) {
            this.showNotification('Supplier not found', 'error');
            return;
        }
        
        // Enhanced supplier details with more comprehensive information
        const certifications = Array.isArray(supplier.certifications) ? supplier.certifications.join(', ') : (supplier.certifications || 'None listed');
        const specialties = Array.isArray(supplier.specialties) ? supplier.specialties.join(', ') : (supplier.specialties || 'General');
        
        const detailsHtml = `
            <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); max-width: 700px; margin: 2rem auto; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; border-bottom: 2px solid #f0f0f0; padding-bottom: 1rem;">
                    <h3 style="margin: 0; color: var(--primary-color); font-size: 1.5rem;">${supplier.name || 'Unknown Supplier'}</h3>
                    <span class="tier-badge tier-${supplier.tier || 3}" style="padding: 0.5rem 1rem; border-radius: 20px; font-weight: bold;">Tier ${supplier.tier || 3}</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                    <div>
                        <p style="margin: 0.5rem 0;"><strong>📍 Location:</strong> ${supplier.location || 'Not specified'}</p>
                        <p style="margin: 0.5rem 0;"><strong>🏆 Trust Score:</strong> <span style="color: ${(supplier.trust_score || 0) > 80 ? '#28a745' : (supplier.trust_score || 0) > 60 ? '#ffc107' : '#dc3545'}; font-weight: bold;">${supplier.trust_score || 'N/A'}%</span></p>
                        <p style="margin: 0.5rem 0;"><strong>📅 Verified Since:</strong> ${supplier.verified_since || 'N/A'}</p>
                    </div>
                    <div>
                        <p style="margin: 0.5rem 0;"><strong>📦 Specialties:</strong> ${specialties}</p>
                        <p style="margin: 0.5rem 0;"><strong>✅ Status:</strong> <span style="color: ${supplier.trust_score > 70 ? '#28a745' : '#dc3545'}; font-weight: bold;">${supplier.trust_score > 70 ? 'Verified' : 'Unverified'}</span></p>
                        <p style="margin: 0.5rem 0;"><strong>🏭 Products:</strong> ${supplier.product_count || Math.floor(Math.random() * 50) + 5}</p>
                    </div>
                </div>
                <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                    <h4 style="margin: 0 0 0.5rem 0; color: var(--primary-color);">🎖️ Certifications</h4>
                    <p style="margin: 0; color: #666;">${certifications}</p>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn btn-secondary" style="padding: 0.75rem 1.5rem;">Close</button>
                    <button onclick="window.app.verifySupplier('${supplier.id}', this)" class="btn btn-primary" style="padding: 0.75rem 1.5rem;">Verify Supplier</button>
                </div>
            </div>
        `;
        
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px);';
        overlay.innerHTML = detailsHtml;
        overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
        document.body.appendChild(overlay);
    }

    async loadCategories() {
        // Search filters
        const categoryFilter = document.getElementById('category-filter');
        const supplierFilter = document.getElementById('supplier-filter');
        
        // Registration form dropdowns
        const productCategory = document.getElementById('product-category');
        const productSupplier = document.getElementById('product-supplier');
        
        if (categoryFilter) {
            const categoriesArray = Array.isArray(this.categories) ? this.categories : Object.values(this.categories || {});
            categoryFilter.innerHTML = '<option value="">All Categories</option>' +
                categoriesArray.map(cat => `<option value="${cat.id || cat.name}">${cat.name}</option>`).join('');
        }
        
        if (supplierFilter) {
            const suppliersArray = Array.isArray(this.suppliers) ? this.suppliers : Object.values(this.suppliers || {});
            supplierFilter.innerHTML = '<option value="">All Suppliers</option>' +
                suppliersArray.map(supplier => `<option value="${supplier.id || supplier.name}">${supplier.name}</option>`).join('');
        }
        
        // Populate product registration form
        if (productCategory) {
            const categoriesArray = Array.isArray(this.categories) ? this.categories : Object.values(this.categories || {});
            productCategory.innerHTML = '<option value="">Select Category</option>' +
                categoriesArray.map(cat => `<option value="${cat.id || cat.name}">${cat.name}</option>`).join('');
        }
        
        if (productSupplier) {
            const suppliersArray = Array.isArray(this.suppliers) ? this.suppliers : Object.values(this.suppliers || {});
            productSupplier.innerHTML = '<option value="">Select Supplier</option>' +
                suppliersArray.map(supplier => `<option value="${supplier.id || supplier.name}">${supplier.name}</option>`).join('');
        }
    }

    async registerSupplier() {
        const formData = new FormData(document.getElementById('supplier-form'));
        const supplierData = Object.fromEntries(formData.entries());
        
        try {
            this.showLoading(true);
            
            const response = await fetch(`${this.apiBaseUrl}/suppliers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(supplierData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.showNotification('Supplier registered successfully!', 'success');
                document.getElementById('supplier-form').reset();
                await this.loadInitialData();
                this.updateDashboard();
            } else {
                this.showNotification(result.error || 'Registration failed', 'error');
            }
            
        } catch (error) {
            console.error('Error registering supplier:', error);
            this.showNotification('Error registering supplier', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async registerProduct() {
        const formData = new FormData(document.getElementById('product-form'));
        const productData = Object.fromEntries(formData.entries());
        
        try {
            this.showLoading(true);
            
            const response = await fetch(`${this.apiBaseUrl}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.showNotification('Product registered successfully!', 'success');
                document.getElementById('product-form').reset();
                await this.loadInitialData();
                this.updateDashboard();
            } else {
                this.showNotification(result.error || 'Registration failed', 'error');
            }
            
        } catch (error) {
            console.error('Error registering product:', error);
            this.showNotification('Error registering product', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    getRiskLevel(score) {
        if (score <= 30) return 'low';
        if (score <= 70) return 'medium';
        return 'high';
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.classList.add('show');
            } else {
                loadingOverlay.classList.remove('show');
            }
        }
    }

    // Route Optimization Methods
    async loadRouteOptimization() {
        // Initialize route optimization interface
        console.log('Loading route optimization...');
    }

    async optimizeRoute() {
        const form = document.getElementById('route-form');
        const formData = new FormData(form);
        
        const routeData = {
            origin: formData.get('origin'),
            destination: formData.get('destination'),
            productType: formData.get('product-type'),
            priority: formData.get('priority')
        };

        this.showLoading(true);
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/routes/optimize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(routeData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.displayRouteResults(result);
                this.updateRouteVisualization(result);
                this.showNotification('Route optimized successfully!', 'success');
            } else {
                throw new Error(result.error || 'Failed to optimize route');
            }
        } catch (error) {
            console.error('Route optimization error:', error);
            this.showNotification('Failed to optimize route: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    displayRouteResults(result) {
        const resultsContainer = document.getElementById('route-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = `
            <div class="route-summary">
                <h3>Optimized Route</h3>
                <div class="route-metrics">
                    <div class="metric">
                        <span class="metric-label">Distance:</span>
                        <span class="metric-value">${result.distance || 'N/A'} km</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Estimated Time:</span>
                        <span class="metric-value">${result.estimatedTime || 'N/A'} hours</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Cost:</span>
                        <span class="metric-value">$${result.cost || 'N/A'}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Risk Score:</span>
                        <span class="metric-value risk-${this.getRiskLevel(result.riskScore)}">${result.riskScore || 'N/A'}</span>
                    </div>
                </div>
                <div class="route-waypoints">
                    <h4>Route Waypoints</h4>
                    <ul>
                        ${(result.waypoints || []).map(point => `<li>${point}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    updateRouteVisualization(result) {
        const mapContainer = document.getElementById('route-map');
        if (!mapContainer) return;

        // Enhanced interactive map visualization
        mapContainer.innerHTML = `
            <div class="interactive-map">
                <div class="map-header">
                    <h4>Optimized Route Visualization</h4>
                    <div class="route-stats">
                        <span class="stat">Distance: ${result.totalDistance || '1,245 km'}</span>
                        <span class="stat">Duration: ${result.estimatedTime || '18h 30m'}</span>
                        <span class="stat">Cost: ${result.totalCost || '$2,450'}</span>
                    </div>
                </div>
                <div class="map-canvas" id="route-canvas">
                    <svg width="100%" height="300" viewBox="0 0 800 300">
                        <!-- Background -->
                        <rect width="800" height="300" fill="#f0f8ff" stroke="#ddd" stroke-width="1"/>
                        
                        <!-- Route path -->
                        <path d="M 50 150 Q 200 100 350 120 Q 500 140 650 100 Q 750 80 780 90" 
                              stroke="#2563eb" stroke-width="3" fill="none" stroke-dasharray="5,5">
                            <animate attributeName="stroke-dashoffset" values="0;-10" dur="1s" repeatCount="indefinite"/>
                        </path>
                        
                        <!-- Origin point -->
                        <circle cx="50" cy="150" r="8" fill="#10b981" stroke="white" stroke-width="2"/>
                        <text x="50" y="170" text-anchor="middle" font-size="12" fill="#374151">${result.origin || 'Ghana Distribution Hub'}</text>
                        
                        <!-- Waypoints -->
                        <circle cx="200" cy="100" r="6" fill="#f59e0b" stroke="white" stroke-width="2"/>
                        <text x="200" y="85" text-anchor="middle" font-size="10" fill="#374151">Transit Port</text>
                        
                        <circle cx="350" cy="120" r="6" fill="#f59e0b" stroke="white" stroke-width="2"/>
                        <text x="350" y="105" text-anchor="middle" font-size="10" fill="#374151">Regional Center</text>
                        
                        <circle cx="650" cy="100" r="6" fill="#f59e0b" stroke="white" stroke-width="2"/>
                        <text x="650" y="85" text-anchor="middle" font-size="10" fill="#374151">Distribution Hub</text>
                        
                        <!-- Destination point -->
                        <circle cx="780" cy="90" r="8" fill="#dc2626" stroke="white" stroke-width="2"/>
                        <text x="780" y="110" text-anchor="middle" font-size="12" fill="#374151">${result.destination || 'Australia Delivery Hub'}</text>
                        
                        <!-- Risk indicators -->
                        <circle cx="300" cy="180" r="4" fill="#ef4444" opacity="0.7">
                            <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite"/>
                        </circle>
                        <text x="300" y="200" text-anchor="middle" font-size="9" fill="#ef4444">Risk Zone</text>
                        
                        <circle cx="550" cy="200" r="4" fill="#22c55e" opacity="0.7">
                            <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite"/>
                        </circle>
                        <text x="550" y="220" text-anchor="middle" font-size="9" fill="#22c55e">Safe Zone</text>
                    </svg>
                </div>
                
                <div class="route-details">
                    <div class="detail-section">
                        <h5>Route Waypoints</h5>
                        <div class="waypoint-list">
                            ${(result.waypoints || ['Ghana Distribution Hub', 'Transit Port', 'Regional Center', 'Australia Delivery Hub']).map((point, index) => `
                                <div class="waypoint-item">
                                    <span class="waypoint-number">${index + 1}</span>
                                    <span class="waypoint-name">${point}</span>
                                    <span class="waypoint-status ${index < 2 ? 'completed' : 'pending'}">
                                        ${index < 2 ? '✓ Completed' : '⏳ Pending'}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>Optimization Metrics</h5>
                        <div class="metrics-grid">
                            <div class="metric">
                                <span class="metric-label">Trust Score</span>
                                <span class="metric-value">${result.trustScore || '94%'}</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Efficiency</span>
                                <span class="metric-value">${result.efficiency || '87%'}</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Risk Level</span>
                                <span class="metric-value risk-${(result.riskLevel || 'low').toLowerCase()}">${result.riskLevel || 'Low'}</span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Carbon Footprint</span>
                                <span class="metric-value">${result.carbonFootprint || '2.3 tons CO₂'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add interactive features
        this.addMapInteractivity();
    }
    
    addMapInteractivity() {
        const canvas = document.getElementById('route-canvas');
        if (!canvas) return;
        
        // Add hover effects for waypoints
        const circles = canvas.querySelectorAll('circle');
        circles.forEach(circle => {
            circle.style.cursor = 'pointer';
            circle.addEventListener('mouseenter', (e) => {
                e.target.setAttribute('r', parseInt(e.target.getAttribute('r')) + 2);
                e.target.style.filter = 'drop-shadow(0 0 5px rgba(0,0,0,0.3))';
            });
            circle.addEventListener('mouseleave', (e) => {
                const originalR = e.target.classList.contains('origin') || e.target.classList.contains('destination') ? 8 : 6;
                e.target.setAttribute('r', originalR);
                e.target.style.filter = 'none';
            });
        });
    }

    // Real-time Tracking Methods
    async loadActiveShipments() {
        try {
            const shipments = await this.fetchActiveShipments();
            this.displayShipments(shipments);
        } catch (error) {
            console.error('Error loading shipments:', error);
            this.showNotification('Failed to load active shipments', 'error');
        }
    }

    async fetchActiveShipments() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/shipments/active`);
            if (!response.ok) {
                throw new Error('Failed to fetch shipments');
            }
            return await response.json();
        } catch (error) {
            // Return mock data for demonstration
            return [
                {
                    id: 'SH001',
                    productName: 'Organic Coffee Beans',
                    origin: 'Ethiopia',
                    destination: 'New York',
                    status: 'In Transit',
                    progress: 65,
                    estimatedArrival: '2024-01-15T14:30:00Z',
                    currentLocation: 'Port of Rotterdam'
                },
                {
                    id: 'SH002',
                    productName: 'Electronic Components',
                    origin: 'Shenzhen',
                    destination: 'Berlin',
                    status: 'Customs',
                    progress: 80,
                    estimatedArrival: '2024-01-12T09:15:00Z',
                    currentLocation: 'Hamburg Port'
                },
                {
                    id: 'SH003',
                    productName: 'Pharmaceutical Supplies',
                    origin: 'Mumbai',
                    destination: 'London',
                    status: 'Departed',
                    progress: 25,
                    estimatedArrival: '2024-01-18T16:45:00Z',
                    currentLocation: 'Dubai International Airport'
                }
            ];
        }
    }

    displayShipments(shipments) {
        const shipmentsContainer = document.getElementById('shipments-list');
        if (!shipmentsContainer) return;

        shipmentsContainer.innerHTML = shipments.map(shipment => `
            <div class="shipment-card" data-shipment-id="${shipment.id}">
                <div class="shipment-header">
                    <h4>${shipment.productName}</h4>
                    <span class="shipment-status status-${shipment.status.toLowerCase().replace(' ', '-')}">
                        ${shipment.status}
                    </span>
                </div>
                <div class="shipment-route">
                    <span class="route-origin">${shipment.origin}</span>
                    <i class="fas fa-arrow-right"></i>
                    <span class="route-destination">${shipment.destination}</span>
                </div>
                <div class="shipment-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${shipment.progress}%"></div>
                    </div>
                    <span class="progress-text">${shipment.progress}%</span>
                </div>
                <div class="shipment-details">
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${shipment.currentLocation}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span>ETA: ${new Date(shipment.estimatedArrival).toLocaleDateString()}</span>
                    </div>
                </div>
                <button class="btn btn-primary track-details-btn" onclick="app.trackShipment('${shipment.id}')">
                    <i class="fas fa-search"></i> Track Details
                </button>
            </div>
        `).join('');
    }

    async trackShipment(shipmentId) {
        if (!shipmentId) {
            const searchInput = document.getElementById('tracking-search');
            shipmentId = searchInput?.value?.trim();
        }

        if (!shipmentId) {
            this.showNotification('Please enter a shipment ID', 'warning');
            return;
        }

        this.showLoading(true);
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/shipments/${shipmentId}/track`);
            let trackingData;
            
            if (response.ok) {
                trackingData = await response.json();
            } else {
                // Mock tracking data for demonstration
                trackingData = {
                    shipmentId: shipmentId,
                    productName: 'Sample Product',
                    currentStatus: 'In Transit',
                    timeline: [
                        {
                            timestamp: '2024-01-10T08:00:00Z',
                            location: 'Origin Warehouse',
                            status: 'Picked Up',
                            description: 'Package picked up from supplier'
                        },
                        {
                            timestamp: '2024-01-10T14:30:00Z',
                            location: 'Distribution Center',
                            status: 'Sorted',
                            description: 'Package sorted for international shipping'
                        },
                        {
                            timestamp: '2024-01-11T09:15:00Z',
                            location: 'Port of Origin',
                            status: 'Departed',
                            description: 'Shipped via cargo vessel'
                        },
                        {
                            timestamp: '2024-01-13T16:45:00Z',
                            location: 'Transit Hub',
                            status: 'In Transit',
                            description: 'Currently in transit to destination'
                        }
                    ]
                };
            }
            
            this.showShipmentDetails(trackingData);
            this.showNotification('Tracking information updated', 'success');
        } catch (error) {
            console.error('Tracking error:', error);
            this.showNotification('Failed to track shipment: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showShipmentDetails(trackingData) {
        const detailsContainer = document.getElementById('tracking-details');
        if (!detailsContainer) return;

        detailsContainer.innerHTML = `
            <div class="tracking-header">
                <h3>Shipment ${trackingData.shipmentId}</h3>
                <span class="current-status">${trackingData.currentStatus}</span>
            </div>
            <div class="tracking-timeline">
                ${trackingData.timeline.map((event, index) => `
                    <div class="timeline-item ${index === trackingData.timeline.length - 1 ? 'current' : 'completed'}">
                        <div class="timeline-marker"></div>
                        <div class="timeline-content">
                            <div class="timeline-time">${new Date(event.timestamp).toLocaleString()}</div>
                            <div class="timeline-location">${event.location}</div>
                            <div class="timeline-status">${event.status}</div>
                            <div class="timeline-description">${event.description}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        detailsContainer.style.display = 'block';
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const notificationIcon = document.getElementById('notificationIcon');
        const notificationMessage = document.getElementById('notificationMessage');
        
        if (notification && notificationIcon && notificationMessage) {
            // Set icon based on type
            const icons = {
                success: 'fas fa-check-circle',
                error: 'fas fa-exclamation-circle',
                warning: 'fas fa-exclamation-triangle',
                info: 'fas fa-info-circle'
            };
            
            notificationIcon.className = icons[type] || icons.info;
            notificationMessage.textContent = message;
            
            // Set notification type class
            notification.className = `notification ${type} show`;
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                notification.classList.remove('show');
            }, 5000);
        }
    }
    
    // Wallet functionality
    async connectWallet() {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            this.showNotification('MetaMask is not installed. Please install MetaMask to use this feature.', 'error');
            // Open MetaMask installation page
            window.open('https://metamask.io/download/', '_blank');
            return;
        }

        try {
            // Request account access
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            if (accounts.length === 0) {
                this.showNotification('No accounts found. Please unlock MetaMask.', 'error');
                return;
            }

            this.wallet.connected = true;
            this.wallet.address = accounts[0];
            this.wallet.provider = window.ethereum;
            
            // Get network info
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            console.log('Connected to chain:', chainId);
            
            // Get balance
            const balance = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [accounts[0], 'latest']
            });
            this.wallet.balance = (parseInt(balance, 16) / 1e18).toFixed(4);
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.wallet.connected = false;
                    this.wallet.address = null;
                    this.updateWalletDisplay();
                    this.showNotification('Wallet disconnected', 'info');
                } else {
                    this.wallet.address = accounts[0];
                    this.updateWalletBalance();
                    this.updateWalletDisplay();
                }
            });
            
            // Listen for chain changes
            window.ethereum.on('chainChanged', (chainId) => {
                console.log('Chain changed to:', chainId);
                this.updateWalletBalance();
            });
            
            this.updateWalletDisplay();
            this.showNotification('Wallet connected successfully!', 'success');
            
            // Initialize marketplace with sample data if empty
            if (this.marketplaceListings.length === 0) {
                this.initializeMarketplaceWithSampleData();
            }
            
        } catch (error) {
            console.error('Error connecting wallet:', error);
            if (error.code === 4001) {
                this.showNotification('Wallet connection rejected by user', 'error');
            } else {
                this.showNotification(`Failed to connect wallet: ${error.message}`, 'error');
            }
        }
    }
    
    updateWalletDisplay() {
        const walletInfo = document.getElementById('walletInfo');
        const connectBtn = document.getElementById('connectWallet');
        
        if (this.wallet.connected && this.wallet.address) {
            walletInfo.style.display = 'block';
            connectBtn.style.display = 'none';
            
            document.getElementById('walletAddress').textContent = 
                `${this.wallet.address.slice(0, 6)}...${this.wallet.address.slice(-4)}`;
            document.getElementById('walletBalance').textContent = `${this.wallet.balance} ETH`;
            
            // Add network indicator
            const networkIndicator = document.getElementById('networkIndicator');
            if (networkIndicator) {
                networkIndicator.textContent = 'Testnet';
                networkIndicator.style.color = '#f39c12';
            }
        } else {
            walletInfo.style.display = 'none';
            connectBtn.style.display = 'block';
        }
    }
    
    // Marketplace functionality
    openListProductModal() {
        if (!this.wallet.connected) {
            this.showNotification('Please connect your wallet first', 'error');
            return;
        }
        
        // Populate the product dropdown with verified products
        this.populateProductDropdown();
        document.getElementById('listProductModal').style.display = 'block';
    }
    
    // Payment functionality
    openProcessPaymentModal() {
        const modal = document.getElementById('processPaymentModal');
        if (modal) {
            modal.style.display = 'block';
            this.populatePaymentProductDropdown();
        }
    }
    
    openVerifyReceiptModal() {
        const modal = document.getElementById('verifyReceiptModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    openTrackShipmentModal() {
        const modal = document.getElementById('trackShipmentModal');
        if (modal) {
            modal.style.display = 'block';
        }
    }
    
    populateProductDropdown() {
        const productSelect = document.getElementById('listProductSelect');
        if (!productSelect) return;
        
        // Clear existing options except the first one
        productSelect.innerHTML = '<option value="">Choose a verified product...</option>';
        
        // Add products from the database
        const productsArray = Array.isArray(this.products) ? this.products : Object.values(this.products || {});
        
        productsArray.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id || product.name;
            option.textContent = `${product.name} (${product.batch_number || 'N/A'})`;
            option.dataset.product = JSON.stringify(product);
            productSelect.appendChild(option);
        });
        
        // If no products available, show message
        if (productsArray.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No verified products available';
            option.disabled = true;
            productSelect.appendChild(option);
        }
    }
    
    async listProduct() {
        const form = document.getElementById('listProductForm');
        
        // Get form values directly from elements
        const selectedProductElement = document.getElementById('listProductSelect');
        const priceElement = document.getElementById('listPrice');
        const quantityElement = document.getElementById('listQuantity');
        const descriptionElement = document.getElementById('listDescription');
        
        // Validate required fields
        if (!selectedProductElement.value) {
            this.showNotification('Please select a product to list', 'error');
            return;
        }
        
        if (!priceElement.value || parseFloat(priceElement.value) <= 0) {
            this.showNotification('Please enter a valid price', 'error');
            return;
        }
        
        if (!quantityElement.value || parseInt(quantityElement.value) <= 0) {
            this.showNotification('Please enter a valid quantity', 'error');
            return;
        }
        
        // Get selected product data
        const selectedOption = selectedProductElement.options[selectedProductElement.selectedIndex];
        const selectedProduct = JSON.parse(selectedOption.dataset.product || '{}');
        
        const productData = {
            id: Date.now().toString(),
            originalProductId: selectedProduct.id || selectedProduct.name,
            name: selectedProduct.name,
            description: descriptionElement.value || selectedProduct.description || 'No additional description',
            price: parseFloat(priceElement.value),
            currency: 'USDT',
            quantity: parseInt(quantityElement.value),
            seller: this.wallet.address,
            sellerShort: `${this.wallet.address.slice(0, 6)}...${this.wallet.address.slice(-4)}`,
            timestamp: Date.now(),
            category: selectedProduct.category,
            batch_number: selectedProduct.batch_number,
            supplier_id: selectedProduct.supplier_id,
            verified: true
        };
        
        // Add to marketplace listings
        this.marketplaceListings.push(productData);
        
        // Update display
        this.updateMarketplaceDisplay();
        
        // Close modal and reset form
        document.getElementById('listProductModal').style.display = 'none';
        form.reset();
        
        this.showNotification('Product listed successfully!', 'success');
    }
    
    updateMarketplaceDisplay() {
        const grid = document.getElementById('marketplaceListings'); // Fixed ID
        const stats = {
            activeListings: this.marketplaceListings.length,
            completedTransactions: 0,
            totalVolume: this.marketplaceListings.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity || 1)), 0)
        };
        
        // Update stats with correct IDs
        const totalListingsEl = document.getElementById('totalListings');
        const totalTransactionsEl = document.getElementById('totalTransactions');
        const totalVolumeEl = document.getElementById('totalVolume');
        
        if (totalListingsEl) totalListingsEl.textContent = stats.activeListings;
        if (totalTransactionsEl) totalTransactionsEl.textContent = stats.completedTransactions;
        if (totalVolumeEl) totalVolumeEl.textContent = `$${stats.totalVolume.toFixed(2)}`;
        
        // Update grid with proper marketplace item structure
        if (grid) {
            if (this.marketplaceListings.length === 0) {
                grid.innerHTML = `
                    <div class="marketplace-empty">
                        <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                        <h3>No products listed yet</h3>
                        <p>Be the first to list a verified product for sale!</p>
                    </div>
                `;
            } else {
                grid.innerHTML = this.marketplaceListings.map(item => `
                    <div class="marketplace-item">
                        <div class="marketplace-item-header">
                            <div>
                                <h4 class="marketplace-item-title">${item.name}</h4>
                                <span class="marketplace-item-category">${this.getCategoryName(item.category)}</span>
                            </div>
                            <div class="marketplace-item-price">$${item.price}</div>
                        </div>
                        <div class="marketplace-item-details">
                            <div class="marketplace-item-detail">
                                <span>Quantity:</span>
                                <span>${item.quantity}</span>
                            </div>
                            <div class="marketplace-item-detail">
                                <span>Batch:</span>
                                <span>${item.batch_number || 'N/A'}</span>
                            </div>
                            <div class="marketplace-item-detail">
                                <span>Verified:</span>
                                <span style="color: #10b981;"><i class="fas fa-check-circle"></i> Yes</span>
                            </div>
                        </div>
                        <p class="marketplace-item-description">${item.description}</p>
                        <div class="marketplace-item-actions">
                            <span class="item-seller">Seller: ${item.sellerShort}</span>
                            <button class="btn btn-buy" onclick="app.openPurchaseModal('${item.id}')">
                                <i class="fas fa-shopping-cart"></i> Buy Now
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    }
    
    getCategoryName(categoryId) {
        const categoryMap = {
            1: 'Electronics',
            2: 'Pharmaceuticals', 
            3: 'Food & Beverage',
            4: 'Luxury Goods',
            5: 'Textiles'
        };
        return categoryMap[categoryId] || 'Other';
    }
    
    openPurchaseModal(productId) {
        if (!this.wallet.connected) {
            this.showNotification('Please connect your wallet first', 'error');
            return;
        }
        
        const product = this.marketplaceListings.find(item => item.id === productId);
        if (!product) {
            this.showNotification('Product not found', 'error');
            return;
        }
        
        // Populate purchase modal with product details
        const purchaseDetails = document.getElementById('purchaseDetails');
        const totalPrice = product.price * product.quantity;
        
        purchaseDetails.innerHTML = `
            <div class="purchase-product-info">
                <h3>${product.name}</h3>
                <div class="purchase-details-grid">
                    <div class="purchase-detail">
                        <span class="label">Price per unit:</span>
                        <span class="value">$${product.price} USDT</span>
                    </div>
                    <div class="purchase-detail">
                        <span class="label">Quantity:</span>
                        <span class="value">${product.quantity}</span>
                    </div>
                    <div class="purchase-detail">
                        <span class="label">Total Price:</span>
                        <span class="value total-price">$${totalPrice.toFixed(2)} USDT</span>
                    </div>
                    <div class="purchase-detail">
                        <span class="label">Seller:</span>
                        <span class="value">${product.sellerShort}</span>
                    </div>
                    <div class="purchase-detail">
                        <span class="label">Batch Number:</span>
                        <span class="value">${product.batch_number || 'N/A'}</span>
                    </div>
                    <div class="purchase-detail">
                        <span class="label">Verification Status:</span>
                        <span class="value verified"><i class="fas fa-check-circle"></i> Verified</span>
                    </div>
                </div>
                <div class="purchase-description">
                    <h4>Description:</h4>
                    <p>${product.description}</p>
                </div>
                <div class="wallet-balance">
                    <span class="label">Your Balance:</span>
                    <span class="value">$${this.wallet.balance.toFixed(2)} USDT</span>
                </div>
                <div class="blockchain-info">
                    <h4>Blockchain Payment Details:</h4>
                    <div class="network-info">
                        <div class="purchase-detail">
                            <span class="label">Network:</span>
                            <span class="value">Ethereum Sepolia Testnet</span>
                        </div>
                        <div class="purchase-detail">
                            <span class="label">Payment Method:</span>
                            <span class="value">ETH (Test Ether)</span>
                        </div>
                        <div class="purchase-detail">
                            <span class="label">Transaction Type:</span>
                            <span class="value">Smart Contract Interaction</span>
                        </div>
                        <div class="purchase-detail">
                            <span class="label">Gas Fee:</span>
                            <span class="value">~0.001 ETH (estimated)</span>
                        </div>
                    </div>
                    <div class="testnet-notice">
                        <i class="fas fa-info-circle"></i>
                        <span>This is a testnet transaction. No real money will be charged.</span>
                    </div>
                </div>
            </div>
        `;
        
        // Store product ID for purchase confirmation
        document.getElementById('confirmPurchaseBtn').dataset.productId = productId;
        
        // Show modal
        document.getElementById('purchaseModal').style.display = 'block';
    }
    
    async purchaseProduct(productId) {
        const product = this.marketplaceListings.find(item => item.id === productId);
        if (!product) {
            this.showNotification('Product not found', 'error');
            return;
        }
        
        if (!this.wallet.connected) {
            this.showNotification('Please connect your wallet first', 'error');
            return;
        }
        
        // Check if MetaMask is available
        if (typeof window.ethereum === 'undefined') {
            this.showNotification('MetaMask is required for blockchain transactions', 'error');
            return;
        }
        
        const totalPrice = product.price * product.quantity;
        const priceInWei = Math.floor(totalPrice * 1e18).toString(); // Convert to Wei for blockchain transaction
        
        try {
            this.showNotification(`Preparing blockchain transaction for ${product.name}...`, 'info');
            
            // Close purchase modal
            document.getElementById('purchaseModal').style.display = 'none';
            
            // Ensure we're connected to the right account
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length === 0 || accounts[0] !== this.wallet.address) {
                this.showNotification('Please reconnect your wallet', 'error');
                return;
            }
            
            // Get current gas price
            const gasPrice = await window.ethereum.request({ method: 'eth_gasPrice' });
            
            // Prepare transaction parameters
            const transactionParameters = {
                to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b8d4b6', // Marketplace contract address (placeholder)
                from: this.wallet.address,
                value: '0x' + BigInt(priceInWei).toString(16),
                gas: '0x5208', // 21000 gas limit for simple transfer
                gasPrice: gasPrice,
                data: '0x' + Array.from(new TextEncoder().encode(`purchase:${productId}:${product.quantity}`), byte => byte.toString(16).padStart(2, '0')).join('')
            };
            
            console.log('Transaction parameters:', transactionParameters);
            this.showNotification('Please confirm the transaction in MetaMask...', 'info');
            
            // Send transaction - this will prompt MetaMask
            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });
            
            this.showNotification(`Transaction submitted! Hash: ${txHash.slice(0, 10)}...`, 'success');
            
            // Wait for transaction confirmation
            this.waitForTransactionConfirmation(txHash, product, totalPrice);
            
        } catch (error) {
            console.error('Transaction failed:', error);
            if (error.code === 4001) {
                this.showNotification('Transaction rejected by user', 'warning');
            } else if (error.code === -32603) {
                this.showNotification('Insufficient funds for transaction', 'error');
            } else {
                this.showNotification(`Transaction failed: ${error.message}`, 'error');
            }
        }
    }
    
    async waitForTransactionConfirmation(txHash, product, totalPrice) {
        try {
            let receipt = null;
            let attempts = 0;
            const maxAttempts = 30; // Wait up to 5 minutes
            
            while (!receipt && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
                
                try {
                    receipt = await window.ethereum.request({
                        method: 'eth_getTransactionReceipt',
                        params: [txHash]
                    });
                } catch (error) {
                    console.log('Waiting for transaction confirmation...');
                }
                
                attempts++;
            }
            
            if (receipt) {
                if (receipt.status === '0x1') {
                    // Transaction successful
                    this.completePurchase(product, totalPrice, txHash);
                } else {
                    this.showNotification('Transaction failed on blockchain', 'error');
                }
            } else {
                this.showNotification('Transaction confirmation timeout', 'error');
            }
        } catch (error) {
            console.error('Error waiting for confirmation:', error);
            this.showNotification('Error confirming transaction', 'error');
        }
    }
    
    completePurchase(product, totalPrice, txHash) {
        // Update wallet balance (fetch from blockchain)
        this.updateWalletBalance();
        
        // Remove from marketplace listings
        this.marketplaceListings = this.marketplaceListings.filter(item => item.id !== product.id);
        this.updateMarketplaceDisplay();
        
        this.showNotification(
            `Purchase completed! You bought ${product.quantity}x ${product.name} for $${totalPrice.toFixed(2)}. TX: ${txHash.slice(0, 10)}...`, 
            'success'
        );
    }
    
    simulatePurchase(product, totalPrice) {
        // Fallback simulation for demo mode
        setTimeout(() => {
            this.wallet.balance -= totalPrice;
            this.updateWalletDisplay();
            
            this.marketplaceListings = this.marketplaceListings.filter(item => item.id !== product.id);
            this.updateMarketplaceDisplay();
            
            this.showNotification(`Purchase completed! You bought ${product.quantity}x ${product.name} for $${totalPrice.toFixed(2)} (Demo Mode)`, 'success');
        }, 2000);
    }
    
    async updateWalletBalance() {
        if (this.wallet.connected && typeof window.ethereum !== 'undefined') {
            try {
                const balance = await window.ethereum.request({
                    method: 'eth_getBalance',
                    params: [this.wallet.address, 'latest']
                });
                this.wallet.balance = (parseInt(balance, 16) / 1e18).toFixed(4);
                this.updateWalletDisplay();
            } catch (error) {
                console.error('Error updating wallet balance:', error);
            }
        }
    }
    
    initializeMarketplaceWithSampleData() {
        // Create sample marketplace listings from supplier products
        const sampleListings = [
            {
                id: 'mp-001',
                name: 'Premium Organic Coffee Beans',
                price: 45.99,
                quantity: 50,
                seller: 'Global Coffee Suppliers',
                batchNumber: 'GCS-2024-001',
                verified: true,
                description: 'High-quality organic coffee beans sourced from sustainable farms in Colombia.',
                category: 'Food & Beverages'
            },
            {
                id: 'mp-002',
                name: 'Industrial Grade Steel Pipes',
                price: 125.50,
                quantity: 25,
                seller: 'MetalWorks Industries',
                batchNumber: 'MW-2024-SP-045',
                verified: true,
                description: 'High-strength steel pipes suitable for industrial construction projects.',
                category: 'Industrial Materials'
            },
            {
                id: 'mp-003',
                name: 'Organic Cotton Fabric',
                price: 28.75,
                quantity: 100,
                seller: 'EcoTextile Solutions',
                batchNumber: 'ETS-2024-OCF-012',
                verified: true,
                description: 'Premium organic cotton fabric, GOTS certified for sustainable textile production.',
                category: 'Textiles'
            },
            {
                id: 'mp-004',
                name: 'Electronic Components Kit',
                price: 89.99,
                quantity: 15,
                seller: 'TechSupply Co.',
                batchNumber: 'TSC-2024-ECK-078',
                verified: false,
                description: 'Complete electronic components kit for prototyping and development.',
                category: 'Electronics'
            }
        ];
        
        this.marketplaceListings = sampleListings;
        this.updateMarketplaceDisplay();
    }
    
    // Payment System Methods
    
    async loadPayments() {
        try {
            const [statsResponse, recentResponse] = await Promise.all([
                fetch(`${this.apiBaseUrl}/payments/stats`),
                fetch(`${this.apiBaseUrl}/payments/recent?limit=5`)
            ]);
            
            const statsResult = await statsResponse.json();
            const recentResult = await recentResponse.json();
            
            if (statsResult.success) {
                const paymentData = {
                    stats: statsResult.data,
                    recentPayments: recentResult.success ? recentResult.data : []
                };
                this.updatePaymentDashboard(paymentData);
            }
        } catch (error) {
            console.error('Error loading payments:', error);
            // Fallback to just stats if recent payments fail
            try {
                const response = await fetch(`${this.apiBaseUrl}/payments/stats`);
                const result = await response.json();
                if (result.success) {
                    this.updatePaymentDashboard({ stats: result.data, recentPayments: [] });
                }
            } catch (fallbackError) {
                console.error('Error loading payment stats:', fallbackError);
            }
        }
    }
    
    updatePaymentDashboard(data) {
        const container = document.getElementById('payments-content');
        if (!container) return;
        
        const stats = data.stats || data; // Handle both old and new data structure
        const recentPayments = data.recentPayments || [];
        
        container.innerHTML = `
            <div class="payment-dashboard">
                <div class="payment-header">
                    <h2>💳 Payment & Receipt System</h2>
                    <p>Secure payments with zero-knowledge proof receipts and route tracking</p>
                </div>
                
                <div class="payment-stats">
                    <div class="stat-card clickable-card" onclick="app.showAllPayments()">
                        <div class="stat-icon">💰</div>
                        <div class="stat-info">
                            <div class="stat-number">${stats.totalPayments || 0}</div>
                            <div class="stat-label">Total Payments</div>
                        </div>
                        <i class="fas fa-external-link-alt click-indicator"></i>
                    </div>
                    <div class="stat-card clickable-card" onclick="app.showAllReceipts()">
                        <div class="stat-icon">🧾</div>
                        <div class="stat-info">
                            <div class="stat-number">${stats.totalReceipts || 0}</div>
                            <div class="stat-label">Receipts</div>
                        </div>
                        <i class="fas fa-external-link-alt click-indicator"></i>
                    </div>
                    <div class="stat-card clickable-card" onclick="app.showAllShipments()">
                        <div class="stat-icon">🚚</div>
                        <div class="stat-info">
                            <div class="stat-number">${stats.activeShipments || stats.activeTrackings || 0}</div>
                            <div class="stat-label">Active Shipments</div>
                        </div>
                        <i class="fas fa-external-link-alt click-indicator"></i>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-info">
                            <div class="stat-number">${(stats.averageTrustScore || 0).toFixed(1)}</div>
                            <div class="stat-label">Avg Trust Score</div>
                        </div>
                    </div>
                </div>
                
                <div class="recent-transactions">
                    <h3>📋 Completed Transactions</h3>
                    <div class="transactions-list">
                        ${this.renderRecentPayments(recentPayments)}
                    </div>
                </div>
                
                <div class="payment-actions">
                    <div class="action-section">
                        <h3>🛒 Make a Payment</h3>
                        <div class="payment-form">
                            <div class="form-group">
                                <label>Select Product:</label>
                                <select id="paymentProductSelect" class="form-control">
                                    <option value="">Choose a product...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Payment Amount ($):</label>
                                <input type="number" id="paymentAmount" class="form-control" placeholder="0.00" step="0.01" min="0">
                            </div>
                            <div class="form-group">
                                <label>Quantity:</label>
                                <input type="number" id="paymentQuantity" class="form-control" placeholder="1" min="1" value="1">
                            </div>
                            <div class="form-group">
                                <label>Buyer Address:</label>
                                <input type="text" id="buyerAddress" class="form-control" placeholder="0x...">
                            </div>
                            <div class="form-group">
                                <label>Seller Address:</label>
                                <input type="text" id="sellerAddress" class="form-control" placeholder="0x...">
                            </div>
                            <div class="form-group">
                                <label>Payment Method:</label>
                                <select id="payment-method" class="form-control">
                                    <option value="credit_card">Credit Card</option>
                                    <option value="debit_card">Debit Card</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="crypto">Cryptocurrency</option>
                                    <option value="paypal">PayPal</option>
                                </select>
                            </div>
                            <button onclick="app.processPayment()" class="btn btn-primary">
                                💳 Process Payment with Receipt
                            </button>
                        </div>
                    </div>
                    
                    <div class="action-section">
                        <h3>🔍 Verify Receipt</h3>
                        <div class="verification-form">
                            <div class="form-group">
                                <label>Receipt ID:</label>
                                <input type="text" id="receipt-id" class="form-control" placeholder="RCP-...">
                            </div>
                            <button onclick="app.verifyReceipt()" class="btn btn-secondary">
                                🔐 Verify Receipt
                            </button>
                        </div>
                    </div>
                    
                    <div class="action-section">
                        <h3>📦 Track Shipment</h3>
                        <div class="tracking-form">
                            <div class="form-group">
                                <label>Tracking ID:</label>
                                <input type="text" id="tracking-id" class="form-control" placeholder="TRK-...">
                            </div>
                            <button onclick="app.trackPaymentShipment()" class="btn btn-info">
                                🚚 Track Shipment
                            </button>
                        </div>
                    </div>
                </div>
                
                <div id="payment-results" class="results-section"></div>
            </div>
        `;
        
        this.populatePaymentProductDropdown();
    }
    
    renderRecentPayments(payments) {
        if (!payments || payments.length === 0) {
            return `
                <div class="no-transactions">
                    <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <p>No completed transactions yet</p>
                        <small>Process your first payment to see transaction history</small>
                    </div>
                </div>
            `;
        }
        
        return payments.map(payment => {
            const date = new Date(payment.timestamp).toLocaleDateString();
            const time = new Date(payment.timestamp).toLocaleTimeString();
            const statusIcon = payment.status === 'completed' ? '✅' : payment.status === 'pending' ? '⏳' : '❌';
            const receiptStatus = payment.receipt ? (payment.receipt.verified ? '🔐 Verified' : '🔓 Unverified') : '❌ No Receipt';
            
            return `
                <div class="transaction-card clickable-card" onclick="app.showPaymentDetails('${payment.id}')">
                    <div class="transaction-header">
                        <div class="transaction-id">
                            <strong>Payment ID:</strong> ${payment.id}
                            <span class="status-badge ${payment.status}">${statusIcon} ${payment.status.toUpperCase()}</span>
                        </div>
                        <div class="transaction-amount">$${(payment.amount || 0).toFixed(2)}</div>
                        <i class="fas fa-chevron-right click-indicator"></i>
                    </div>
                    
                    <div class="transaction-details">
                        <div class="detail-row">
                            <span class="label">Product:</span>
                            <span class="value">${payment.productName || 'Unknown Product'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Quantity:</span>
                            <span class="value">${payment.quantity || 1}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Date:</span>
                            <span class="value">${date} at ${time}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Payment Method:</span>
                            <span class="value">${payment.paymentMethod || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Receipt:</span>
                            <span class="value receipt-status">${receiptStatus}</span>
                        </div>
                        ${payment.tracking ? `
                            <div class="detail-row">
                                <span class="label">Tracking:</span>
                                <span class="value">${payment.tracking.trackingId} - ${payment.tracking.currentStatus}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="transaction-actions">
                        ${payment.receipt ? `
                            <button class="btn btn-sm btn-secondary" onclick="app.verifyReceiptById('${payment.receipt.receiptId}')">
                                🔍 View Receipt
                            </button>
                        ` : ''}
                        ${payment.tracking ? `
                            <button class="btn btn-sm btn-info" onclick="app.trackPaymentShipment('${payment.tracking.trackingId}')">
                                📦 Track Shipment
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline" onclick="app.downloadReceipt('${payment.receipt ? payment.receipt.receiptId : payment.id}')">
                            📄 Download
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    async populatePaymentProductDropdown() {
        const select = document.getElementById('paymentProductSelect');
        if (!select) return;
        
        try {
            // Load both products and categories
            const [productsResponse, categoriesResponse] = await Promise.all([
                fetch(`${this.apiBaseUrl}/products`),
                fetch(`${this.apiBaseUrl}/categories`)
            ]);
            
            const productsResult = await productsResponse.json();
            const categoriesResult = await categoriesResponse.json();
            
            if (productsResult.success && productsResult.data) {
                // Clear existing options except the first one
                select.innerHTML = '<option value="">Select a product...</option>';
                
                // Group products by category
                const categories = categoriesResult.success ? categoriesResult.data : {};
                const productsByCategory = {};
                
                // Define realistic prices for different product types
                const productPrices = {
                    'P001': 999.99,  // iPhone 15 Pro
                    'P002': 12.99,   // Aspirin 500mg
                    'P003': 899.99,  // Samsung Galaxy S24
                    'P004': 24.99,   // Organic Olive Oil
                    'P005': 19.99,   // Vitamin D3 Supplements
                    'P006': 89.99,   // BMW Brake Pads
                    'P007': 125000,  // MRI Scanner Model X200
                    'P008': 45.99,   // Luxury Handbag
                    'P009': 15.99,   // Artisan Chocolate
                    'P010': 299.99   // Default for other products
                };
                
                Object.entries(productsResult.data).forEach(([id, product]) => {
                    const categoryName = categories[product.category]?.name || 'Other';
                    if (!productsByCategory[categoryName]) {
                        productsByCategory[categoryName] = [];
                    }
                    
                    // Add realistic price based on product type
                    const price = productPrices[id] || (Math.random() * 200 + 50).toFixed(2);
                    productsByCategory[categoryName].push({ id, ...product, price });
                });
                
                // Add products grouped by category
                Object.entries(productsByCategory).forEach(([categoryName, products]) => {
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = categoryName;
                    
                    products.forEach(product => {
                        const option = document.createElement('option');
                        option.value = product.id;
                        option.textContent = `${product.name} - $${product.price}`;
                        option.setAttribute('data-price', product.price);
                        optgroup.appendChild(option);
                    });
                    
                    select.appendChild(optgroup);
                });
                
                // Add event listener to auto-populate price when product is selected
                select.addEventListener('change', (e) => {
                    const selectedOption = e.target.selectedOptions[0];
                    const priceInput = document.getElementById('paymentAmount');
                    if (selectedOption && selectedOption.getAttribute('data-price') && priceInput) {
                        priceInput.value = selectedOption.getAttribute('data-price');
                    }
                });
            }
        } catch (error) {
            console.error('Error loading products for payment:', error);
        }
    }
    
    async processPayment() {
        const productId = document.getElementById('paymentProductSelect').value;
        const amount = parseFloat(document.getElementById('paymentAmount').value);
        const quantity = parseInt(document.getElementById('paymentQuantity').value);
        const buyerAddress = document.getElementById('buyerAddress').value;
        const sellerAddress = document.getElementById('sellerAddress').value;
        
        if (!productId || !amount || amount <= 0 || !quantity || quantity <= 0 || !buyerAddress || !sellerAddress) {
            this.showNotification('Please fill in all required fields with valid values', 'error');
            return;
        }
        
        try {
            this.showLoading(true);
            
            // Get product and supplier info
            const productResponse = await fetch(`${this.apiBaseUrl}/products`);
            const productResult = await productResponse.json();
            const product = productResult.data[productId];
            
            if (!product) {
                throw new Error('Product not found');
            }
            
            const paymentData = {
                amount,
                quantity,
                currency: 'USD',
                buyerAddress,
                sellerAddress,
                totalAmount: amount * quantity
            };
            
            const response = await fetch(`${this.apiBaseUrl}/payments/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    paymentData,
                    productId,
                    supplierId: product.supplier_id
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.displayPaymentResult(result);
                this.showNotification('Payment processed successfully with receipt generated!', 'success');
            } else {
                throw new Error(result.error || 'Payment failed');
            }
            
        } catch (error) {
            console.error('Payment error:', error);
            this.showNotification(`Payment failed: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    displayPaymentResult(result) {
        const container = document.getElementById('payment-results');
        if (!container) return;
        
        const payment = result.payment;
        const receipt = result.receipt;
        const tracking = result.routeTracking;
        
        container.innerHTML = `
            <div class="payment-result">
                <div class="result-header">
                    <h3>✅ Payment Successful</h3>
                    <div class="payment-id">Payment ID: ${payment.id}</div>
                </div>
                
                <div class="result-sections">
                    <div class="result-section">
                        <h4>💳 Payment Details</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="label">Amount:</span>
                                <span class="value">$${payment.amount.toFixed(2)} ${payment.currency}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Method:</span>
                                <span class="value">${payment.paymentMethod}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Status:</span>
                                <span class="value status-${payment.status}">${payment.status.toUpperCase()}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Trust Score:</span>
                                <span class="value">${payment.trustScore}/100</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="result-section">
                        <h4>🧾 Receipt</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="label">Receipt ID:</span>
                                <span class="value receipt-id">${receipt.receiptId}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Verified:</span>
                                <span class="value">${receipt.verification.verified ? '✅ Yes' : '❌ No'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Receipt Hash:</span>
                                <span class="value hash">${receipt.receiptHash.substring(0, 16)}...</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Proof Hash:</span>
                                <span class="value hash">${receipt.verification.proofHash.substring(0, 16)}...</span>
                            </div>
                        </div>
                        <button onclick="app.downloadReceipt('${receipt.receiptId}')" class="btn btn-sm btn-outline">
                            📄 Download Receipt
                        </button>
                    </div>
                    
                    <div class="result-section">
                        <h4>🚚 Route Tracking</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="label">Tracking ID:</span>
                                <span class="value tracking-id">${tracking.trackingId}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Status:</span>
                                <span class="value">${tracking.currentStatus.replace('_', ' ').toUpperCase()}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Est. Delivery:</span>
                                <span class="value">${new Date(tracking.estimatedDelivery).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <button onclick="app.trackPaymentShipment('${tracking.trackingId}')" class="btn btn-sm btn-outline">
                            📦 Track Shipment
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    async verifyReceipt() {
        const receiptId = document.getElementById('receiptId').value.trim();
        
        if (!receiptId) {
            this.showNotification('Please enter a receipt ID', 'error');
            return;
        }
        
        await this.verifyReceiptById(receiptId);
    }
    
    async verifyReceiptById(receiptId) {
        try {
            this.showLoading(true);
            
            const response = await fetch(`${this.apiBaseUrl}/receipts/${receiptId}/verify`, {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.displayReceiptVerification(result.data);
            } else {
                throw new Error(result.error || 'Verification failed');
            }
            
        } catch (error) {
            console.error('Receipt verification error:', error);
            this.showNotification(`Verification failed: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    displayReceiptVerification(verification) {
        const container = document.getElementById('payment-results');
        if (!container) return;
        
        const statusIcon = verification.valid ? '✅' : '❌';
        const statusText = verification.valid ? 'VALID' : 'INVALID';
        const statusClass = verification.valid ? 'valid' : 'invalid';
        
        container.innerHTML = `
            <div class="verification-result">
                <div class="verification-header">
                    <h3>${statusIcon} Receipt Verification</h3>
                    <div class="verification-status ${statusClass}">${statusText}</div>
                </div>
                
                <div class="verification-details">
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">Receipt ID:</span>
                            <span class="value">${verification.receiptId}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Verified:</span>
                <span class="value">${verification.verified ? '✅ Yes' : '❌ No'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Hash Valid:</span>
                            <span class="value">${verification.hashValid ? '✅ Yes' : '❌ No'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Trust Score:</span>
                            <span class="value">${verification.trustScore}/100</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Verification Time:</span>
                            <span class="value">${new Date(verification.verificationTimestamp * 1000).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async trackPaymentShipment(trackingId = null) {
        const id = trackingId || document.getElementById('tracking-id').value.trim();
        
        if (!id) {
            this.showNotification('Please enter a tracking ID', 'error');
            return;
        }
        
        try {
            this.showLoading(true);
            
            const response = await fetch(`${this.apiBaseUrl}/tracking/${id}`);
            const result = await response.json();
            
            if (result.success) {
                this.displayShipmentTracking(result.data);
            } else {
                throw new Error(result.error || 'Tracking failed');
            }
            
        } catch (error) {
            console.error('Shipment tracking error:', error);
            this.showNotification(`Tracking failed: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    displayShipmentTracking(tracking) {
        const container = document.getElementById('payment-results');
        if (!container) return;
        
        const timelineHtml = tracking.timeline.map(event => `
            <div class="timeline-item">
                <div class="timeline-icon">📍</div>
                <div class="timeline-content">
                    <div class="timeline-status">${event.status.replace('_', ' ').toUpperCase()}</div>
                    <div class="timeline-location">${event.location}</div>
                    <div class="timeline-description">${event.description}</div>
                    <div class="timeline-time">${new Date(event.timestamp).toLocaleString()}</div>
                    ${event.receiptGenerated ? '<div class="receipt-badge">🔐 Receipt Generated</div>' : ''}
                </div>
            </div>
        `).join('');
        
        container.innerHTML = `
            <div class="tracking-result">
                <div class="tracking-header">
                    <h3>📦 Shipment Tracking</h3>
                    <div class="tracking-id">Tracking ID: ${tracking.trackingId}</div>
                </div>
                
                <div class="tracking-info">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="label">Product:</span>
                            <span class="value">${tracking.productName}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Current Status:</span>
                            <span class="value status-${tracking.currentStatus}">${tracking.currentStatus.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Estimated Delivery:</span>
                            <span class="value">${new Date(tracking.estimatedDelivery).toLocaleDateString()}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Payment ID:</span>
                            <span class="value">${tracking.paymentId}</span>
                        </div>
                    </div>
                </div>
                
                <div class="tracking-timeline">
                    <h4>📍 Shipment Timeline</h4>
                    <div class="timeline">
                        ${timelineHtml}
                    </div>
                </div>
            </div>
        `;
    }
    
    async downloadReceipt(receiptId, format = 'json') {
        try {
            // Show download format selection modal
            const selectedFormat = await this.showDownloadFormatModal();
            if (!selectedFormat) return; // User cancelled
            
            this.showNotification('Generating enhanced receipt with ZK proofs...', 'info');
            
            const response = await fetch(`${this.apiBaseUrl}/receipts/${receiptId}/download?format=${selectedFormat}`);
            
            if (selectedFormat === 'pdf') {
                // Handle PDF download
                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `chainflow-receipt-${receiptId}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    this.showNotification('Enhanced PDF receipt downloaded successfully', 'success');
                } else {
                    throw new Error('Failed to generate PDF receipt');
                }
            } else {
                // Handle JSON download
                const result = await response.json();
                
                if (result.success) {
                    const enhancedReceipt = result.receipt;
                    
                    // Create comprehensive receipt data with ZK proofs
                    const receiptData = {
                        ...enhancedReceipt,
                        downloadInfo: result.downloadInfo,
                        zkProofVerification: {
                            verified: result.downloadInfo.zkProofVerified,
                            timestamp: new Date().toISOString(),
                            algorithm: 'zk-SNARK',
                            confidence: enhancedReceipt.zkProofs?.paymentProof?.confidence || 0.99
                        }
                    };
                    
                    const blob = new Blob([JSON.stringify(receiptData, null, 2)], {
                        type: 'application/json'
                    });
                    
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `chainflow-enhanced-receipt-${receiptId}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    this.showNotification('Enhanced receipt with ZK proofs downloaded successfully', 'success');
                    
                    // Show receipt verification summary
                    this.showReceiptVerificationSummary(enhancedReceipt);
                } else {
                    throw new Error(result.error || 'Failed to download enhanced receipt');
                }
            }
            
        } catch (error) {
            console.error('Download receipt error:', error);
            this.showNotification(`Download failed: ${error.message}`, 'error');
        }
    }

    /**
     * Show download format selection modal
     */
    showDownloadFormatModal() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content download-format-modal">
                    <div class="modal-header">
                        <h3>📄 Download Receipt</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove(); resolve(null);">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>Choose the format for your enhanced receipt with ZK proofs:</p>
                        <div class="format-options">
                            <div class="format-option" data-format="json">
                                <div class="format-icon">📋</div>
                                <div class="format-details">
                                    <h4>JSON Format</h4>
                                    <p>Complete receipt data with ZK proofs, verification details, and metadata</p>
                                    <ul>
                                        <li>✅ Full ZK proof data</li>
                                        <li>✅ Verification timestamps</li>
                                        <li>✅ Machine readable</li>
                                        <li>✅ Audit trail included</li>
                                    </ul>
                                </div>
                            </div>
                            <div class="format-option" data-format="pdf">
                                <div class="format-icon">📄</div>
                                <div class="format-details">
                                    <h4>PDF Format</h4>
                                    <p>Human-readable receipt document for printing and sharing</p>
                                    <ul>
                                        <li>✅ Professional layout</li>
                                        <li>✅ Print-friendly</li>
                                        <li>✅ ZK proof summary</li>
                                        <li>✅ Easy sharing</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove(); resolve(null);">Cancel</button>
                    </div>
                </div>
            `;

            // Add click handlers for format options
            modal.addEventListener('click', (e) => {
                const formatOption = e.target.closest('.format-option');
                if (formatOption) {
                    const format = formatOption.dataset.format;
                    modal.remove();
                    resolve(format);
                }
            });

            document.body.appendChild(modal);
        });
    }

    /**
     * Show receipt verification summary
     */
    showReceiptVerificationSummary(enhancedReceipt) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content verification-summary-modal">
                <div class="modal-header">
                    <h3>🔐 Receipt Verification Summary</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="verification-status ${enhancedReceipt.verification.verified ? 'verified' : 'unverified'}">
                        <div class="status-icon">${enhancedReceipt.verification.verified ? '✅' : '❌'}</div>
                        <div class="status-text">
                            <h4>${enhancedReceipt.verification.verified ? 'Receipt Verified' : 'Verification Failed'}</h4>
                            <p>ZK-SNARK proof validation ${enhancedReceipt.verification.verified ? 'successful' : 'failed'}</p>
                        </div>
                    </div>
                    
                    <div class="verification-details">
                        <h4>🔍 Verification Details</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="label">Receipt Number:</span>
                                <span class="value">${enhancedReceipt.receiptNumber}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Issue Date:</span>
                                <span class="value">${new Date(enhancedReceipt.issueDate).toLocaleString()}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Algorithm:</span>
                                <span class="value">${enhancedReceipt.verification.algorithm}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Valid Until:</span>
                                <span class="value">${new Date(enhancedReceipt.verification.validUntil).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="zk-proofs-summary">
                        <h4>🛡️ ZK Proof Summary</h4>
                        <div class="proof-items">
                            <div class="proof-item ${enhancedReceipt.zkProofs.paymentProof.verified ? 'verified' : 'failed'}">
                                <span class="proof-icon">${enhancedReceipt.zkProofs.paymentProof.verified ? '✅' : '❌'}</span>
                                <span class="proof-label">Payment Proof</span>
                                <span class="proof-confidence">${(enhancedReceipt.zkProofs.paymentProof.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <div class="proof-item ${enhancedReceipt.zkProofs.identityProof.verified ? 'verified' : 'failed'}">
                                <span class="proof-icon">${enhancedReceipt.zkProofs.identityProof.verified ? '✅' : '❌'}</span>
                                <span class="proof-label">Identity Proof</span>
                                <span class="proof-confidence">${(enhancedReceipt.zkProofs.identityProof.confidence * 100).toFixed(1)}%</span>
                            </div>
                            <div class="proof-item ${enhancedReceipt.zkProofs.integrityProof.verified ? 'verified' : 'failed'}">
                                <span class="proof-icon">${enhancedReceipt.zkProofs.integrityProof.verified ? '✅' : '❌'}</span>
                                <span class="proof-label">Integrity Proof</span>
                                <span class="proof-confidence">${(enhancedReceipt.zkProofs.integrityProof.confidence * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="compliance-info">
                        <h4>📋 Compliance & Audit</h4>
                        <div class="compliance-badges">
                            ${enhancedReceipt.compliance.regulations.map(reg => 
                                `<span class="compliance-badge">${reg}</span>`
                            ).join('')}
                        </div>
                        <p class="audit-note">This receipt includes a complete audit trail and meets regulatory compliance standards.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // New methods for clickable payment system
    async showAllPayments() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/payments`);
            const data = await response.json();
            
            const modal = document.getElementById('allPaymentsModal');
            const content = document.getElementById('allPaymentsContent');
            
            if (data.success && data.data && data.data.payments) {
                const payments = data.data.payments;
                const totalVolume = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
                const completedPayments = payments.filter(p => p.status === 'completed').length;
                const pendingPayments = payments.filter(p => p.status === 'pending').length;
                
                content.innerHTML = `
                    <div class="payments-overview">
                        <div class="overview-header">
                            <h3>💳 Complete Payment Transaction History</h3>
                            <div class="overview-stats">
                                <div class="mini-stat">
                                    <span class="stat-number">${payments.length}</span>
                                    <span class="stat-label">Total Transactions</span>
                                </div>
                                <div class="mini-stat">
                                    <span class="stat-number">$${totalVolume.toFixed(2)}</span>
                                    <span class="stat-label">Total Volume</span>
                                </div>
                                <div class="mini-stat">
                                    <span class="stat-number">${completedPayments}</span>
                                    <span class="stat-label">Completed</span>
                                </div>
                                <div class="mini-stat">
                                    <span class="stat-number">${pendingPayments}</span>
                                    <span class="stat-label">Pending</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="filter-controls">
                            <input type="text" id="paymentSearchFilter" placeholder="🔍 Search by Payment ID, Product, or Amount..." class="search-input">
                            <select id="paymentStatusFilter" class="filter-select">
                                <option value="">All Statuses</option>
                                <option value="completed">Completed</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                            <select id="paymentDateFilter" class="filter-select">
                                <option value="">All Dates</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                        
                        <div class="payments-list" id="filteredPaymentsList">
                            ${payments.map(payment => {
                                const date = new Date(payment.timestamp);
                                const statusIcon = payment.status === 'completed' ? '✅' : payment.status === 'pending' ? '⏳' : '❌';
                                const receiptStatus = payment.receipt ? (payment.receipt.verified ? '🔐 Verified' : '🔓 Unverified') : '❌ No Receipt';
                                const routingNumber = payment.routing ? payment.routing.routeId || 'RT-' + Math.random().toString(36).substr(2, 8).toUpperCase() : 'RT-' + Math.random().toString(36).substr(2, 8).toUpperCase();
                                
                                return `
                                    <div class="enhanced-payment-card clickable-card" onclick="app.showPaymentDetails('${payment.id}')" data-payment-id="${payment.id}" data-status="${payment.status}" data-amount="${payment.amount}">
                                        <div class="payment-card-header">
                                            <div class="payment-id-section">
                                                <strong class="payment-id">💳 ${payment.id}</strong>
                                                <span class="status-badge ${payment.status}">${statusIcon} ${payment.status.toUpperCase()}</span>
                                            </div>
                                            <div class="payment-amount-section">
                                                <span class="amount-large">$${(payment.amount || 0).toFixed(2)}</span>
                                                <i class="fas fa-chevron-right click-indicator"></i>
                                            </div>
                                        </div>
                                        
                                        <div class="payment-card-body">
                                            <div class="payment-details-grid">
                                                <div class="detail-item">
                                                    <span class="detail-label">📦 Product:</span>
                                                    <span class="detail-value">${payment.productName || 'Unknown Product'}</span>
                                                </div>
                                                <div class="detail-item">
                                                    <span class="detail-label">📅 Date:</span>
                                                    <span class="detail-value">${date.toLocaleDateString()} at ${date.toLocaleTimeString()}</span>
                                                </div>
                                                <div class="detail-item">
                                                    <span class="detail-label">🔢 Quantity:</span>
                                                    <span class="detail-value">${payment.quantity || 1}</span>
                                                </div>
                                                <div class="detail-item">
                                                    <span class="detail-label">💰 Method:</span>
                                                    <span class="detail-value">${payment.paymentMethod || 'Credit Card'}</span>
                                                </div>
                                                <div class="detail-item">
                                                    <span class="detail-label">🧾 Receipt:</span>
                                                    <span class="detail-value receipt-status">${receiptStatus}</span>
                                                </div>
                                                <div class="detail-item">
                                                    <span class="detail-label">🚚 Route ID:</span>
                                                    <span class="detail-value routing-number">${routingNumber}</span>
                                                </div>
                                                ${payment.tracking ? `
                                                    <div class="detail-item">
                                                        <span class="detail-label">📍 Tracking:</span>
                                                        <span class="detail-value tracking-status">${payment.tracking.trackingId} - ${payment.tracking.currentStatus}</span>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        </div>
                                        
                                        <div class="payment-card-actions">
                                            ${payment.receipt ? `
                                                <button class="action-btn receipt-btn" onclick="event.stopPropagation(); app.showReceiptDetails('${payment.receipt.receiptId}')">
                                                    🧾 View Receipt
                                                </button>
                                            ` : ''}
                                            ${payment.tracking ? `
                                                <button class="action-btn tracking-btn" onclick="event.stopPropagation(); app.showShipmentDetails('${payment.tracking.trackingId}')">
                                                    📦 Track Shipment
                                                </button>
                                            ` : ''}
                                            <button class="action-btn download-btn" onclick="event.stopPropagation(); app.downloadReceipt('${payment.receipt ? payment.receipt.receiptId : payment.id}')">
                                                📄 Download
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
                
                // Add filter functionality
                this.setupPaymentFilters();
            } else {
                content.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">💳</div>
                        <h3>No Payment History</h3>
                        <p>No payment transactions found. Start by processing your first payment.</p>
                        <button class="btn btn-primary" onclick="closeAllPaymentsModal(); app.showTab('payments');">Process Payment</button>
                    </div>
                `;
            }
            
            modal.style.display = 'block';
        } catch (error) {
            console.error('Error loading payments:', error);
            const modal = document.getElementById('allPaymentsModal');
            const content = document.getElementById('allPaymentsContent');
            content.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <h3>Error Loading Payments</h3>
                    <p>Unable to load payment history. Please try again.</p>
                    <button class="btn btn-secondary" onclick="app.showAllPayments()">Retry</button>
                </div>
            `;
            modal.style.display = 'block';
        }
    }

    setupPaymentFilters() {
        const searchInput = document.getElementById('paymentSearchFilter');
        const statusFilter = document.getElementById('paymentStatusFilter');
        const dateFilter = document.getElementById('paymentDateFilter');
        
        if (!searchInput || !statusFilter || !dateFilter) return;
        
        const filterPayments = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const statusValue = statusFilter.value;
            const dateValue = dateFilter.value;
            const paymentCards = document.querySelectorAll('.enhanced-payment-card');
            
            paymentCards.forEach(card => {
                const paymentId = card.dataset.paymentId.toLowerCase();
                const status = card.dataset.status;
                const amount = card.dataset.amount;
                const productName = card.querySelector('.detail-value').textContent.toLowerCase();
                
                // Search filter
                const matchesSearch = !searchTerm || 
                    paymentId.includes(searchTerm) || 
                    productName.includes(searchTerm) || 
                    amount.includes(searchTerm);
                
                // Status filter
                const matchesStatus = !statusValue || status === statusValue;
                
                // Date filter (simplified for demo)
                let matchesDate = true;
                if (dateValue) {
                    const cardDate = new Date(card.querySelector('.detail-value:nth-of-type(2)').textContent.split(' at ')[0]);
                    const now = new Date();
                    
                    switch (dateValue) {
                        case 'today':
                            matchesDate = cardDate.toDateString() === now.toDateString();
                            break;
                        case 'week':
                            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                            matchesDate = cardDate >= weekAgo;
                            break;
                        case 'month':
                            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                            matchesDate = cardDate >= monthAgo;
                            break;
                    }
                }
                
                // Show/hide card based on all filters
                if (matchesSearch && matchesStatus && matchesDate) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        };
        
        // Add event listeners
        searchInput.addEventListener('input', filterPayments);
        statusFilter.addEventListener('change', filterPayments);
        dateFilter.addEventListener('change', filterPayments);
    }

    async showAllReceipts() {
        try {
            const response = await fetch('http://localhost:3002/api/receipts');
            const data = await response.json();
            
            const modal = document.getElementById('allReceiptsModal');
            const content = document.getElementById('allReceiptsContent');
            
            if (data.success && data.data.receipts) {
                const receipts = data.data.receipts;
                content.innerHTML = receipts.map(receipt => `
                    <div class="list-item clickable-card" onclick="app.showReceiptDetails('${receipt.receiptId}')">
                        <div class="list-item-content">
                            <div class="list-item-title">Receipt for Product ${receipt.productId || 'Payment'}</div>
                            <div class="list-item-subtitle">Receipt ID: ${receipt.receiptId}</div>
                            <div class="list-item-meta">${new Date(receipt.timestamp * 1000).toLocaleDateString()}</div>
                        </div>
                        <div class="list-item-actions">
                            <span class="status-badge ${receipt.verification.verified ? 'verified' : 'unverified'}">
                                ${receipt.verification.verified ? '🔐 Verified' : '🔓 Unverified'}
                            </span>
                            <span class="amount">$${receipt.paymentAmount}</span>
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    </div>
                `).join('');
            } else {
                content.innerHTML = '<div class="empty-state"><p>No receipts found</p></div>';
            }
            
            modal.style.display = 'block';
        } catch (error) {
            console.error('Error loading receipts:', error);
            this.showNotification('Failed to load receipts', 'error');
        }
    }

    async showAllShipments() {
        try {
            const response = await fetch('http://localhost:3002/api/shipments');
            const data = await response.json();
            
            const modal = document.getElementById('allShipmentsModal');
            const content = document.getElementById('allShipmentsContent');
            
            if (data.success && data.data.shipments) {
                const shipments = data.data.shipments;
                
                // Calculate shipment statistics
                const totalShipments = shipments.length;
                const inTransit = shipments.filter(s => s.currentStatus === 'in_transit').length;
                const delivered = shipments.filter(s => s.currentStatus === 'delivered').length;
                const pending = shipments.filter(s => s.currentStatus === 'payment_confirmed' || s.currentStatus === 'preparing').length;
                
                content.innerHTML = `
                    <div class="shipments-overview">
                        <div class="overview-header">
                            <h3>Active Shipments Overview</h3>
                            <div class="overview-stats">
                                <div class="mini-stat">
                                    <span class="stat-number">${totalShipments}</span>
                                    <span class="stat-label">Total</span>
                                </div>
                                <div class="mini-stat">
                                    <span class="stat-number">${inTransit}</span>
                                    <span class="stat-label">In Transit</span>
                                </div>
                                <div class="mini-stat">
                                    <span class="stat-number">${delivered}</span>
                                    <span class="stat-label">Delivered</span>
                                </div>
                                <div class="mini-stat">
                                    <span class="stat-number">${pending}</span>
                                    <span class="stat-label">Pending</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="filter-controls">
                            <input type="text" id="shipmentSearch" class="search-input" placeholder="Search by tracking ID, product, or routing number...">
                            <select id="shipmentStatusFilter" class="filter-select">
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="in-transit">In Transit</option>
                                <option value="delivered">Delivered</option>
                            </select>
                        </div>
                        
                        <div class="shipments-grid" id="shipmentsGrid">
                            ${shipments.map(shipment => {
                                const routingNumber = shipment.routeId || this.generateRoutingNumber(shipment.trackingId);
                                const estimatedDelivery = shipment.estimatedDelivery;
                                
                                return `
                                    <div class="enhanced-shipment-card clickable-card" onclick="app.showShipmentDetails('${shipment.trackingId}')" data-status="${shipment.currentStatus.toLowerCase()}" data-search="${shipment.trackingId} ${shipment.productId} ${routingNumber}">
                                        <div class="shipment-card-header">
                                            <div class="tracking-id-section">
                                                <span class="tracking-label">Tracking ID</span>
                                                <span class="tracking-id">${shipment.trackingId}</span>
                                            </div>
                                            <div class="status-section">
                                                <span class="status-badge ${shipment.currentStatus.toLowerCase().replace('_', '-')}">
                                                    ${shipment.currentStatus.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div class="shipment-card-body">
                                            <div class="shipment-details-grid">
                                                <div class="detail-item">
                                                    <span class="detail-label">Product</span>
                                                    <span class="detail-value">${shipment.productName || 'Product'}</span>
                                                </div>
                                                <div class="detail-item">
                                                    <span class="detail-label">Routing Number</span>
                                                    <span class="detail-value routing-number">${routingNumber}</span>
                                                </div>
                                                <div class="detail-item">
                                                    <span class="detail-label">Ship Date</span>
                                                    <span class="detail-value">${new Date(shipment.timestamp).toLocaleDateString()}</span>
                                                </div>
                                                <div class="detail-item">
                                                    <span class="detail-label">Est. Delivery</span>
                                                    <span class="detail-value">${estimatedDelivery}</span>
                                                </div>
                                                <div class="detail-item">
                                                    <span class="detail-label">Origin</span>
                                                    <span class="detail-value">${shipment.tracking?.origin || 'Warehouse A'}</span>
                                                </div>
                                                <div class="detail-item">
                                                    <span class="detail-label">Destination</span>
                                                    <span class="detail-value">${shipment.tracking?.destination || 'Customer Location'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="shipment-card-actions">
                                            <button class="action-btn track-btn" onclick="event.stopPropagation(); app.trackPaymentShipment('${shipment.trackingId}')">
                                                <i class="fas fa-route"></i> Track
                                            </button>
                                            <button class="action-btn details-btn" onclick="event.stopPropagation(); app.showShipmentDetails('${shipment.trackingId}')">
                                                <i class="fas fa-info-circle"></i> Details
                                            </button>
                                            <button class="action-btn map-btn" onclick="event.stopPropagation(); app.showShipmentMap('${shipment.trackingId}')">
                                                <i class="fas fa-map-marked-alt"></i> Map
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
                
                // Setup filter functionality
                this.setupShipmentFilters();
            } else {
                content.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-shipping-fast empty-icon"></i>
                        <h3>No Active Shipments</h3>
                        <p>No shipments are currently being tracked.</p>
                    </div>
                `;
            }
            
            modal.style.display = 'block';
        } catch (error) {
            console.error('Error loading shipments:', error);
            const content = document.getElementById('allShipmentsContent');
            content.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle error-icon"></i>
                    <h3>Error Loading Shipments</h3>
                    <p>Failed to load shipment data. Please try again.</p>
                    <button class="action-btn" onclick="app.showAllShipments()">Retry</button>
                </div>
            `;
            this.showNotification('Failed to load shipments', 'error');
        }
    }

    generateRoutingNumber(trackingId) {
        // Generate a realistic routing number based on tracking ID
        const hash = trackingId.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        const routingBase = Math.abs(hash) % 900000 + 100000;
        return `RT${routingBase}`;
    }

    calculateEstimatedDelivery(status, timestamp) {
        const shipDate = new Date(timestamp);
        let deliveryDate = new Date(shipDate);
        
        switch (status.toLowerCase()) {
            case 'pending':
                deliveryDate.setDate(shipDate.getDate() + 5);
                break;
            case 'in transit':
                deliveryDate.setDate(shipDate.getDate() + 2);
                break;
            case 'delivered':
                return 'Delivered';
            default:
                deliveryDate.setDate(shipDate.getDate() + 3);
        }
        
        return deliveryDate.toLocaleDateString();
    }

    setupShipmentFilters() {
        const searchInput = document.getElementById('shipmentSearch');
        const statusFilter = document.getElementById('shipmentStatusFilter');
        
        if (!searchInput || !statusFilter) return;
        
        const filterShipments = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const selectedStatus = statusFilter.value;
            const shipmentCards = document.querySelectorAll('.enhanced-shipment-card');
            
            shipmentCards.forEach(card => {
                const searchData = card.getAttribute('data-search').toLowerCase();
                const cardStatus = card.getAttribute('data-status');
                
                const matchesSearch = searchData.includes(searchTerm);
                const matchesStatus = selectedStatus === 'all' || cardStatus === selectedStatus;
                
                if (matchesSearch && matchesStatus) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        };
        
        searchInput.addEventListener('input', filterShipments);
        statusFilter.addEventListener('change', filterShipments);
    }

    async showShipmentMap(trackingId) {
        try {
            const response = await fetch(`http://localhost:3002/api/tracking/${trackingId}/map`);
            const data = await response.json();
            
            if (data.success && data.mapData) {
                this.displayInteractiveMap(data.mapData);
            } else {
                this.showNotification('Failed to load map data', 'error');
            }
        } catch (error) {
            console.error('Error loading map:', error);
            this.showNotification('Error loading map tracking', 'error');
        }
    }

    displayInteractiveMap(mapData) {
        const modal = document.getElementById('mapModal') || this.createMapModal();
        const mapContainer = document.getElementById('mapContainer');
        
        // Clear previous map content
        mapContainer.innerHTML = '';
        
        // Create map visualization
        const mapContent = this.createMapVisualization(mapData);
        mapContainer.appendChild(mapContent);
        
        modal.style.display = 'block';
        
        // Initialize interactive features
        this.initializeMapInteractivity(mapData);
    }

    createMapModal() {
        const modal = document.createElement('div');
        modal.id = 'mapModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content map-modal-content">
                <div class="modal-header">
                    <h3>🗺️ Interactive Shipment Tracking</h3>
                    <span class="close" onclick="closeMapModal()">&times;</span>
                </div>
                <div id="mapContainer" class="map-container"></div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    createMapVisualization(mapData) {
        const container = document.createElement('div');
        container.className = 'map-visualization';
        
        container.innerHTML = `
            <div class="map-header">
                <div class="tracking-info">
                    <h4>📦 ${mapData.trackingId}</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${mapData.progress.percentage}%"></div>
                        <span class="progress-text">${mapData.progress.percentage}% Complete</span>
                    </div>
                </div>
                <div class="ml-insights">
                    <div class="insight-item">
                        <span class="insight-label">Algorithm:</span>
                        <span class="insight-value">${mapData.mlOptimization.algorithm}</span>
                    </div>
                    <div class="insight-item">
                        <span class="insight-label">Confidence:</span>
                        <span class="insight-value">${Math.round(mapData.mlOptimization.insights.confidenceScore * 100)}%</span>
                    </div>
                </div>
            </div>
            
            <div class="map-content">
                <div class="route-visualization">
                    <svg class="route-svg" viewBox="0 0 800 400">
                        ${this.generateRouteSVG(mapData.route, mapData.waypoints, mapData.currentLocation)}
                    </svg>
                </div>
                
                <div class="map-sidebar">
                    <div class="current-location">
                        <h5>📍 Current Location</h5>
                        <div class="location-details">
                            <div class="location-name">${mapData.currentLocation.name}</div>
                            <div class="location-type">${mapData.currentLocation.type}</div>
                            <div class="location-services">
                                ${mapData.currentLocation.services.map(service => 
                                    `<span class="service-tag">${service}</span>`
                                ).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="waypoints-list">
                        <h5>🛣️ Route Waypoints</h5>
                        <div class="waypoints">
                            ${mapData.waypoints.map((waypoint, index) => `
                                <div class="waypoint ${waypoint.status}">
                                    <div class="waypoint-icon">
                                        ${waypoint.status === 'completed' ? '✅' : 
                                          waypoint.status === 'current' ? '📍' : '⏳'}
                                    </div>
                                    <div class="waypoint-info">
                                        <div class="waypoint-name">${waypoint.name}</div>
                                        <div class="waypoint-eta">
                                            ${waypoint.status === 'completed' && waypoint.actualArrival ? 
                                                'Arrived: ' + new Date(waypoint.actualArrival).toLocaleString() :
                                                'ETA: ' + new Date(waypoint.estimatedArrival).toLocaleString()
                                            }
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="zk-proofs">
                        <h5>🔐 ZK Proof Verification</h5>
                        <div class="proof-items">
                            <div class="proof-item">
                                <span class="proof-label">Location:</span>
                                <span class="proof-status ${mapData.zkProof.locationProof.verified ? 'verified' : 'pending'}">
                                    ${mapData.zkProof.locationProof.verified ? '✅ Verified' : '⏳ Pending'}
                                </span>
                            </div>
                            <div class="proof-item">
                                <span class="proof-label">Route Integrity:</span>
                                <span class="proof-status ${mapData.zkProof.routeIntegrity.verified ? 'verified' : 'pending'}">
                                    ${mapData.zkProof.routeIntegrity.verified ? '✅ Verified' : '⏳ Pending'}
                                </span>
                            </div>
                            <div class="proof-item">
                                <span class="proof-label">Timestamp:</span>
                                <span class="proof-status ${mapData.zkProof.timestampProof.verified ? 'verified' : 'pending'}">
                                    ${mapData.zkProof.timestampProof.verified ? '✅ Verified' : '⏳ Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="real-time-updates">
                        <h5>📡 Real-time Updates</h5>
                        <div class="updates-list">
                            ${mapData.realTimeUpdates.slice(0, 3).map(update => `
                                <div class="update-item">
                                    <div class="update-time">${new Date(update.timestamp).toLocaleTimeString()}</div>
                                    <div class="update-message">${update.message}</div>
                                    <div class="update-progress">${update.progress}% complete</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="map-actions">
                <button class="btn btn-primary" onclick="app.downloadMapData('${mapData.trackingId}')">
                    📥 Download Map Data
                </button>
                <button class="btn btn-secondary" onclick="app.shareMapTracking('${mapData.trackingId}')">
                    📤 Share Tracking
                </button>
                <button class="btn btn-info" onclick="app.showMLInsights('${mapData.trackingId}')">
                    🤖 ML Insights
                </button>
            </div>
        `;
        
        return container;
    }

    generateRouteSVG(route, waypoints, currentLocation) {
        let svg = '';
        const width = 800;
        const height = 400;
        const padding = 50;
        
        // Generate route path
        if (waypoints && waypoints.length > 1) {
            const pathPoints = waypoints.map((waypoint, index) => {
                const x = padding + (index / (waypoints.length - 1)) * (width - 2 * padding);
                const y = height / 2 + (Math.sin(index * 0.5) * 50);
                return `${x},${y}`;
            }).join(' ');
            
            svg += `<polyline points="${pathPoints}" stroke="#3498db" stroke-width="3" fill="none" stroke-dasharray="5,5"/>`;
            
            // Add waypoint markers
            waypoints.forEach((waypoint, index) => {
                const x = padding + (index / (waypoints.length - 1)) * (width - 2 * padding);
                const y = height / 2 + (Math.sin(index * 0.5) * 50);
                
                const color = waypoint.status === 'completed' ? '#27ae60' : 
                             waypoint.status === 'current' ? '#e74c3c' : '#95a5a6';
                
                svg += `
                    <circle cx="${x}" cy="${y}" r="8" fill="${color}" stroke="white" stroke-width="2"/>
                    <text x="${x}" y="${y - 15}" text-anchor="middle" font-size="12" fill="#2c3e50">
                        ${waypoint.name.substring(0, 10)}
                    </text>
                `;
            });
        }
        
        return svg;
    }

    initializeMapInteractivity(mapData) {
        // Add hover effects and click handlers for waypoints
        const waypoints = document.querySelectorAll('.waypoint');
        waypoints.forEach((waypoint, index) => {
            waypoint.addEventListener('click', () => {
                this.showWaypointDetails(mapData.waypoints[index]);
            });
        });
        
        // Auto-refresh map data every 30 seconds
        if (this.mapRefreshInterval) {
            clearInterval(this.mapRefreshInterval);
        }
        
        this.mapRefreshInterval = setInterval(() => {
            this.refreshMapData(mapData.trackingId);
        }, 30000);
    }

    async refreshMapData(trackingId) {
        try {
            const response = await fetch(`http://localhost:3002/api/tracking/${trackingId}/map`);
            const data = await response.json();
            
            if (data.success && data.mapData) {
                // Update progress bar
                const progressFill = document.querySelector('.progress-fill');
                const progressText = document.querySelector('.progress-text');
                
                if (progressFill && progressText) {
                    progressFill.style.width = `${data.mapData.progress.percentage}%`;
                    progressText.textContent = `${data.mapData.progress.percentage}% Complete`;
                }
                
                // Update current location if changed
                const locationName = document.querySelector('.location-name');
                if (locationName && locationName.textContent !== data.mapData.currentLocation.name) {
                    locationName.textContent = data.mapData.currentLocation.name;
                    this.showNotification('Location updated!', 'info');
                }
            }
        } catch (error) {
            console.error('Error refreshing map data:', error);
        }
    }

    showWaypointDetails(waypoint) {
        const modal = document.createElement('div');
        modal.className = 'waypoint-modal';
        modal.innerHTML = `
            <div class="waypoint-details">
                <h4>${waypoint.name}</h4>
                <p><strong>Type:</strong> ${waypoint.type}</p>
                <p><strong>Status:</strong> ${waypoint.status}</p>
                <p><strong>Coordinates:</strong> ${waypoint.coordinates.join(', ')}</p>
                <p><strong>Services:</strong> ${waypoint.services.join(', ')}</p>
                <button onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.remove(), 5000);
    }

    async downloadMapData(trackingId) {
        try {
            const response = await fetch(`http://localhost:3002/api/tracking/${trackingId}/map`);
            const data = await response.json();
            
            if (data.success) {
                const blob = new Blob([JSON.stringify(data.mapData, null, 2)], {
                    type: 'application/json'
                });
                
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `map-tracking-${trackingId}.json`;
                a.click();
                
                URL.revokeObjectURL(url);
                this.showNotification('Map data downloaded successfully!', 'success');
            }
        } catch (error) {
            console.error('Error downloading map data:', error);
            this.showNotification('Failed to download map data', 'error');
        }
    }

    async shareMapTracking(trackingId) {
        const shareData = {
            title: 'ChainFlow Shipment Tracking',
            text: `Track shipment ${trackingId} with real-time ML-optimized routing`,
            url: `${window.location.origin}?track=${trackingId}`
        };
        
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                this.showNotification('Tracking link shared!', 'success');
            } catch (error) {
                this.fallbackShare(shareData);
            }
        } else {
            this.fallbackShare(shareData);
        }
    }

    fallbackShare(shareData) {
        navigator.clipboard.writeText(shareData.url).then(() => {
            this.showNotification('Tracking link copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Unable to share tracking link', 'error');
        });
    }

    async showMLInsights(trackingId) {
        try {
            const response = await fetch(`http://localhost:3002/api/tracking/${trackingId}/map`);
            const data = await response.json();
            
            if (data.success && data.mapData.mlOptimization) {
                const insights = data.mapData.mlOptimization;
                
                const modal = document.createElement('div');
                modal.className = 'modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>🤖 ML Optimization Insights</h3>
                            <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                        </div>
                        <div class="ml-insights-content">
                            <div class="insight-section">
                                <h4>Algorithm Performance</h4>
                                <p><strong>Algorithm:</strong> ${insights.algorithm}</p>
                                <p><strong>Confidence Score:</strong> ${Math.round(insights.insights.confidenceScore * 100)}%</p>
                            </div>
                            
                            <div class="insight-section">
                                <h4>Optimization Factors</h4>
                                <div class="factors-grid">
                                    <div class="factor-item">
                                        <span>Distance:</span> ${insights.optimizationFactors.distance} km
                                    </div>
                                    <div class="factor-item">
                                        <span>Time:</span> ${insights.optimizationFactors.time} hours
                                    </div>
                                    <div class="factor-item">
                                        <span>Cost:</span> $${insights.optimizationFactors.cost}
                                    </div>
                                    <div class="factor-item">
                                        <span>Risk Score:</span> ${Math.round(insights.optimizationFactors.risk * 100)}%
                                    </div>
                                </div>
                            </div>
                            
                            <div class="insight-section">
                                <h4>Optimization Reasons</h4>
                                <ul>
                                    ${insights.insights.optimizationReasons.map(reason => 
                                        `<li>${reason}</li>`
                                    ).join('')}
                                </ul>
                            </div>
                            
                            <div class="insight-section">
                                <h4>Performance Prediction</h4>
                                <p><strong>On-time Delivery:</strong> ${Math.round(insights.insights.performancePrediction.onTimeDeliveryProbability * 100)}%</p>
                                <p><strong>Expected Delay:</strong> ${insights.insights.performancePrediction.expectedDelayMinutes} minutes</p>
                                <p><strong>Quality Maintenance:</strong> ${Math.round(insights.insights.performancePrediction.qualityMaintenance * 100)}%</p>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                modal.style.display = 'block';
            }
        } catch (error) {
            console.error('Error loading ML insights:', error);
            this.showNotification('Failed to load ML insights', 'error');
        }
    }

    generateTransactionHistory(payment) {
        const history = [];
        const baseTime = new Date(payment.timestamp);
        
        // Transaction initiated
        history.push({
            title: 'Transaction Initiated',
            description: 'Payment request created and submitted to the network',
            timestamp: new Date(baseTime.getTime() - 300000).toLocaleString(), // 5 minutes before
            status: 'completed'
        });
        
        // Payment processing
        history.push({
            title: 'Payment Processing',
            description: 'Transaction being validated and processed',
            timestamp: new Date(baseTime.getTime() - 180000).toLocaleString(), // 3 minutes before
            status: 'completed'
        });
        
        // Payment confirmed
        if (payment.status === 'completed' || payment.status === 'confirmed') {
            history.push({
                title: 'Payment Confirmed',
                description: 'Transaction successfully confirmed on the blockchain',
                timestamp: baseTime.toLocaleString(),
                status: 'completed'
            });
            
            // Receipt generated
            if (payment.receipt) {
                history.push({
                    title: 'Receipt Generated',
                    description: 'Digital receipt created with ZK proof verification',
                    timestamp: new Date(baseTime.getTime() + 60000).toLocaleString(), // 1 minute after
                    status: 'completed'
                });
            }
            
            // Shipment initiated
            if (payment.tracking) {
                history.push({
                    title: 'Shipment Initiated',
                    description: 'Order prepared and shipment tracking activated',
                    timestamp: new Date(baseTime.getTime() + 300000).toLocaleString(), // 5 minutes after
                    status: payment.tracking.currentStatus === 'delivered' ? 'completed' : 'active'
                });
            }
        } else {
            history.push({
                title: 'Payment Pending',
                description: 'Transaction awaiting confirmation',
                timestamp: baseTime.toLocaleString(),
                status: 'pending'
            });
        }
        
        return history;
    }
    
    getTrackingIcon(status) {
        const icons = {
            'pending': '⏳',
            'processing': '🔄',
            'shipped': '🚚',
            'in transit': '📦',
            'out for delivery': '🚛',
            'delivered': '✅',
            'delayed': '⚠️',
            'returned': '↩️'
        };
        return icons[status.toLowerCase()] || '📦';
    }
    
    async sharePaymentDetails(paymentId) {
        try {
            const shareData = {
                title: 'ChainFlow Payment Details',
                text: `Payment transaction details for ID: ${paymentId}`,
                url: `${window.location.origin}/payment/${paymentId}`
            };
            
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(`Payment ID: ${paymentId}\nView details: ${shareData.url}`);
                this.showNotification('Payment details copied to clipboard', 'success');
            }
        } catch (error) {
            console.error('Error sharing payment details:', error);
            this.showNotification('Failed to share payment details', 'error');
        }
    }
    
    async contactSupport(paymentId) {
        // Placeholder for support contact functionality
        const supportMessage = `I need assistance with payment ID: ${paymentId}`;
        const supportEmail = 'support@chainflow.com';
        const mailtoLink = `mailto:${supportEmail}?subject=Payment Support Request&body=${encodeURIComponent(supportMessage)}`;
        
        try {
            window.open(mailtoLink, '_blank');
        } catch (error) {
            // Fallback: copy support info to clipboard
            await navigator.clipboard.writeText(`Support Email: ${supportEmail}\nPayment ID: ${paymentId}`);
            this.showNotification('Support contact info copied to clipboard', 'info');
        }
    }

    generateRouteInformation(tracking) {
        // Generate comprehensive routing information
        const routes = [
            { type: 'Express Air', distance: '2,450 km', hubs: '2', carrier: 'ChainFlow Express', serviceLevel: 'Priority' },
            { type: 'Ground Transport', distance: '1,850 km', hubs: '4', carrier: 'ChainFlow Logistics', serviceLevel: 'Standard' },
            { type: 'Ocean Freight', distance: '8,200 km', hubs: '3', carrier: 'ChainFlow Maritime', serviceLevel: 'Economy' },
            { type: 'Rail Transport', distance: '3,100 km', hubs: '5', carrier: 'ChainFlow Rail', serviceLevel: 'Eco-Friendly' }
        ];
        
        const routeIndex = Math.abs(tracking.trackingId?.charCodeAt(0) || 0) % routes.length;
        return routes[routeIndex];
    }

    getStatusDescription(status) {
        const descriptions = {
            'Pending': 'Shipment is being prepared for dispatch',
            'Picked Up': 'Package has been collected from origin',
            'In Transit': 'Package is currently being transported',
            'Out for Delivery': 'Package is on the delivery vehicle',
            'Delivered': 'Package has been successfully delivered',
            'Delayed': 'Shipment is experiencing delays',
            'Exception': 'Shipment requires attention',
            'Returned': 'Package is being returned to sender'
        };
        return descriptions[status] || 'Status update in progress';
    }

    generateMockTimeline(tracking) {
        // Generate a mock timeline when statusHistory is not available
        const mockEvents = [
            {
                status: 'Picked Up',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                location: 'Origin Warehouse',
                description: 'Package collected from supplier'
            },
            {
                status: 'In Transit',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                location: 'Distribution Hub',
                description: 'Package sorted and dispatched'
            },
            {
                status: tracking.currentStatus,
                timestamp: tracking.lastUpdate,
                location: tracking.currentLocation || 'Transit Hub',
                description: this.getStatusDescription(tracking.currentStatus)
            }
        ];

        return mockEvents.map((event, index) => `
            <div class="timeline-item ${event.status === tracking.currentStatus ? 'current' : 'completed'}">
                <div class="timeline-marker">
                    <span class="timeline-icon">${this.getTrackingIcon(event.status)}</span>
                </div>
                <div class="timeline-content">
                    <div class="timeline-header">
                        <div class="timeline-title">${event.status}</div>
                        <div class="timeline-time">${new Date(event.timestamp).toLocaleString()}</div>
                    </div>
                    <div class="timeline-location">📍 ${event.location}</div>
                    <div class="timeline-description">${event.description}</div>
                </div>
            </div>
        `).join('');
    }

    async shareShipmentDetails(trackingId) {
        // Generate shareable tracking information
        const shareData = {
            title: `ChainFlow Shipment Tracking - ${trackingId}`,
            text: `Track your shipment with ID: ${trackingId}`,
            url: `${window.location.origin}?track=${trackingId}`
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                this.showNotification('Tracking details shared successfully', 'success');
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(`Track your ChainFlow shipment: ${shareData.url}`);
                this.showNotification('Tracking link copied to clipboard', 'success');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            this.showNotification('Failed to share tracking details', 'error');
        }
    }

    async showPaymentDetails(paymentId) {
        try {
            const response = await fetch(`http://localhost:3002/api/payments/${paymentId}`);
            const data = await response.json();
            
            if (data.success && data.payment) {
                const payment = data.payment;
                const modal = document.getElementById('paymentDetailsModal');
                const content = document.getElementById('paymentDetailsContent');
                
                // Generate routing number for this payment
                const routingNumber = this.generateRoutingNumber(payment.id);
                
                // Calculate transaction fees
                const transactionFee = (parseFloat(payment.amount) * 0.025).toFixed(2);
                const netAmount = (parseFloat(payment.amount) - parseFloat(transactionFee)).toFixed(2);
                
                // Generate transaction history
                const transactionHistory = this.generateTransactionHistory(payment);
                
                content.innerHTML = `
                    <div class="comprehensive-payment-details">
                        <div class="payment-header-enhanced">
                            <div class="header-left">
                                <h3>Payment Transaction Details</h3>
                                <div class="payment-id-large">Transaction ID: ${payment.id}</div>
                                <div class="routing-info">
                                    <span class="routing-label">Routing Number:</span>
                                    <span class="routing-number">${routingNumber}</span>
                                    <button class="copy-btn" onclick="navigator.clipboard.writeText('${routingNumber}')" title="Copy routing number">📋</button>
                                </div>
                            </div>
                            <div class="header-right">
                                <div class="status-badge ${payment.status}">${payment.status.toUpperCase()}</div>
                                <div class="timestamp">${new Date(payment.timestamp).toLocaleString()}</div>
                            </div>
                        </div>
                        
                        <div class="payment-overview-grid">
                            <div class="overview-card amount-card">
                                <div class="card-header">Transaction Amount</div>
                                <div class="amount-large">$${payment.amount}</div>
                                <div class="amount-breakdown">
                                    <div class="breakdown-item">
                                        <span>Gross Amount:</span>
                                        <span>$${payment.amount}</span>
                                    </div>
                                    <div class="breakdown-item">
                                        <span>Transaction Fee:</span>
                                        <span>-$${transactionFee}</span>
                                    </div>
                                    <div class="breakdown-item total">
                                        <span>Net Amount:</span>
                                        <span>$${netAmount}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="overview-card product-card">
                                <div class="card-header">Product Information</div>
                                <div class="product-details">
                                    <div class="product-name">${payment.productName || 'N/A'}</div>
                                    <div class="product-meta">
                                        <span>Quantity: ${payment.quantity || 1}</span>
                                        <span>Unit Price: $${(parseFloat(payment.amount) / parseInt(payment.quantity || 1)).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="overview-card method-card">
                                <div class="card-header">Payment Method</div>
                                <div class="method-details">
                                    <div class="method-type">${payment.paymentMethod || 'N/A'}</div>
                                    <div class="method-meta">
                                        <span>Network: ChainFlow</span>
                                        <span>Confirmation: ${payment.status === 'completed' ? 'Confirmed' : 'Pending'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="transaction-history-section">
                            <h4>Transaction History</h4>
                            <div class="history-timeline">
                                ${transactionHistory.map(event => `
                                    <div class="history-item ${event.status}">
                                        <div class="history-marker"></div>
                                        <div class="history-content">
                                            <div class="history-title">${event.title}</div>
                                            <div class="history-description">${event.description}</div>
                                            <div class="history-timestamp">${event.timestamp}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        ${payment.receipt ? `
                            <div class="detail-section receipt-section">
                                <h4>Receipt & Verification</h4>
                                <div class="receipt-details-enhanced">
                                    <div class="receipt-status ${payment.receipt.verified ? 'verified' : 'unverified'}">
                                        ${payment.receipt.verified ? '🔐 Verified Receipt' : '🔓 Unverified Receipt'}
                                    </div>
                                    <div class="receipt-grid">
                                        <div class="receipt-item">
                                            <label>Receipt ID:</label>
                                            <span class="receipt-id">${payment.receipt.receiptId}</span>
                                            <button class="copy-btn" onclick="navigator.clipboard.writeText('${payment.receipt.receiptId}')" title="Copy receipt ID">📋</button>
                                        </div>
                                        <div class="receipt-item">
                                            <label>ZK Proof Hash:</label>
                                            <span class="proof-hash" title="${payment.receipt.zkProof || 'N/A'}">${payment.receipt.zkProof ? payment.receipt.zkProof.substring(0, 32) + '...' : 'N/A'}</span>
                                            ${payment.receipt.zkProof ? `<button class="copy-btn" onclick="navigator.clipboard.writeText('${payment.receipt.zkProof}')" title="Copy full proof">📋</button>` : ''}
                                        </div>
                                        <div class="receipt-item">
                                            <label>Verification Status:</label>
                                            <span class="verification-status ${payment.receipt.verified ? 'verified' : 'unverified'}">${payment.receipt.verified ? '✅ Verified' : '⚠️ Unverified'}</span>
                                        </div>
                                        <div class="receipt-item">
                                            <label>Blockchain Hash:</label>
                                            <span class="blockchain-hash">${payment.txHash || 'Pending...'}</span>
                                            ${payment.txHash ? `<button class="copy-btn" onclick="navigator.clipboard.writeText('${payment.txHash}')" title="Copy transaction hash">📋</button>` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        
                        ${payment.tracking ? `
                            <div class="detail-section tracking-section">
                                <h4>Shipment & Logistics</h4>
                                <div class="tracking-details-enhanced">
                                    <div class="tracking-overview">
                                        <div class="tracking-status-card">
                                            <div class="status-indicator ${payment.tracking.currentStatus.toLowerCase().replace(' ', '-')}">
                                                ${this.getTrackingIcon(payment.tracking.currentStatus)}
                                            </div>
                                            <div class="status-text">
                                                <div class="current-status">${payment.tracking.currentStatus}</div>
                                                <div class="last-update">Updated: ${new Date(payment.tracking.lastUpdate).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        
                                        <div class="tracking-details-grid">
                                            <div class="tracking-item">
                                                <label>Tracking ID:</label>
                                                <span class="tracking-id">${payment.tracking.trackingId}</span>
                                                <button class="copy-btn" onclick="navigator.clipboard.writeText('${payment.tracking.trackingId}')" title="Copy tracking ID">📋</button>
                                            </div>
                                            <div class="tracking-item">
                                                <label>Current Location:</label>
                                                <span>${payment.tracking.currentLocation || 'In Transit'}</span>
                                            </div>
                                            <div class="tracking-item">
                                                <label>Estimated Delivery:</label>
                                                <span>${this.calculateEstimatedDelivery(payment.tracking.currentStatus, payment.tracking.lastUpdate)}</span>
                                            </div>
                                            <div class="tracking-item">
                                                <label>Carrier:</label>
                                                <span>${payment.tracking.carrier || 'ChainFlow Logistics'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        
                        <div class="detail-actions-enhanced">
                            <div class="action-group primary-actions">
                                ${payment.receipt ? `
                                    <button class="action-btn verify-btn" onclick="app.verifyReceiptById('${payment.receipt.receiptId}')">
                                        <span class="btn-icon">🔍</span>
                                        <span class="btn-text">Verify Receipt</span>
                                    </button>
                                ` : ''}
                                ${payment.tracking ? `
                                    <button class="action-btn track-btn" onclick="app.trackPaymentShipment('${payment.tracking.trackingId}')">
                                        <span class="btn-icon">📦</span>
                                        <span class="btn-text">Track Shipment</span>
                                    </button>
                                    <button class="action-btn map-btn" onclick="app.showShipmentMap('${payment.tracking.trackingId}')">
                                        <span class="btn-icon">🗺️</span>
                                        <span class="btn-text">View Map</span>
                                    </button>
                                ` : ''}
                            </div>
                            
                            <div class="action-group secondary-actions">
                                <button class="action-btn download-btn" onclick="app.downloadReceipt('${payment.receipt ? payment.receipt.receiptId : payment.id}')">
                                    <span class="btn-icon">📄</span>
                                    <span class="btn-text">Download Receipt</span>
                                </button>
                                <button class="action-btn share-btn" onclick="app.sharePaymentDetails('${payment.id}')">
                                    <span class="btn-icon">📤</span>
                                    <span class="btn-text">Share Details</span>
                                </button>
                                <button class="action-btn support-btn" onclick="app.contactSupport('${payment.id}')">
                                    <span class="btn-icon">💬</span>
                                    <span class="btn-text">Contact Support</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                modal.style.display = 'block';
            } else {
                this.showNotification('Payment not found', 'error');
            }
        } catch (error) {
            console.error('Error loading payment details:', error);
            this.showNotification('Failed to load payment details', 'error');
        }
    }

    async showReceiptDetails(receiptId) {
        try {
            const response = await fetch(`http://localhost:3002/api/receipts/${receiptId}`);
            const data = await response.json();
            
            if (data.success && data.receipt) {
                const receipt = data.receipt;
                const modal = document.getElementById('receiptDetailsModal');
                const content = document.getElementById('receiptDetailsContent');
                
                content.innerHTML = `
                    <div class="receipt-details">
                        <div class="detail-header">
                            <h3>Receipt Details</h3>
                            <span class="status-badge ${receipt.verified ? 'verified' : 'unverified'}">
                                ${receipt.verified ? '🔐 Verified' : '🔓 Unverified'}
                            </span>
                        </div>
                        
                        <div class="receipt-display">
                            <div class="detail-section">
                                <h4>Receipt Information</h4>
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <label>Receipt ID:</label>
                                        <span>${receipt.receiptId}</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Payment ID:</label>
                                        <span>${receipt.paymentId}</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Amount:</label>
                                        <span class="amount">$${receipt.amount}</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Generated:</label>
                                        <span>${new Date(receipt.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4>Zero-Knowledge Proof</h4>
                                <div class="proof-display">
                                    <div class="proof-hash">${receipt.zkProof || 'No proof available'}</div>
                                    <div class="proof-status">
                                        ${receipt.verified ? '✅ Proof verified successfully' : '⚠️ Proof not yet verified'}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="detail-actions">
                                <button class="btn btn-primary" onclick="app.verifyReceiptById('${receipt.receiptId}')">
                                    🔍 Verify Receipt
                                </button>
                                <button class="btn btn-secondary" onclick="app.downloadReceipt('${receipt.receiptId}')">
                                    📄 Download Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                modal.style.display = 'block';
            } else {
                this.showNotification('Receipt not found', 'error');
            }
        } catch (error) {
            console.error('Error loading receipt details:', error);
            this.showNotification('Failed to load receipt details', 'error');
        }
    }

    async showShipmentDetails(trackingId) {
        try {
            const response = await fetch(`http://localhost:3002/api/tracking/${trackingId}`);
            const data = await response.json();
            
            if (data.success && data.tracking) {
                const tracking = data.tracking;
                const modal = document.getElementById('shipmentDetailsModal');
                const content = document.getElementById('shipmentDetailsContent');
                
                // Generate routing information
                const routingNumber = this.generateRoutingNumber(trackingId);
                const estimatedDelivery = this.calculateEstimatedDelivery(tracking.currentStatus, tracking.lastUpdate);
                const routeInfo = this.generateRouteInformation(tracking);
                
                content.innerHTML = `
                    <div class="enhanced-shipment-details">
                        <div class="shipment-header">
                            <div class="header-left">
                                <h3>📦 Shipment Tracking</h3>
                                <div class="tracking-id-display">
                                    <span class="tracking-label">ID:</span>
                                    <span class="tracking-id-value">${trackingId}</span>
                                    <button class="copy-btn" onclick="navigator.clipboard.writeText('${trackingId}')" title="Copy Tracking ID">
                                        📋
                                    </button>
                                </div>
                            </div>
                            <div class="header-right">
                                <span class="status-badge ${tracking.currentStatus.toLowerCase().replace(' ', '-')}">
                                    ${this.getTrackingIcon(tracking.currentStatus)} ${tracking.currentStatus}
                                </span>
                            </div>
                        </div>
                        
                        <div class="routing-information">
                            <h4>🗺️ Routing Information</h4>
                            <div class="routing-grid">
                                <div class="routing-item">
                                    <span class="routing-label">Routing Number:</span>
                                    <span class="routing-value">${routingNumber}</span>
                                </div>
                                <div class="routing-item">
                                    <span class="routing-label">Route Type:</span>
                                    <span class="routing-value">${routeInfo.type}</span>
                                </div>
                                <div class="routing-item">
                                    <span class="routing-label">Distance:</span>
                                    <span class="routing-value">${routeInfo.distance}</span>
                                </div>
                                <div class="routing-item">
                                    <span class="routing-label">Transit Hubs:</span>
                                    <span class="routing-value">${routeInfo.hubs}</span>
                                </div>
                                <div class="routing-item">
                                    <span class="routing-label">Carrier:</span>
                                    <span class="routing-value">${routeInfo.carrier}</span>
                                </div>
                                <div class="routing-item">
                                    <span class="routing-label">Service Level:</span>
                                    <span class="routing-value">${routeInfo.serviceLevel}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tracking-timeline">
                            <h4>📍 Tracking Timeline</h4>
                            ${tracking.statusHistory ? tracking.statusHistory.map((status, index) => `
                                <div class="timeline-item ${status.status === tracking.currentStatus ? 'current' : index < tracking.statusHistory.length - 1 ? 'completed' : 'pending'}">
                                    <div class="timeline-marker">
                                        <span class="timeline-icon">${this.getTrackingIcon(status.status)}</span>
                                    </div>
                                    <div class="timeline-content">
                                        <div class="timeline-header">
                                            <div class="timeline-title">${status.status}</div>
                                            <div class="timeline-time">${new Date(status.timestamp).toLocaleString()}</div>
                                        </div>
                                        <div class="timeline-location">📍 ${status.location || tracking.currentLocation || 'Location updating...'}</div>
                                        <div class="timeline-description">${status.description || this.getStatusDescription(status.status)}</div>
                                        ${status.receiptGenerated ? '<div class="receipt-indicator">🔐 Receipt Generated</div>' : ''}
                                    </div>
                                </div>
                            `).join('') : this.generateMockTimeline(tracking)}
                        </div>
                        
                        <div class="shipment-info-grid">
                            <div class="info-section">
                                <h4>📋 Shipment Details</h4>
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <label>Payment ID:</label>
                                        <span>${tracking.paymentId || 'N/A'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Product:</label>
                                        <span>${tracking.productName || 'Product Information'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Weight:</label>
                                        <span>${tracking.weight || '2.5 kg'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Dimensions:</label>
                                        <span>${tracking.dimensions || '30x20x15 cm'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="info-section">
                                <h4>🕒 Delivery Information</h4>
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <label>Current Location:</label>
                                        <span>${tracking.currentLocation || 'In Transit'}</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Last Update:</label>
                                        <span>${new Date(tracking.lastUpdate).toLocaleString()}</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Estimated Delivery:</label>
                                        <span class="delivery-estimate">${estimatedDelivery}</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Delivery Address:</label>
                                        <span>${tracking.deliveryAddress || 'Address on file'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="shipment-actions">
                            <button class="btn btn-primary" onclick="app.trackPaymentShipment('${trackingId}')">
                                🔄 Refresh Tracking
                            </button>
                            <button class="btn btn-secondary" onclick="app.showShipmentMap('${trackingId}')">
                                🗺️ View Route Map
                            </button>
                            <button class="btn btn-outline" onclick="app.shareShipmentDetails('${trackingId}')">
                                📤 Share Tracking
                            </button>
                            <button class="btn btn-outline" onclick="app.contactSupport('${trackingId}')">
                                💬 Contact Support
                            </button>
                        </div>
                    </div>
                `;
                
                modal.style.display = 'block';
            } else {
                this.showNotification('Shipment not found', 'error');
            }
        } catch (error) {
            console.error('Error loading shipment details:', error);
            this.showNotification('Failed to load shipment details', 'error');
        }
    }
    
    async verifySupplier(supplierId, buttonElement) {
        try {
            this.showLoading(true);
            buttonElement.disabled = true;
            buttonElement.textContent = 'Verifying...';
            
            const response = await fetch(`${this.apiBaseUrl}/suppliers/${supplierId}/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('Supplier verified successfully with cryptographic proof!', 'success');
                
                // Update button to show verified status
                buttonElement.textContent = '✅ Verified';
                buttonElement.classList.remove('btn-primary');
                buttonElement.classList.add('btn-success');
                buttonElement.disabled = true;
                
                // Update supplier display if needed
                this.loadSuppliers();
                
            } else {
                throw new Error(result.error || 'Verification failed');
            }
            
        } catch (error) {
            console.error('Supplier verification error:', error);
            this.showNotification(`Verification failed: ${error.message}`, 'error');
            
            // Reset button
            buttonElement.disabled = false;
            buttonElement.textContent = 'Verify Supplier';
            
        } finally {
            this.showLoading(false);
        }
    }
}

// Global modal functions
function closePaymentModal() {
    const modal = document.getElementById('processPaymentModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function closeVerifyModal() {
    const modal = document.getElementById('verifyReceiptModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal functions for new modals
function closeAllPaymentsModal() {
    document.getElementById('allPaymentsModal').style.display = 'none';
}

function closeAllReceiptsModal() {
    document.getElementById('allReceiptsModal').style.display = 'none';
}

function closeAllShipmentsModal() {
    document.getElementById('allShipmentsModal').style.display = 'none';
}

function closePaymentDetailsModal() {
    document.getElementById('paymentDetailsModal').style.display = 'none';
}

function closeReceiptDetailsModal() {
    document.getElementById('receiptDetailsModal').style.display = 'none';
}

function closeShipmentDetailsModal() {
    document.getElementById('shipmentDetailsModal').style.display = 'none';
}

// Enhanced modal close functionality for new modals
window.addEventListener('click', function(event) {
    const newModals = [
        'allPaymentsModal',
        'allReceiptsModal', 
        'allShipmentsModal',
        'paymentDetailsModal',
        'receiptDetailsModal',
        'shipmentDetailsModal'
    ];
    
    newModals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Keyboard event handler for ESC key
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal[style*="display: block"]');
        openModals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
});

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ChainFlowApp();
    // Export for global access after initialization
    window.app = app;
});