import {Link} from 'react-router-dom'

function Footer(){
    return(
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="brand-icon">🔐</span>
                        <span className="brand-name">TokenVault</span>
                    </div>
                    <div className="footer-links">
                        <Link to="/">Home</Link>
                        <Link to="/tracker">Tracker</Link>
                        <a href="https://github.com/subhajitlucky" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </div>
                    <div className="footer-copyright">
                        <p>TokenVault © 2025</p>
                        <p>Built with ❤️ by <a href="https://github.com/subhajitlucky" target="_blank" rel="noopener noreferrer">Subhajit</a></p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;