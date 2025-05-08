import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/useCart.js';
import { useCurrency } from '../contexts/useCurrency.js';

const GameModal = ({ show, onHide, game }) => {
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  if (!game) return null;

  // Función para manejar la adición al carrito
  const handleAddToCart = () => {
    addToCart(game);
    onHide();
  };

  // Calcular precio con descuento
  const calculateDiscountedPrice = (price, discount) => {
    if (!discount) return price;
    return price - (price * (discount / 100));
  };

  // Precio original y con descuento
  const originalPrice = game.price;
  const discountedPrice = calculateDiscountedPrice(game.price, game.discount);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="game-detail-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{game.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={5}>
            <div className="position-relative">
              <img
                src={game.imageUrl || 'https://via.placeholder.com/400x300?text=No+image'}
                alt={game.title}
                className="img-fluid rounded shadow"
                style={{ width: '100%', objectFit: 'cover' }}
              />
              {game.discount > 0 && (
                <Badge
                  bg="danger"
                  className="position-absolute top-0 end-0 m-2 p-2"
                >
                  {game.discount}% OFF
                </Badge>
              )}
            </div>
          </Col>
          <Col md={7}>
            <div className="d-flex align-items-center mb-2">
              {game.categories && game.categories.map(category => (
                <Badge
                  key={category.name}
                  bg="secondary"
                  className="me-2"
                  style={{ backgroundColor: category.color }}
                >
                  <i className={`${category.icon} me-1`}></i> {category.name}
                </Badge>
              ))}
              {game.platform && (
                <Badge
                  bg="primary"
                  className="ms-auto"
                  style={{ backgroundColor: game.platform.color || '#6c757d' }}
                >
                  {game.platform.name}
                </Badge>
              )}
            </div>
            
            <p className="mt-3">{game.description}</p>
            
            <div className="mt-3 mb-3">
              <div className="d-flex align-items-center">
                {game.discount > 0 ? (
                  <>
                    <span className="fs-4 fw-bold text-primary me-2">
                      {formatPrice(discountedPrice)}
                    </span>
                    <span className="fs-6 text-decoration-line-through text-muted">
                      {formatPrice(originalPrice)}
                    </span>
                  </>
                ) : (
                  <span className="fs-4 fw-bold text-primary">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {game.stock > 0 ? (
              <div className="text-success mb-3">
                <i className="fas fa-check me-1"></i> En stock: {game.stock} unidades
              </div>
            ) : (
              <div className="text-danger mb-3">
                Agotado
              </div>
            )}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Link to={`/game/${game.slug}`} className="text-decoration-none">
          <Button variant="outline-primary">
            Ver detalles completos
          </Button>
        </Link>
        <div>
          <Button
            variant="secondary"
            onClick={onHide}
            className="me-2"
          >
            Cerrar
          </Button>
          <Button
            variant="warning"
            onClick={handleAddToCart}
            disabled={game.stock <= 0}
          >
            <i className="fas fa-shopping-cart me-2"></i>
            {game.stock > 0 ? 'Añadir al carrito' : 'Agotado'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default GameModal; 