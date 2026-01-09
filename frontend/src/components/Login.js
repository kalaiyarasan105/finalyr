import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const FormCard = styled.div`
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Input = styled.input`
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const Button = styled.button`
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: 20px;
  color: #666;

  a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  return (
    <Container>
      <FormCard>
        <Title>Welcome Back</Title>
        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Form>
        <LinkText>
          Don't have an account? <Link to="/register">Sign up</Link>
        </LinkText>
      </FormCard>
    </Container>
  );
};

export default Login;