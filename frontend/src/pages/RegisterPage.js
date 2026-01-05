import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Form.css';
import { registerUser } from '../api/auth'; // <-- Import the API function

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'student' // Default user type
  });
  const [error, setError] = useState('');

  const { name, email, password, userType } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser(formData);
      // Registration successful - save token and redirect to login
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
      }
      // Redirect to home page after successful registration
      window.location.href = '/';
    } catch (err) {
      setError(err);
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Name"
              name="name"
              value={name}
              onChange={handleChange}
              required
            />
          </div>
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
          <div className="form-group">
            <input
              type="password"
              className="form-input"
              placeholder="Password"
              name="password"
              value={password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <select
              className="form-input"
              name="userType"
              value={userType}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="vendor">Vendor</option>
            </select>
          </div>
          <button type="submit" className="form-button">
            Register
          </button>
        </form>
        <Link to="/login" className="form-link">
          Already have an account? Login here.
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;