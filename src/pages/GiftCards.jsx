import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { getGiftCards, getPlatforms } from '../firebase/firestore';
import { useCurrency } from '../contexts/useCurrency.js';
import { useCart } from '../contexts/useCart.js';
import GameModal from '../components/GameModal';

const GiftCards = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [giftCards, setGiftCards] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGiftCard, setSelectedGiftCard] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  
  const [selectedPlatform, setSelectedPlatform] = useState(searchParams.get('platform') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'price');
  const [priceRange, setPriceRange] = useState(searchParams.get('price') || '');

  useEffect(() => {
    const loadFilters = async () => {
      try {
        
        const platformsData = await getPlatforms();
        setPlatforms(platformsData);
      } catch (err) {
        console.error('Error al cargar filtros:', err);
        setError('Error al cargar filtros. Por favor, recarga la página.');
      }
    };
    
    loadFilters();
  }, []);

  useEffect(() => {
    const loadGiftCards = async () => {
      setLoading(true);
      
      try {
        
        const options = {
          sortBy: sortBy || 'price',
          sortDirection: 'asc',
          itemLimit: 100
        };
        
        
        if (selectedPlatform) {
          options.platformId = selectedPlatform;
        }
        
        
        let giftCardsData = await getGiftCards(options);
        
        
        if (priceRange) {
          const [min, max] = priceRange.split('-').map(Number);
          giftCardsData = giftCardsData.filter(giftCard => {
            const price = giftCard.price;
            return price >= min && (max ? price <= max : true);
          });
        }
        
        setGiftCards(giftCardsData);
        setError('');
      } catch (err) {
        console.error('Error al cargar tarjetas de regalo:', err);
        setError('Error al cargar las tarjetas de regalo. Por favor, recarga la página.');
      } finally {
        setLoading(false);
      }
    };
    
    loadGiftCards();
  }, [selectedPlatform, sortBy, priceRange]);

  
  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams);
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    setSearchParams(params);
    
    
    switch (key) {
      case 'platform':
        setSelectedPlatform(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
      case 'price':
        setPriceRange(value);
        break;
      default:
        break;
    }
  };

  
  const showGiftCardDetails = (giftCard) => {
    setSelectedGiftCard(giftCard);
    setShowModal(true);
  };

  
  const handleAddToCart = (giftCard, event) => {
    event.stopPropagation(); 
    addToCart(giftCard);
  };

  
  const GiftCardItem = ({ giftCard }) => {
    const platformName = platforms.find(p => p.id === giftCard.platformId)?.name || 'Desconocido';
    
    return (
      <Card 
        className="game-card h-100 cursor-pointer"
        onClick={() => showGiftCardDetails(giftCard)}
      >
        <div className="img-hover-zoom">
          <Card.Img 
            variant="top" 
            src={giftCard.imageUrl} 
            alt={`${platformName} ${giftCard.value}`}
            className="img-fluid"
          />
          {giftCard.is_new && <div className="new-badge">NUEVO</div>}
          {giftCard.discount > 0 && <div className="discount-badge">-{giftCard.discount}%</div>}
        </div>
        <Card.Body className="d-flex flex-column">
          <Card.Title>{platformName} - Tarjeta de Regalo {formatPrice(giftCard.value)}</Card.Title>
          <Card.Text>
            <span className="badge bg-primary me-2">
              {platformName}
            </span>
            <span className="text-success fw-bold">{formatPrice(giftCard.price)}</span>
          </Card.Text>
          <div className="mt-auto">
            <Button 
              variant="primary" 
              size="sm" 
              className="mt-2 me-2"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/gift-card/${giftCard.id}`);
              }}
            >
              Ver detalle
            </Button>
            <Button 
              variant="warning" 
              size="sm" 
              className="mt-2"
              onClick={(e) => handleAddToCart(giftCard, e)}
            >
              <i className="fas fa-shopping-cart me-2"></i>Agregar
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Tarjetas de Regalo</h1>
      
      <Row>
        
        <Col lg={3} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Filtros</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Plataforma</Form.Label>
                  <Form.Select 
                    value={selectedPlatform} 
                    onChange={(e) => updateFilters('platform', e.target.value)}
                  >
                    <option value="">Todas las plataformas</option>
                    {platforms.map(platform => (
                      <option key={platform.id} value={platform.id}>
                        {platform.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Ordenar por</Form.Label>
                  <Form.Select 
                    value={sortBy} 
                    onChange={(e) => updateFilters('sort', e.target.value)}
                  >
                    <option value="price">Valor (menor a mayor)</option>
                    <option value="-price">Valor (mayor a menor)</option>
                    <option value="platform">Plataforma (A-Z)</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Rango de valor</Form.Label>
                  <Form.Select 
                    value={priceRange} 
                    onChange={(e) => updateFilters('price', e.target.value)}
                  >
                    <option value="">Cualquier valor</option>
                    <option value="0-25">Hasta $25</option>
                    <option value="25-50">$25 - $50</option>
                    <option value="50-100">$50 - $100</option>
                    <option value="100-">Más de $100</option>
                  </Form.Select>
                </Form.Group>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={() => {
                    setSearchParams({});
                    setSelectedPlatform('');
                    setSortBy('price');
                    setPriceRange('');
                  }}
                  className="w-100"
                >
                  Limpiar filtros
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        
        <Col lg={9}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
              <p className="mt-3">Cargando tarjetas de regalo...</p>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <p className="text-danger">{error}</p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          ) : giftCards.length === 0 ? (
            <div className="text-center py-5">
              <p>No se encontraron tarjetas de regalo con los filtros seleccionados.</p>
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <p className="mb-0">Se encontraron {giftCards.length} tarjetas de regalo</p>
              </div>
              
              <Row xs={1} md={2} lg={3} className="g-4">
                {giftCards.map(giftCard => (
                  <Col key={giftCard.id}>
                    <GiftCardItem giftCard={giftCard} />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Col>
      </Row>
      
      
      <GameModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        game={selectedGiftCard} 
      />
    </Container>
  );
};

export default GiftCards; 