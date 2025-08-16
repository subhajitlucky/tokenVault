import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home(){
    const [tokenPrices, setTokenPrices] = useState({});
    const [loading, setLoading] = useState(true);
    
    // Popular tokens to display on homepage
    const popularTokens = {
        'bitcoin': 'BTC',
        'ethereum': 'ETH',
        'solana': 'SOL',
        'matic-network': 'MATIC',
        'usd-coin': 'USDC',
        'tether': 'USDT'
    };
    
    useEffect(() => {
        const fetchTokenPrices = async () => {
            try {
                const ids = Object.keys(popularTokens).join(',');
                const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`);
                const data = await response.json();
                
                // Map the data to our format
                const prices = {};
                Object.keys(popularTokens).forEach(id => {
                    if (data[id] && data[id].usd) {
                        prices[popularTokens[id]] = data[id].usd;
                    }
                });
                
                setTokenPrices(prices);
            } catch (error) {
                console.error('Error fetching token prices:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchTokenPrices();
    }, []);
    
    return(
        <div className="home-page">
            {/* Header Section */}
            <section className="header-section">
                <div className="container">
                    <div className="header-content">
                        <div className="header-text">
                            <h1 className="header-title">🔐 TokenVault</h1>
                            <p className="header-subtitle">Professional Multi-Chain Portfolio Tracker</p>
                            <p className="header-description">
                                Securely track your cryptocurrency portfolio across multiple blockchains. 
                                Monitor all your token holdings in one place without compromising your privacy.
                            </p>
                            <Link to="/tracker" className="header-button">
                                Start Tracking Now
                            </Link>
                        </div>
                        <div className="header-visual">
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <h3>Portfolio Overview</h3>
                                </div>
                                <div className="card-content">
                                    <div className="balance-display">
                                        <span className="balance-label">Total Balance</span>
                                        <span className="balance-amount">$0.00</span>
                                    </div>
                                    <div className="tokens-list">
                                        <div className="token-placeholder">Your tokens will appear here</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Token Prices Section */}
            <section className="prices-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Live Token Prices</h2>
                        <p className="section-subtitle">
                            Real-time prices for popular cryptocurrencies
                        </p>
                    </div>
                    
                    {loading ? (
                        <div className="prices-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading token prices...</p>
                        </div>
                    ) : (
                        <div className="prices-grid">
                            {Object.entries(popularTokens).map(([id, symbol]) => (
                                <div key={symbol} className="price-card">
                                    <div className="price-symbol">{symbol}</div>
                                    <div className="price-value">
                                        {tokenPrices[symbol] ? `${tokenPrices[symbol].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Why Choose TokenVault?</h2>
                        <p className="section-subtitle">
                            Everything you need to manage your multi-chain portfolio effectively
                        </p>
                    </div>
                    
                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">🌐</div>
                            <h3>Multi-Chain Support</h3>
                            <p>Track assets across 8+ blockchain networks</p>
                        </div>
                        
                        <div className="feature-item">
                            <div className="feature-icon">🔒</div>
                            <h3>Secure & Private</h3>
                            <p>No keys required - read-only tracking</p>
                        </div>
                        
                        <div className="feature-item">
                            <div className="feature-icon">⚡</div>
                            <h3>Real-Time Data</h3>
                            <p>Live balance updates and token tracking</p>
                        </div>
                        
                        <div className="feature-item">
                            <div className="feature-icon">📊</div>
                            <h3>Complete Portfolio View</h3>
                            <p>See all your token holdings across all networks</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Networks Section */}
            <section className="networks-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Supported Networks</h2>
                        <p className="section-subtitle">
                            Track your assets across all major blockchain networks
                        </p>
                    </div>
                    
                    <div className="networks-list">
                        <div className="network-item">
                            <span className="network-name">Solana</span>
                            <span className="network-status active">●</span>
                        </div>
                        <div className="network-item">
                            <span className="network-name">Ethereum</span>
                            <span className="network-status active">●</span>
                        </div>
                        <div className="network-item">
                            <span className="network-name">Polygon</span>
                            <span className="network-status active">●</span>
                        </div>
                        <div className="network-item">
                            <span className="network-name">Arbitrum</span>
                            <span className="network-status active">●</span>
                        </div>
                        <div className="network-item">
                            <span className="network-name">Optimism</span>
                            <span className="network-status active">●</span>
                        </div>
                        <div className="network-item">
                            <span className="network-name">Base</span>
                            <span className="network-status active">●</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">Ready to Track Your Portfolio?</h2>
                        <p className="cta-description">
                            Join thousands of users who trust TokenVault for their multi-chain portfolio management.
                        </p>
                        <Link to="/tracker" className="cta-button">
                            Get Started
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;