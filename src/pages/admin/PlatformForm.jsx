import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { getPlatforms } from '../../firebase/firestore';

const PlatformForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [platforms, setPlatforms] = useState([]);
  
  
  const [formValues, setFormValues] = useState({
    name: '',
    slug: '',
    logo: '',
    color: '#0070D1',
    order: 0
  });

  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        
        const platformsData = await getPlatforms();
        setPlatforms(platformsData);
        
        
        if (isEditMode) {
          const platform = platformsData.find(plat => plat.id === id);
          if (platform) {
            setFormValues({
              name: platform.name || '',
              slug: platform.slug || '',
              logo: platform.logo || '',
              color: platform.color || '#0070D1',
              order: platform.order || 0
            });
          } else {
            setError('No se encontró la plataforma solicitada');
          }
        } else {
          
          const maxOrder = platformsData.reduce((max, platform) => {
            return platform.order > max ? platform.order : max;
          }, 0);
          setFormValues(prev => ({
            ...prev,
            order: maxOrder + 1
          }));
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, isEditMode]);

  
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[áàäâ]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöô]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    
    if (name === 'name') {
      setFormValues({
        ...formValues,
        name: value,
        slug: generateSlug(value)
      });
    } else if (name === 'order') {
      
      const numValue = parseInt(value, 10) || 0;
      setFormValues({
        ...formValues,
        order: numValue
      });
    } else {
      setFormValues({
        ...formValues,
        [name]: value
      });
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      
      if (!formValues.name || !formValues.color) {
        setError('Por favor, completa todos los campos obligatorios');
        setSaving(false);
        return;
      }
      
      
      
      
      
      setTimeout(() => {
        if (isEditMode) {
          setSuccess('Plataforma actualizada con éxito');
          
          
          setTimeout(() => {
            navigate('/admin');
          }, 1500);
        } else {
          setSuccess('Plataforma agregada con éxito');
          
          
          setTimeout(() => {
            navigate('/admin');
          }, 1500);
          
          
          setFormValues({
            name: '',
            slug: '',
            logo: '',
            color: '#0070D1',
            order: formValues.order + 1 
          });
        }
        setSaving(false);
      }, 1000);
      
    } catch (err) {
      console.error('Error al guardar plataforma:', err);
      setError(`Error al ${isEditMode ? 'actualizar' : 'agregar'} la plataforma. Por favor, inténtalo de nuevo.`);
      setSaving(false);
    }
  };

  
  const handleCancel = () => {
    navigate('/admin');
  };

  
  const logoOptions = [
    { name: 'PlayStation 5', value: 'ps5_logo' },
    { name: 'PlayStation 4', value: 'ps4_logo' },
    { name: 'Xbox Series X|S', value: 'xbox_series_logo' },
    { name: 'Xbox One', value: 'xbox_one_logo' },
    { name: 'Nintendo Switch', value: 'switch_logo' },
    { name: 'PC', value: 'pc_logo' },
    { name: 'Mobile', value: 'mobile_logo' },
    { name: 'Nintendo 3DS', value: '3ds_logo' },
    { name: 'PlayStation Vita', value: 'psvita_logo' },
    { name: 'Retro', value: 'retro_logo' }
  ];

  return (
    <Container className="py-5">
      <Card>
        <Card.Header>
          <h1 className="mb-0">{isEditMode ? 'Editar Plataforma' : 'Agregar Nueva Plataforma'}</h1>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
              <p className="mt-3">Cargando datos...</p>
            </div>
          ) : (
            <>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nombre*</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="name" 
                        value={formValues.name} 
                        onChange={handleChange}
                        required 
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Slug</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="slug" 
                        value={formValues.slug} 
                        onChange={handleChange}
                        disabled 
                      />
                      <Form.Text className="text-muted">
                        Generado automáticamente a partir del nombre
                      </Form.Text>
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Logo</Form.Label>
                          <Form.Select 
                            name="logo" 
                            value={formValues.logo} 
                            onChange={handleChange}
                          >
                            <option value="">Selecciona un logo</option>
                            {logoOptions.map((logo, index) => (
                              <option key={index} value={logo.value}>
                                {logo.name}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Text className="text-muted">
                            Identificador del logo (se usará para cargar la imagen)
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Orden</Form.Label>
                          <Form.Control 
                            type="number" 
                            min="0" 
                            name="order" 
                            value={formValues.order} 
                            onChange={handleChange}
                          />
                          <Form.Text className="text-muted">
                            Posición en la que aparecerá en las listas (menor = primero)
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Color*</Form.Label>
                      <div className="d-flex">
                        <Form.Control 
                          type="color" 
                          name="color" 
                          value={formValues.color} 
                          onChange={handleChange}
                          required 
                          className="me-2"
                        />
                        <Form.Control 
                          type="text" 
                          name="color" 
                          value={formValues.color} 
                          onChange={handleChange}
                          required 
                          placeholder="#RRGGBB"
                        />
                      </div>
                      <Form.Text className="text-muted">
                        Color representativo de la marca
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Card className="mb-3">
                      <Card.Header>Vista previa</Card.Header>
                      <Card.Body>
                        <div 
                          className="p-3 rounded"
                          style={{ 
                            backgroundColor: formValues.color,
                            color: '#fff',
                            textAlign: 'center'
                          }}
                        >
                          <h4>{formValues.name || 'Nombre de plataforma'}</h4>
                          <div className="mt-2 p-2 bg-light rounded">
                            <span style={{ color: '#333' }}>
                              Logo ID: {formValues.logo || 'Sin logo seleccionado'}
                            </span>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                    
                    <Card className="mb-3">
                      <Card.Header>Plataformas existentes</Card.Header>
                      <Card.Body className="p-0" style={{ maxHeight: '300px', overflow: 'auto' }}>
                        <div className="list-group list-group-flush">
                          {platforms.length === 0 ? (
                            <div className="p-3 text-center text-muted">
                              No hay plataformas disponibles
                            </div>
                          ) : (
                            
                            [...platforms].sort((a, b) => a.order - b.order).map(platform => (
                              <div key={platform.id} className="list-group-item">
                                <div className="d-flex align-items-center justify-content-between">
                                  <div className="d-flex align-items-center">
                                    <span 
                                      className="badge rounded-pill me-2"
                                      style={{ 
                                        backgroundColor: platform.color,
                                        width: '20px',
                                        height: '20px',
                                        display: 'inline-block'
                                      }}
                                    >&nbsp;</span>
                                    <span>{platform.name}</span>
                                  </div>
                                  <small className="text-muted">
                                    Orden: {platform.order || 0}
                                  </small>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                    Cancelar
                  </Button>
                  <Button variant="primary" type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        {isEditMode ? 'Actualizando...' : 'Guardando...'}
                      </>
                    ) : (
                      isEditMode ? 'Actualizar Plataforma' : 'Guardar Plataforma'
                    )}
                  </Button>
                </div>
              </Form>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PlatformForm; 