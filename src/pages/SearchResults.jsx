import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Tab, Tabs } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { searchProducts } from '../firebase/firestore';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const [games, setGames] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [giftCards, setGiftCards] = useState([]);
  const [activeTab, setActiveTab] = useState('games');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        const results = await searchProducts(searchQuery);
        
        setGames(results.games || []);
        setAccessories(results.accessories || []);
        setGiftCards(results.giftCards || []);
        
        
        if (results.games?.length > 0) {
          setActiveTab('games');
        } else if (results.accessories?.length > 0) {
          setActiveTab('accessories');
        } else if (results.giftCards?.length > 0) {
          setActiveTab('giftCards');
        }
        
        setError('');
      } catch (err) {
        console.error('Error al realizar la búsqueda:', err);
        setError('Error al realizar la búsqueda. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    performSearch();
  }, [searchQuery]);

  
  const formatPrice = (price, discount) => {
    if (discount && discount > 0) {
      const discountedPrice = price - (price * (discount / 100));
      return (
        <span>
          <span className="text-decoration-line-through me-2 text-muted">${price.toFixed(2)}</span>
          <span className="text-success fw-bold">${discountedPrice.toFixed(2)}</span>
        </span>
      );
    }
    return <span className="text-success fw-bold">${price.toFixed(2)}</span>;
  };

  
  const GameCard = ({ game }) => {
    return (
      <Card className="game-card h-100">
        <div className="img-hover-zoom">
          <Card.Img 
            variant="top" 
            src={game.imageUrl} 
            alt={game.title}
            className="img-fluid"
          />
          {game.is_new && <div className="new-badge">NUEVO</div>}
          {game.discount > 0 && <div className="discount-badge">-{game.discount}%</div>}
        </div>
        <Card.Body className="d-flex flex-column">
          <Card.Title>{game.title}</Card.Title>
          <Card.Text>
            <span className="badge bg-primary me-2">
              {game.platformName}
            </span>
            {formatPrice(game.price, game.discount)}
          </Card.Text>
          <div className="mt-auto">
            <Link to={`/game/${game.slug}`} className="text-decoration-none">
              <Button variant="primary" size="sm" className="mt-2 me-2">
                Ver detalle
              </Button>
            </Link>
            <Button variant="warning" size="sm" className="mt-2">
              <i className="fas fa-shopping-cart me-2"></i>Agregar
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  
  const AccessoryCard = ({ accessory }) => {
    return (
      <Card className="game-card h-100">
        <div className="img-hover-zoom">
          <Card.Img 
            variant="top" 
            src={accessory.imageUrl} 
            alt={accessory.name}
            className="img-fluid"
          />
          {accessory.is_new && <div className="new-badge">NUEVO</div>}
          {accessory.discount > 0 && <div className="discount-badge">-{accessory.discount}%</div>}
        </div>
        <Card.Body className="d-flex flex-column">
          <Card.Title>{accessory.name}</Card.Title>
          <Card.Text>
            <span className="badge bg-primary me-2">
              {accessory.platformName}
            </span>
            {formatPrice(accessory.price, accessory.discount)}
          </Card.Text>
          <div className="mt-auto">
            <Link to={`/accessory/${accessory.slug}`} className="text-decoration-none">
              <Button variant="primary" size="sm" className="mt-2 me-2">
                Ver detalle
              </Button>
            </Link>
            <Button variant="warning" size="sm" className="mt-2">
              <i className="fas fa-shopping-cart me-2"></i>Agregar
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  
  const GiftCardItem = ({ giftCard }) => {
    return (
      <Card className="game-card h-100">
        <div className="img-hover-zoom">
          <Card.Img 
            variant="top" 
            src={giftCard.imageUrl} 
            alt={`${giftCard.platformName} ${giftCard.value}`}
            className="img-fluid"
          />
        </div>
        <Card.Body className="d-flex flex-column">
          <Card.Title>{giftCard.platformName} - Tarjeta de Regalo ${giftCard.value}</Card.Title>
          <Card.Text>
            <span className="badge bg-primary me-2">
              {giftCard.platformName}
            </span>
            <span className="text-success fw-bold">${giftCard.price.toFixed(2)}</span>
          </Card.Text>
          <div className="mt-auto">
            <Link to={`/gift-card/${giftCard.id}`} className="text-decoration-none">
              <Button variant="primary" size="sm" className="mt-2 me-2">
                Ver detalle
              </Button>
            </Link>
            <Button variant="warning" size="sm" className="mt-2">
              <i className="fas fa-shopping-cart me-2"></i>Agregar
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  
  const totalResults = games.length + accessories.length + giftCards.length;

  return (
    <Container className="py-5">
      <h1 className="mb-4">Resultados de búsqueda para: "{searchQuery}"</h1>
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-3">Buscando productos...</p>
        </div>
      ) : error ? (
        <div className="text-center py-5">
          <p className="text-danger">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-5">
          <p>No se encontraron resultados para tu búsqueda.</p>
          <Link to="/games">
            <Button variant="primary">Ver todos los juegos</Button>
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-4">Se encontraron {totalResults} productos relacionados con tu búsqueda.</p>
          
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab 
              eventKey="games" 
              title={`Juegos (${games.length})`}
              disabled={games.length === 0}
            >
              {games.length > 0 ? (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {games.map(game => (
                    <Col key={game.id}>
                      <GameCard game={game} />
                    </Col>
                  ))}
                </Row>
              ) : (
                <p className="text-center py-3">No se encontraron juegos con esta búsqueda.</p>
              )}
            </Tab>
            
            <Tab 
              eventKey="accessories" 
              title={`Accesorios (${accessories.length})`}
              disabled={accessories.length === 0}
            >
              {accessories.length > 0 ? (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {accessories.map(accessory => (
                    <Col key={accessory.id}>
                      <AccessoryCard accessory={accessory} />
                    </Col>
                  ))}
                </Row>
              ) : (
                <p className="text-center py-3">No se encontraron accesorios con esta búsqueda.</p>
              )}
            </Tab>
            
            <Tab 
              eventKey="giftCards" 
              title={`Tarjetas de Regalo (${giftCards.length})`}
              disabled={giftCards.length === 0}
            >
              {giftCards.length > 0 ? (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {giftCards.map(giftCard => (
                    <Col key={giftCard.id}>
                      <GiftCardItem giftCard={giftCard} />
                    </Col>
                  ))}
                </Row>
              ) : (
                <p className="text-center py-3">No se encontraron tarjetas de regalo con esta búsqueda.</p>
              )}
            </Tab>
          </Tabs>
        </>
      )}
    </Container>
  );
};

export default SearchResults; 