import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/useAuth.js';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      return setError('Por favor, introduce tu correo electrónico');
    }
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      await resetPassword(email);
      
      setMessage('Revisa tu correo electrónico para seguir las instrucciones');
    } catch (err) {
      console.error('Error al restablecer contraseña:', err);
      setError('No se pudo enviar el correo de restablecimiento. Verifica que el correo sea correcto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="mb-2">¿Olvidaste tu contraseña?</h2>
                <p className="text-muted">
                  Introduce tu correo electrónico y te enviaremos un enlace para restablecerla
                </p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {message && <Alert variant="success">{message}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Correo electrónico</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="tu@correo.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                
                <div className="d-grid gap-2 mb-3">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Enviando...' : 'Enviar enlace de restablecimiento'}
                  </Button>
                </div>
                
                <div className="text-center">
                  <Link to="/login" className="text-decoration-none">
                    Volver a iniciar sesión
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          <div className="text-center mt-3">
            <span className="text-white">¿No tienes cuenta?</span>{' '}
            <Link to="/signup" className="text-decoration-none">
              Regístrate
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword; 