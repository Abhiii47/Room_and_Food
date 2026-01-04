import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Form.css';
import { loginUser } from '../api/auth';
import AuthContext from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const { login } = useContext(AuthContext);

    const { email, password } = formData;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await loginUser(formData);
            // Login successful - use AuthContext login function
            if (res && res.token && res.user) {
                if (login) {
                    login(res.user, res.token);
                }
                // Redirect to home page
                navigate('/');
            } else {
                setError('Login failed: Invalid response from server');
            }
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = typeof err === 'string' ? err : (err?.response?.data?.message || err?.message || 'Login failed. Please check your credentials.');
            setError(errorMessage);
        }
    };

    return (
        <div className="form-container">
            <div className="form-box">
                <h2>Login</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            className="form-input"
                            placeholder="Email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-input pr-10"
                            placeholder="Password"
                            name="password"
                            value={password}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <button type="submit" className="form-button">
                        Login
                    </button>
                </form>
                <Link to="/register" className="form-link">
                    Don't have an account? Register here.
                </Link>
            </div>
        </div>
    );
};

export default LoginPage;
