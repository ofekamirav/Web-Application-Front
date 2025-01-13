import { FC } from 'react';
import '../Styles/Login.css';
import googleIcon from '../assets/google_login_icon.png';


const Login: FC = () => {
    return (
        <div className="login-container">
        <div className="login-card">
            <h1 className="login-title">
                Welcome to <span className="brand-name">RecipeHub</span>
            </h1>
            <h2 className="login-subtitle">Log in</h2>

            <button className="google-login-btn">
                <img
                    src= {googleIcon}
                    alt="Google Logo"
                    className="google-logo"
                />
                Sign in with Google
            </button>

            <form className="login-form">
                <div className="form-group">
                    <label htmlFor="email">Enter your email address</label>
                    <input
                        type="email"
                        id="email"
                        className="form-input"
                        placeholder="Email address"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Enter your Password</label>
                    <input
                        type="password"
                        id="password"
                        className="form-input"
                        placeholder="Password"
                    />
                </div>
                <div className="form-footer">
                    <a href="/forgot-password" className="forgot-password">
                        Forgot Password
                    </a>
                </div>
                <button type="submit" className="login-btn">
                    Log in
                </button>
            </form>

            <div className="register-footer">
                <span>No Account? </span>
                <a href="/register" className="register-link">
                    Registration
                </a>
            </div>
        </div>
    </div>

    );

};

export default Login;