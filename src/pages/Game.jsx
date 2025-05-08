import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Badge, Card, ListGroup } from 'react-bootstrap';
import { getGameById } from '../firebase/firestore';
import { useCart } from '../contexts/useCart.js';
import { useCurrency } from '../contexts/useCurrency.js';

const Game = () => {
  const { slug } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();
  
  useEffect(() => {
    const fetchGame = async () => {
      try {
        setLoading(true);
        
        
        await getGameById('game-id'); 
        
        
        setGame({
          id: 'game-id',
          title: 'The Last of Us Part II',
          slug: 'the-last-of-us-part-ii',
          description: 'Cinco años después de su peligroso viaje a través de los Estados Unidos post-pandémicos, Ellie y Joel se han establecido en Jackson, Wyoming. Vivir entre una próspera comunidad de sobrevivientes les ha otorgado paz y estabilidad, a pesar de la amenaza constante de los infectados y otros sobrevivientes más desesperados.',
          price: 59.99,
          discount: 20,
          release_date: new Date('2020-06-19'),
          developer: 'Naughty Dog',
          publisher: 'Sony Interactive Entertainment',
          platformId: 'platform-ps4',
          platform: { name: 'PlayStation 4', color: '#0070D1' },
          categoryIds: ['action', 'adventure'],
          categories: [
            { name: 'Acción', color: '#FF4500', icon: 'fas fa-running' },
            { name: 'Aventura', color: '#4CAF50', icon: 'fas fa-map-marked-alt' }
          ],
          features: ['Modo historia', 'Un jugador', 'Compatible con PS5', 'Vibración del mando'],
          rating: 9.5,
          imageUrl: 'https://via.placeholder.com/300x450',
          stock: 15,
          is_featured: true,
          is_new: false
        });
      } catch (err) {
        console.error('Error fetching game:', err);
        setError('No se pudo cargar el juego. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [slug]);

  
  const calculateDiscountedPrice = (price, discount) => {
    if (!discount) return price;
    return price - (price * (discount / 100));
  };

  
  const handleAddToCart = () => {
    addToCart(game);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
        <p className="mt-3">Cargando información del juego...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">{error}</div>
        <Link to="/" className="btn btn-primary">Volver a la tienda</Link>
      </Container>
    );
  }

  if (!game) {
    return (
      <Container className="py-5">
        <div className="alert alert-warning">Juego no encontrado</div>
        <Link to="/" className="btn btn-primary">Volver a la tienda</Link>
      </Container>
    );
  }

  
  const originalPrice = game.price;
  const discountedPrice = calculateDiscountedPrice(game.price, game.discount);

  return (
    <Container className="py-5">
      <Row>
        <Col lg={6} className="mb-4">
          <div className="position-relative">
            <img 
              src={game.imageUrl || 'https://via.placeholder.com/300x450'}
              alt={game.title} 
              className="img-fluid rounded shadow"
              style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }}
            />
            {game.discount > 0 && (
              <Badge 
                bg="danger" 
                className="position-absolute top-0 end-0 m-2 p-2 fs-5"
              >
                {game.discount}% OFF
              </Badge>
            )}
          </div>
        </Col>
        
        <Col lg={6}>
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
            <Badge 
              bg="primary" 
              className="ms-auto"
              style={{ backgroundColor: game.platform?.color || '#6c757d' }}
            >
              {game.platform?.name || 'Plataforma no disponible'}
            </Badge>
          </div>
          
          <h1 className="mb-3">{game.title}</h1>
          
          <div className="mb-4">
            <div className="d-flex align-items-center mb-2">
              <div className="me-3">
                <i className="fas fa-star text-warning me-1"></i>
                <span className="fw-bold">{game.rating}</span>/10
              </div>
              <div className="text-muted">
                Lanzamiento: {game.release_date ? new Date(game.release_date).toLocaleDateString() : 'Fecha no disponible'}
              </div>
            </div>
            <div className="text-muted">
              {game.developer} | {game.publisher}
            </div>
          </div>
          
          <div className="mb-4">
            <p className="fs-5">{game.description}</p>
          </div>
          
          <div className="mb-4">
            <div className="d-flex align-items-center mb-2">
              {game.discount > 0 ? (
                <>
                  <span className="fs-3 fw-bold text-primary me-2">
                    {formatPrice(discountedPrice)}
                  </span>
                  <span className="fs-5 text-decoration-line-through text-muted">
                    {formatPrice(originalPrice)}
                  </span>
                </>
              ) : (
                <span className="fs-3 fw-bold text-primary">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            
            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                size="lg" 
                className="px-4 d-flex align-items-center" 
                onClick={handleAddToCart}
                disabled={game.stock <= 0}
              >
                <i className="fas fa-shopping-cart me-2"></i>
                {game.stock > 0 ? 'Añadir al carrito' : 'Agotado'}
              </Button>
              
              <Button 
                variant="outline-primary" 
                size="lg"
                className="px-4"
              >
                <i className="fas fa-play me-2"></i> Demo
              </Button>
            </div>
            
            {game.stock > 0 ? (
              <div className="text-success mt-2">
                <i className="fas fa-check me-1"></i> En stock: {game.stock} unidades
              </div>
            ) : (
              <div className="text-danger mt-2">
                Agotado
              </div>
            )}
          </div>
        </Col>
      </Row>
      
      <Row className="mt-5">
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header as="h5">Características</Card.Header>
            <ListGroup variant="flush">
              {game.features && game.features.map((feature, index) => (
                <ListGroup.Item key={index}>
                  <i className="fas fa-check text-success me-2"></i> {feature}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Header as="h5">Información técnica</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <strong>Plataforma:</strong> {game.platform?.name || 'No disponible'}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Desarrollador:</strong> {game.developer || 'No disponible'}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Editor:</strong> {game.publisher || 'No disponible'}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Fecha de lanzamiento:</strong> {game.release_date ? new Date(game.release_date).toLocaleDateString() : 'No disponible'}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Idiomas:</strong> Español, Inglés, Francés
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
      
      <div className="my-5 text-center">
        <Link to="/" className="btn btn-outline-secondary">
          Volver a la tienda
        </Link>
      </div>
    </Container>
  );
};

export default Game; 