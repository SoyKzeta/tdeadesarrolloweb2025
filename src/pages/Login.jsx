import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth.js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, loginWithFacebook, loginWithMicrosoft } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch {
      setError('Error al iniciar sesión. Por favor, verifica tus credenciales.');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch {
      setError('Error al iniciar sesión con Google.');
    }
    setLoading(false);
  };

  const handleFacebookLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithFacebook();
      navigate('/');
    } catch {
      setError('Error al iniciar sesión con Facebook.');
    }
    setLoading(false);
  };

  const handleMicrosoftLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithMicrosoft();
      navigate('/');
    } catch {
      setError('Error al iniciar sesión con Microsoft.');
    }
    setLoading(false);
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="login-card">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Iniciar Sesión</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Correo Electrónico</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <div className="d-grid gap-2">
                  <Button 
                    variant="warning" 
                    type="submit" 
                    disabled={loading}
                    className="mb-3"
                  >
                    Iniciar Sesión
                  </Button>
                  
                  <div className="text-center mb-3 text-light">
                    <small>O inicia sesión con</small>
                  </div>
                  
                  <div className="d-flex justify-content-center mb-3">
                    <Button
                      variant="outline-primary"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="mx-2 social-btn"
                    >
                      <i className="fab fa-google"></i>
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={handleFacebookLogin}
                      disabled={loading}
                      className="mx-2 social-btn"
                    >
                      <i className="fab fa-facebook-f"></i>
                    </Button>
                    <Button
                      variant="outline-primary"
                      onClick={handleMicrosoftLogin}
                      disabled={loading}
                      className="mx-2 social-btn"
                    >
                      <i className="fab fa-microsoft"></i>
                    </Button>
                  </div>
                </div>
              </Form>
              <div className="text-center mt-3">
                <Link to="/forgot-password" className="text-decoration-none">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="text-center mt-3">
                <span className="signup-text">¿No tienes una cuenta?</span>{' '}
                <Link to="/signup" className="text-decoration-none">
                  Regístrate
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login; 