import React, { useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';

function Tracker() {
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState(null);
    const [tokenBalances, setTokenBalances] = useState([]);
    const [tokenPrices, setTokenPrices] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [network, setNetwork] = useState('solana-devnet');
    
    // Expanded RPC endpoints for multiple chains
    const endpoints = {
        // Solana Networks
        'solana-devnet': {
            rpc: 'https://api.devnet.solana.com',
            type: 'solana',
            name: 'Solana Devnet',
            symbol: 'SOL',
            decimals: 9
        },
        'solana-mainnet': {
            rpc: 'https://solana-mainnet.g.alchemy.com/v2/demo',
            type: 'solana', 
            name: 'Solana Mainnet',
            symbol: 'SOL',
            decimals: 9
        },
        
        // Ethereum Networks
        'ethereum-mainnet': {
            rpc: 'https://ethereum.publicnode.com',
            type: 'ethereum',
            name: 'Ethereum Mainnet',
            symbol: 'ETH',
            decimals: 18
        },
        'ethereum-sepolia': {
            rpc: 'https://sepolia.gateway.tenderly.co',
            type: 'ethereum',
            name: 'Ethereum Sepolia',
            symbol: 'ETH',
            decimals: 18
        },
        
        // Layer 2 Networks
        'polygon-mainnet': {
            rpc: 'https://polygon-rpc.com',
            type: 'ethereum',
            name: 'Polygon Mainnet',
            symbol: 'MATIC',
            decimals: 18
        },
        'arbitrum-one': {
            rpc: 'https://arb1.arbitrum.io/rpc',
            type: 'ethereum',
            name: 'Arbitrum One',
            symbol: 'ETH',
            decimals: 18
        },
        'optimism-mainnet': {
            rpc: 'https://mainnet.optimism.io',
            type: 'ethereum',
            name: 'Optimism Mainnet',
            symbol: 'ETH',
            decimals: 18
        },
        'base-mainnet': {
            rpc: 'https://mainnet.base.org',
            type: 'ethereum',
            name: 'Base Mainnet',
            symbol: 'ETH',
            decimals: 18
        }
    };

    // Popular ERC-20 tokens for fallback detection
    const popularTokens = {
        'ethereum-mainnet': [
            { address: '0xA0b86a33E6417c39C89B44bffE5DD3a7E35FAE22', symbol: 'USDC', decimals: 6 },
            { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', decimals: 6 },
            { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', symbol: 'WETH', decimals: 18 }
        ],
        'polygon-mainnet': [
            { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', decimals: 6 },
            { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', decimals: 6 }
        ]
    };

    // Token symbol to CoinGecko ID mapping
    const tokenToCoinGeckoId = {
        'SOL': 'solana',
        'ETH': 'ethereum',
        'MATIC': 'matic-network',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'WETH': 'weth'
    };

    const getEthereumBalance = async (provider, walletAddress) => {
        const balance = await provider.getBalance(walletAddress);
        return ethers.utils.formatEther(balance);
    };

    const getTokenBalance = async (provider, tokenAddress, walletAddress, decimals) => {
        const abi = ['function balanceOf(address) view returns (uint256)'];
        const contract = new ethers.Contract(tokenAddress, abi, provider);
        const balance = await contract.balanceOf(walletAddress);
        return ethers.utils.formatUnits(balance, decimals);
    };

    const getSolanaBalance = async (connection, publicKey) => {
        const lamports = await connection.getBalance(publicKey);
        return lamports / 1e9;
    };

    // Function to fetch token prices from CoinGecko
    const fetchTokenPrices = async (tokenSymbols) => {
        try {
            // Filter out tokens that we don't have CoinGecko IDs for
            const validTokens = tokenSymbols.filter(symbol => tokenToCoinGeckoId[symbol]);
            const coinGeckoIds = validTokens.map(symbol => tokenToCoinGeckoId[symbol]);
            
            if (coinGeckoIds.length === 0) return {};
            
            // Join the IDs with commas for the API request
            const idsString = coinGeckoIds.join(',');
            
            // Fetch prices from CoinGecko API
            const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=usd`);
            const data = await response.json();
            
            // Map the prices back to token symbols
            const prices = {};
            validTokens.forEach((symbol, index) => {
                const coinGeckoId = coinGeckoIds[index];
                if (data[coinGeckoId] && data[coinGeckoId].usd) {
                    prices[symbol] = data[coinGeckoId].usd;
                }
            });
            
            return prices;
        } catch (error) {
            console.error('Error fetching token prices:', error);
            return {};
        }
    };

    // Function to detect all tokens for Ethereum-compatible chains
    const getAllEthereumTokens = async (provider, walletAddress, networkKey) => {
        try {
            // For now, we'll use popular tokens as a starting point
            // In a production environment, you would integrate with a token list API
            const tokens = popularTokens[networkKey] || [];
            
            const tokenPromises = tokens.map(async (token) => {
                try {
                    const balance = await getTokenBalance(
                        provider, 
                        token.address, 
                        walletAddress, 
                        token.decimals
                    );
                    return {
                        symbol: token.symbol,
                        address: token.address,
                        balance: parseFloat(balance),
                        decimals: token.decimals
                    };
                } catch (err) {
                    return null;
                }
            });
            
            const tokenResults = await Promise.all(tokenPromises);
            return tokenResults.filter(token => token && token.balance > 0);
        } catch (error) {
            console.error('Error detecting tokens:', error);
            return [];
        }
    };

    // Function to detect all tokens for Solana
    const getAllSolanaTokens = async (connection, publicKey) => {
        try {
            // Get all token accounts for the wallet
            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
            });
            
            // Extract token info and balances
            const tokens = tokenAccounts.value.map(accountInfo => {
                const tokenInfo = accountInfo.account.data.parsed.info;
                const mint = tokenInfo.mint;
                const balance = tokenInfo.tokenAmount.uiAmount;
                const decimals = tokenInfo.tokenAmount.decimals;
                
                // For simplicity, we'll use the mint address as symbol for now
                // In a production environment, you would fetch token metadata
                return {
                    symbol: mint.substring(0, 6) + '...',
                    address: mint,
                    balance: balance,
                    decimals: decimals
                };
            });
            
            return tokens.filter(token => token.balance > 0);
        } catch (error) {
            console.error('Error detecting Solana tokens:', error);
            return [];
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!address.trim()) {
            setError('Please enter a wallet address');
            return;
        }

        setLoading(true);
        setBalance(null);
        setTokenBalances([]);
        setTokenPrices({});

        try {
            const networkConfig = endpoints[network];
            
            if (networkConfig.type === 'solana') {
                // Solana logic
                const connection = new Connection(networkConfig.rpc, 'confirmed');
                const publicKey = new PublicKey(address.trim());
                const solBalance = await getSolanaBalance(connection, publicKey);
                setBalance(solBalance);
                
                // Get all token holdings
                const tokens = await getAllSolanaTokens(connection, publicKey);
                setTokenBalances(tokens);
                
                // Fetch token prices
                const symbols = [...tokens.map(t => t.symbol), networkConfig.symbol];
                const prices = await fetchTokenPrices(symbols);
                setTokenPrices(prices);
                
            } else if (networkConfig.type === 'ethereum') {
                // Ethereum-compatible chains
                const provider = new ethers.providers.JsonRpcProvider(networkConfig.rpc);
                
                // Get native token balance (ETH, MATIC, etc.)
                const nativeBalance = await getEthereumBalance(provider, address.trim());
                setBalance(parseFloat(nativeBalance));
                
                // Get all token holdings
                const tokens = await getAllEthereumTokens(provider, address.trim(), network);
                setTokenBalances(tokens);
                
                // Fetch token prices
                const symbols = [...tokens.map(t => t.symbol), networkConfig.symbol];
                const prices = await fetchTokenPrices(symbols);
                setTokenPrices(prices);
            }
            
        } catch (error) {
            console.error('Error:', error);
            if (error.message.includes('Invalid public key') || error.message.includes('invalid address')) {
                setError('Invalid wallet address format');
            } else if (error.message.includes('network')) {
                setError(`Network error: Unable to fetch balance from ${networkConfig.name}`);
            } else {
                setError(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tracker-page">
            <div className="container">
                <div className="tracker-header">
                    <h1>Portfolio Tracker</h1>
                    <p>Track all your token holdings across multiple blockchains</p>
                </div>
                
                <div className="tracker-content">
                    <div className="tracker-form-section">
                        <form onSubmit={handleSubmit} className="tracker-form">
                            <div className="form-group">
                                <label htmlFor="network">Select Network</label>
                                <select 
                                    id="network"
                                    value={network}
                                    onChange={(e) => setNetwork(e.target.value)}
                                    className="network-select"
                                >
                                    <optgroup label="Solana">
                                        <option value="solana-devnet">Solana Devnet</option>
                                        <option value="solana-mainnet">Solana Mainnet</option>
                                    </optgroup>
                                    <optgroup label="Ethereum">
                                        <option value="ethereum-mainnet">Ethereum Mainnet</option>
                                        <option value="ethereum-sepolia">Ethereum Sepolia</option>
                                    </optgroup>
                                    <optgroup label="Layer 2">
                                        <option value="polygon-mainnet">Polygon</option>
                                        <option value="arbitrum-one">Arbitrum One</option>
                                        <option value="optimism-mainnet">Optimism</option>
                                        <option value="base-mainnet">Base</option>
                                    </optgroup>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="wallet">Wallet Address</label>
                                <input
                                    id="wallet"
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder={
                                        endpoints[network].type === 'solana' 
                                        ? "Enter Solana Wallet Address"
                                        : "Enter Ethereum-compatible Address"
                                    }
                                    className="wallet-input"
                                />
                            </div>
                            
                            <button type="submit" disabled={loading} className="scan-button">
                                {loading ? (
                                    <div className="button-content">
                                        <div className="loading-spinner"></div>
                                        <span>Scanning...</span>
                                    </div>
                                ) : (
                                    <div className="button-content">
                                        <span>🔍</span>
                                        <span>Scan Portfolio</span>
                                    </div>
                                )}
                            </button>
                        </form>
                    </div>
                    
                    <div className="results-section">
                        {error && (
                            <div className="error-message">
                                <div className="error-icon">⚠️</div>
                                <div className="error-text">{error}</div>
                            </div>
                        )}
                        
                        {balance !== null && (
                            <div className="results-content">
                                <div className="balance-card">
                                    <div className="balance-header">
                                        <h3>Network Balance</h3>
                                        <span className="network-badge">{endpoints[network].name}</span>
                                    </div>
                                    <div className="balance-amount">
                                        <span className="amount">{balance.toFixed(4)}</span>
                                        <span className="symbol">{endpoints[network].symbol}</span>
                                    </div>
                                    {tokenPrices[endpoints[network].symbol] && (
                                        <div className="balance-value">
                                            <span className="value">${(balance * tokenPrices[endpoints[network].symbol]).toFixed(2)} USD</span>
                                            <span className="price">@ ${tokenPrices[endpoints[network].symbol].toFixed(2)}/{endpoints[network].symbol}</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="tokens-section">
                                    <h3>All Token Holdings</h3>
                                    {tokenBalances.length > 0 ? (
                                        <div className="tokens-grid">
                                            {tokenBalances.map((token, index) => (
                                                <div key={index} className="token-card">
                                                    <div className="token-symbol">{token.symbol}</div>
                                                    <div className="token-balance">{token.balance.toFixed(4)}</div>
                                                    {tokenPrices[token.symbol] && (
                                                        <div className="token-value">
                                                            <div className="value">${(token.balance * tokenPrices[token.symbol]).toFixed(2)} USD</div>
                                                            <div className="price">@ ${tokenPrices[token.symbol].toFixed(4)}/{token.symbol}</div>
                                                        </div>
                                                    )}
                                                    <div className="token-address">
                                                        {token.address.substring(0, 6)}...{token.address.substring(token.address.length - 4)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="no-tokens">
                                            <div className="no-tokens-icon">📭</div>
                                            <p>No additional token holdings found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {balance === null && !error && (
                            <div className="welcome-message">
                                <div className="welcome-icon">🔐</div>
                                <h3>Track Your Portfolio</h3>
                                <p>Enter a wallet address above to see all token holdings on the selected network</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Tracker;