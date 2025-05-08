import { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth.js';
import { logBeginCheckout } from '../firebase/analytics';
import { useCart } from '../contexts/useCart.js';
import { useCurrency } from '../contexts/useCurrency.js';
import { createOrder } from '../firebase/firestore';

const Cart = () => {
  const { cart, cartTotal, updateCartItemQuantity, removeFromCart, clearCart, formatCartTotal } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  
  
  const [shippingData, setShippingData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  
  const validateForm = () => {
    const { name, email, address, city, state, zipCode, phone } = shippingData;
    return name && email && address && city && state && zipCode && phone;
  };

  
  const handleCheckout = () => {
    logBeginCheckout(cart, cartTotal);
    
    
    if (!currentUser) {
      setShowLoginModal(true);
    } else {
      
      setShowCheckoutModal(true);
    }
  };

  
  const continueToCheckout = () => {
    setShowLoginModal(false);
    setShowCheckoutModal(true);
  };

  
  const processPayment = async () => {
    try {
      
      const orderData = {
        items: cart,
        shippingAddress: shippingData,
        saveAddress: true, 
        total: cartTotal,
        paymentMethod: 'creditCard',
        notes: '',
      };
      
      
      if (currentUser) {
        await createOrder(currentUser.uid, orderData);
      }
      
      
      setTimeout(() => {
        setCheckoutComplete(true);
        clearCart();
      }, 1500);
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      alert("Hubo un error al procesar el pago. Por favor, inténtalo de nuevo.");
    }
  };

  
  const returnToShop = () => {
    setCheckoutComplete(false);
    setShowCheckoutModal(false);
    navigate('/');
  };

  return (
    <Container className="py-5">
      <h2 className="section-title text-center mb-4">Carrito de Compras</h2>
      {cart.length === 0 ? (
        <Card className="empty-cart-message text-center p-5">
          <Card.Body>
            <h4>Tu carrito está vacío</h4>
            <p>¡Agrega algunos juegos para comenzar!</p>
            <Button 
              variant="primary" 
              size="lg" 
              className="mt-3"
              onClick={() => navigate('/')}
            >
              Ir a la tienda
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <>
          {cart.map(item => (
            <Card key={item.id} className="cart-item-card mb-3">
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs={12} md={2}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="cart-item-image img-fluid rounded"
                    />
                  </Col>
                  <Col xs={12} md={4}>
                    <h5>{item.title}</h5>
                    <p className="text-success mb-0">
                      {item.discount > 0 ? (
                        <>
                          <span className="text-decoration-line-through me-2 text-muted">
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-success fw-bold">
                            {formatPrice(item.price - (item.price * (item.discount / 100)))}
                          </span>
                        </>
                      ) : formatPrice(item.price)}
                    </p>
                  </Col>
                  <Col xs={12} md={3}>
                    <Form.Group className="d-flex align-items-center quantity-control">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <Form.Control
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateCartItemQuantity(item.id, parseInt(e.target.value))}
                        className="mx-2 text-center"
                        style={{ backgroundColor: "#fff", color: "#000", appearance: "textfield" }}
                      />
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={2} className="text-end">
                    <p className="fw-bold mb-0">
                      {item.discount > 0 
                        ? (item.price - (item.price * (item.discount / 100))) * item.quantity
                        : item.price * item.quantity
                      }
                    </p>
                  </Col>
                  <Col xs={12} md={1} className="text-end">
                    <Button
                      variant="link"
                      className="remove-item-btn p-0"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
          <Card className="cart-total-card mt-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col>
                  <h4 className="mb-0">Total: {formatCartTotal()}</h4>
                </Col>
                <Col className="text-end">
                  <Button
                    variant="outline-danger"
                    className="me-3"
                    onClick={clearCart}
                  >
                    Vaciar carrito
                  </Button>
                  <Button
                    variant="warning"
                    size="lg"
                    onClick={handleCheckout}
                    className="checkout-btn"
                  >
                    Proceder al Pago
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </>
      )}

      
      <Modal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Iniciar sesión</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Para continuar con la compra y guardar tus pedidos, necesitas iniciar sesión.</p>
          <p>Puedes continuar como invitado, pero no podrás guardar ni acceder al historial de tus pedidos.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Ir a iniciar sesión
          </Button>
          <Button variant="success" onClick={continueToCheckout}>
            Continuar como invitado
          </Button>
        </Modal.Footer>
      </Modal>

      
      <Modal
        show={showCheckoutModal}
        onHide={() => setShowCheckoutModal(false)}
        centered
        size="lg"
        contentClassName="checkout-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Finalizar Compra</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {checkoutComplete ? (
            <div className="text-center py-4">
              <i className="fas fa-check-circle text-success" style={{ fontSize: '3rem' }}></i>
              <h3 className="mt-3">¡Compra realizada con éxito!</h3>
              <p>Tu pedido ha sido procesado correctamente.</p>
              <p>Hemos enviado un correo con los detalles de tu compra.</p>
              <Button 
                variant="primary" 
                size="lg" 
                className="mt-3"
                onClick={returnToShop}
              >
                Volver a la tienda
              </Button>
            </div>
          ) : (
            <>
              <h5 className="mb-3">Información de envío</h5>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre completo</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="name"
                        value={shippingData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Correo electrónico</Form.Label>
                      <Form.Control 
                        type="email" 
                        name="email"
                        value={shippingData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="address"
                    value={shippingData.address}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ciudad</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="city"
                        value={shippingData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Estado/Provincia</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="state"
                        value={shippingData.state}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Código Postal</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="zipCode"
                        value={shippingData.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control 
                    type="tel" 
                    name="phone"
                    value={shippingData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                
                <h5 className="mt-4 mb-3">Información de pago</h5>
                <div className="payment-methods mb-3">
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="paymentMethod" 
                      id="creditCard" 
                      value="creditCard" 
                      defaultChecked 
                    />
                    <label className="form-check-label payment-option-label" htmlFor="creditCard" style={{ color: "#000000 !important", fontWeight: "600 !important" }}>
                      Tarjeta de crédito
                    </label>
                  </div>
                </div>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Número de tarjeta</Form.Label>
                      <Form.Control type="text" placeholder="XXXX XXXX XXXX XXXX" />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha exp.</Form.Label>
                      <Form.Control type="text" placeholder="MM/AA" />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group className="mb-3">
                      <Form.Label>CVV</Form.Label>
                      <Form.Control type="text" placeholder="XXX" />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
              
              <div className="order-summary">
                <h5>Resumen del pedido</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>{formatCartTotal()}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Envío:</span>
                  <span>Gratis</span>
                </div>
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total:</span>
                  <span>{formatCartTotal()}</span>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        {!checkoutComplete && (
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCheckoutModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="success" 
              onClick={processPayment}
              disabled={!validateForm()}
            >
              Confirmar Pedido
            </Button>
          </Modal.Footer>
        )}
      </Modal>
    </Container>
  );
};

export default Cart; 