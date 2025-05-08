import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/useAuth.js';
import { 
  getGames, 
  getCategories, 
  getPlatforms, 
  deleteGame,
  getAccessories,
  deleteAccessory,
  getGiftCards,
  deleteGiftCard
} from '../firebase/firestore';
import { Link } from 'react-router-dom';

const Admin = () => {
  const { isAdmin } = useAuth();
  const [games, setGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [giftCards, setGiftCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [message, setMessage] = useState('');

  // Cargar datos con useCallback para evitar dependencias circulares
  const loadData = useCallback(async () => {
    if (!isAdmin()) return;
    
    try {
      setLoading(true);
      setError('');
      
      const gamesData = await getGames();
      const categoriesData = await getCategories();
      const platformsData = await getPlatforms();
      const accessoriesData = await getAccessories();
      const giftCardsData = await getGiftCards();
      
      setGames(gamesData);
      setCategories(categoriesData);
      setPlatforms(platformsData);
      setAccessories(accessoriesData);
      setGiftCards(giftCardsData);
      
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar datos. Por favor, recarga la página.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Comprobar si el usuario es administrador y cargar datos
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Eliminar juego
  const handleDeleteGame = async (gameId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este juego?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await deleteGame(gameId);
      
      // Actualizar la lista de juegos
      const updatedGames = games.filter(game => game.id !== gameId);
      setGames(updatedGames);
      
      setSuccess('Juego eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar juego:', err);
      setError('Error al eliminar juego');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar accesorio
  const handleDeleteAccessory = async (accessoryId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este accesorio?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await deleteAccessory(accessoryId);
      
      // Actualizar la lista de accesorios
      const updatedAccessories = accessories.filter(accessory => accessory.id !== accessoryId);
      setAccessories(updatedAccessories);
      
      setSuccess('Accesorio eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar accesorio:', err);
      setError('Error al eliminar accesorio');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar tarjeta de regalo
  const handleDeleteGiftCard = async (giftCardId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarjeta de regalo?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await deleteGiftCard(giftCardId);
      
      // Actualizar la lista de tarjetas de regalo
      const updatedGiftCards = giftCards.filter(giftCard => giftCard.id !== giftCardId);
      setGiftCards(updatedGiftCards);
      
      setSuccess('Tarjeta de regalo eliminada correctamente');
    } catch (err) {
      console.error('Error al eliminar tarjeta de regalo:', err);
      setError('Error al eliminar tarjeta de regalo');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin()) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          No tienes permisos para acceder a esta página.
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">Panel de Administración</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {message && (
        <Alert 
          variant={message.includes('Error') ? 'danger' : 'success'} 
          className="mb-4"
          dismissible
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Juegos</h5>
              <Link to="/admin/games/new">
                <Button variant="success" size="sm">
                  <i className="fas fa-plus me-1"></i> Agregar Juego
                </Button>
              </Link>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p>Cargando juegos...</p>
              ) : games.length === 0 ? (
                <p>No hay juegos en la base de datos.</p>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Plataforma</th>
                      <th>Precio</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map(game => (
                      <tr key={game.id}>
                        <td>{game.title}</td>
                        <td>
                          {platforms.find(p => p.id === game.platformId)?.name || 'Desconocida'}
                        </td>
                        <td>${game.price.toFixed(2)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link to={`/admin/games/edit/${game.id}`}>
                              <Button variant="primary" size="sm">Editar</Button>
                            </Link>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => handleDeleteGame(game.id)}
                              disabled={loading}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Sección de Accesorios */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Accesorios</h5>
              <Link to="/admin/accessories/new">
                <Button variant="success" size="sm">
                  <i className="fas fa-plus me-1"></i> Agregar Accesorio
                </Button>
              </Link>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p>Cargando accesorios...</p>
              ) : accessories.length === 0 ? (
                <p>No hay accesorios en la base de datos.</p>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessories.map(accessory => (
                      <tr key={accessory.id}>
                        <td>{accessory.name}</td>
                        <td>
                          {categories.find(c => c.id === accessory.categoryId)?.name || 'General'}
                        </td>
                        <td>${accessory.price?.toFixed(2) || '0.00'}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link to={`/admin/accessories/edit/${accessory.id}`}>
                              <Button variant="primary" size="sm">Editar</Button>
                            </Link>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => handleDeleteAccessory(accessory.id)}
                              disabled={loading}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Sección de Tarjetas de Regalo */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Tarjetas de Regalo</h5>
              <Link to="/admin/gift-cards/new">
                <Button variant="success" size="sm">
                  <i className="fas fa-plus me-1"></i> Agregar Tarjeta de Regalo
                </Button>
              </Link>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p>Cargando tarjetas de regalo...</p>
              ) : giftCards.length === 0 ? (
                <p>No hay tarjetas de regalo en la base de datos.</p>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Plataforma</th>
                      <th>Valor</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {giftCards.map(giftCard => (
                      <tr key={giftCard.id}>
                        <td>{giftCard.name}</td>
                        <td>
                          {platforms.find(p => p.id === giftCard.platformId)?.name || 'General'}
                        </td>
                        <td>${giftCard.value?.toFixed(2) || '0.00'}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Link to={`/admin/gift-cards/edit/${giftCard.id}`}>
                              <Button variant="primary" size="sm">Editar</Button>
                            </Link>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => handleDeleteGiftCard(giftCard.id)}
                              disabled={loading}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Categorías</h5>
              <Link to="/admin/categories/new">
                <Button variant="success" size="sm">
                  <i className="fas fa-plus me-1"></i> Agregar Categoría
                </Button>
              </Link>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p>Cargando categorías...</p>
              ) : categories.length === 0 ? (
                <p>No hay categorías en la base de datos.</p>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Slug</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(category => (
                      <tr key={category.id}>
                        <td>{category.name}</td>
                        <td>{category.slug}</td>
                        <td>
                          <Link to={`/admin/categories/edit/${category.id}`}>
                            <Button variant="primary" size="sm">Editar</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Plataformas</h5>
              <Link to="/admin/platforms/new">
                <Button variant="success" size="sm">
                  <i className="fas fa-plus me-1"></i> Agregar Plataforma
                </Button>
              </Link>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <p>Cargando plataformas...</p>
              ) : platforms.length === 0 ? (
                <p>No hay plataformas en la base de datos.</p>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Slug</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platforms.map(platform => (
                      <tr key={platform.id}>
                        <td>{platform.name}</td>
                        <td>{platform.slug}</td>
                        <td>
                          <Link to={`/admin/platforms/edit/${platform.id}`}>
                            <Button variant="primary" size="sm">Editar</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Admin; 