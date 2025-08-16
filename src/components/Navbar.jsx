import React from 'react'
import {Link, useLocation} from 'react-router-dom'

function Navbar(){
    const location = useLocation()
    
    return(
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-brand">
                        <span className="brand-icon">🔐</span>
                        TokenVault
                    </Link>
                    <ul className="navbar-nav">
                        <li>
                            <Link 
                                to='/tracker' 
                                className={location.pathname === '/tracker' ? 'active' : ''}
                            >
                                Tracker
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;