import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, ListGroup, Accordion, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/useAuth.js';
import { getUserOrders } from '../firebase/firestore';
import { useCurrency } from '../contexts/useCurrency.js';
import { Link } from 'react-router-dom';

const Orders = () => {
  const { currentUser } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar los pedidos del usuario
  useEffect(() => {
    const loadOrders = async () => {
      if (currentUser) {
        try {
          const userOrders = await getUserOrders(currentUser.uid);
          setOrders(userOrders);
        } catch (error) {
          console.error("Error al cargar los pedidos:", error);
          setError("No se pudieron cargar tus pedidos.");
        } finally {
          setLoading(false);
        }
      }
    };

    loadOrders();
  }, [currentUser]);

  // Formatear fecha
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener el badge de estado según el estado del pedido
  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { variant: 'warning', text: 'Pendiente' },
      'processing': { variant: 'info', text: 'Procesando' },
      'shipped': { variant: 'primary', text: 'Enviado' },
      'delivered': { variant: 'success', text: 'Entregado' },
      'cancelled': { variant: 'danger', text: 'Cancelado' }
    };

    const statusInfo = statusMap[status] || { variant: 'secondary', text: 'Desconocido' };
    
    return (
      <Badge bg={statusInfo.variant}>{statusInfo.text}</Badge>
    );
  };

  // Calcular total del pedido
  const calculateOrderTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    
    return items.reduce((total, item) => {
      const itemPrice = item.discount > 0 
        ? item.price - (item.price * (item.discount / 100))
        : item.price;
        
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin fa-3x"></i>
          <p className="mt-3">Cargando tus pedidos...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="section-title text-center mb-4">Mis Pedidos</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {orders.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <i className="fas fa-shopping-bag fa-3x mb-3" style={{ color: 'var(--primary-yellow)' }}></i>
            <h4>No tienes pedidos realizados</h4>
            <p>¡Explora nuestra tienda y encuentra tus juegos favoritos!</p>
            <Link to="/" className="btn btn-warning mt-3">Ir a la tienda</Link>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {orders.map((order) => (
            <Col xs={12} key={order.id} className="mb-4">
              <Card>
                <Card.Header>
                  <Row className="align-items-center">
                    <Col xs={12} md={3}>
                      <p className="mb-0"><strong>Pedido:</strong> #{order.id.substring(0, 8)}</p>
                    </Col>
                    <Col xs={12} md={3}>
                      <p className="mb-0"><strong>Fecha:</strong> {formatDate(order.createdAt)}</p>
                    </Col>
                    <Col xs={12} md={3}>
                      <p className="mb-0"><strong>Total:</strong> {formatPrice(calculateOrderTotal(order.items))}</p>
                    </Col>
                    <Col xs={12} md={3} className="text-md-end">
                      <p className="mb-0"><strong>Estado:</strong> {getStatusBadge(order.status)}</p>
                    </Col>
                  </Row>
                </Card.Header>
                <Accordion>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>
                      <span>Ver detalles del pedido</span>
                    </Accordion.Header>
                    <Accordion.Body>
                      <Row>
                        <Col md={6}>
                          <h5 className="mb-3">Productos</h5>
                          <ListGroup variant="flush">
                            {order.items && order.items.map((item, index) => (
                              <ListGroup.Item key={index} className="px-0">
                                <div className="d-flex">
                                  <div className="me-3" style={{ width: '60px', height: '60px' }}>
                                    <img 
                                      src={item.imageUrl} 
                                      alt={item.title} 
                                      className="img-fluid rounded"
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  </div>
                                  <div className="flex-grow-1">
                                    <h6 className="mb-1">{item.title}</h6>
                                    <div className="d-flex justify-content-between">
                                      <span>Cantidad: {item.quantity}</span>
                                      <span className="text-success">
                                        {item.discount > 0 ? (
                                          <>
                                            <span className="text-decoration-line-through me-2 text-muted">
                                              {formatPrice(item.price)}
                                            </span>
                                            <span className="text-success">
                                              {formatPrice(item.price - (item.price * (item.discount / 100)))}
                                            </span>
                                          </>
                                        ) : formatPrice(item.price)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </Col>
                        <Col md={6}>
                          <h5 className="mb-3">Información de envío</h5>
                          {order.shippingAddress && (
                            <Card>
                              <Card.Body>
                                <p className="mb-1"><strong>Nombre:</strong> {order.shippingAddress.name}</p>
                                <p className="mb-1"><strong>Dirección:</strong> {order.shippingAddress.address}</p>
                                <p className="mb-1"><strong>Ciudad:</strong> {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                                <p className="mb-0"><strong>Teléfono:</strong> {order.shippingAddress.phone}</p>
                              </Card.Body>
                            </Card>
                          )}
                          
                          <h5 className="mt-4 mb-3">Resumen del pedido</h5>
                          <Card>
                            <Card.Body>
                              <div className="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>{formatPrice(calculateOrderTotal(order.items))}</span>
                              </div>
                              <div className="d-flex justify-content-between mb-2">
                                <span>Envío:</span>
                                <span>Gratis</span>
                              </div>
                              <div className="d-flex justify-content-between fw-bold">
                                <span>Total:</span>
                                <span>{formatPrice(calculateOrderTotal(order.items))}</span>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Orders; 