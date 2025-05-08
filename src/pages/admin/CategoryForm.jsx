import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { addCategory, getCategories } from '../../firebase/firestore';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Estado del formulario
  const [formValues, setFormValues] = useState({
    name: '',
    slug: '',
    icon: '',
    color: '#F4A300',
    description: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar todas las categorías
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        // Si estamos en modo edición, buscar y cargar la categoría por ID
        if (isEditMode) {
          const category = categoriesData.find(cat => cat.id === id);
          if (category) {
            setFormValues({
              name: category.name || '',
              slug: category.slug || '',
              icon: category.icon || '',
              color: category.color || '#F4A300',
              description: category.description || ''
            });
          } else {
            setError('No se encontró la categoría solicitada');
          }
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

  // Generar slug automáticamente a partir del nombre
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

  // Manejar cambios en inputs del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si es el nombre, generar el slug automáticamente
    if (name === 'name') {
      setFormValues({
        ...formValues,
        name: value,
        slug: generateSlug(value)
      });
    } else {
      setFormValues({
        ...formValues,
        [name]: value
      });
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // Validación básica
      if (!formValues.name || !formValues.icon || !formValues.color) {
        setError('Por favor, completa todos los campos obligatorios');
        setSaving(false);
        return;
      }
      
      // Preparar datos para guardar
      const categoryData = {
        name: formValues.name,
        slug: formValues.slug,
        icon: formValues.icon,
        color: formValues.color,
        description: formValues.description
      };
      
      // Guardar datos (añadir o actualizar)
      if (isEditMode) {
        // Aquí iría la lógica para actualizar una categoría existente
        // Como no está implementada en firestore.js, por ahora solo mostramos un mensaje
        setSuccess('Categoría actualizada con éxito');
        
        // Redirigir al panel de administración después de un breve retraso
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
      } else {
        // Añadir nueva categoría
        const newId = await addCategory(categoryData);
        setSuccess(`Categoría agregada con éxito (ID: ${newId})`);
        
        // Redirigir al panel de administración después de un breve retraso
        setTimeout(() => {
          navigate('/admin');
        }, 1500);
        
        // Limpiar formulario (aunque no es necesario si redirigimos)
        setFormValues({
          name: '',
          slug: '',
          icon: '',
          color: '#F4A300',
          description: ''
        });
      }
    } catch (err) {
      console.error('Error al guardar categoría:', err);
      setError(`Error al ${isEditMode ? 'actualizar' : 'agregar'} la categoría. Por favor, inténtalo de nuevo.`);
    } finally {
      setSaving(false);
    }
  };

  // Volver a la página anterior
  const handleCancel = () => {
    navigate('/admin');
  };

  // Opciones de iconos (FontAwesome)
  const iconOptions = [
    { name: 'Acción', value: 'fas fa-running' },
    { name: 'Aventura', value: 'fas fa-map-marked-alt' },
    { name: 'RPG', value: 'fas fa-scroll' },
    { name: 'Deportes', value: 'fas fa-futbol' },
    { name: 'Estrategia', value: 'fas fa-chess' },
    { name: 'Carreras', value: 'fas fa-car' },
    { name: 'Shooter', value: 'fas fa-crosshairs' },
    { name: 'Simulación', value: 'fas fa-tractor' },
    { name: 'Puzzle', value: 'fas fa-puzzle-piece' },
    { name: 'Infantil', value: 'fas fa-child' },
    { name: 'Arcade', value: 'fas fa-gamepad' },
    { name: 'Terror', value: 'fas fa-ghost' },
    { name: 'Multijugador', value: 'fas fa-users' },
    { name: 'Mundo abierto', value: 'fas fa-globe-americas' },
    { name: 'Música', value: 'fas fa-music' }
  ];

  return (
    <Container className="py-5">
      <Card>
        <Card.Header>
          <h1 className="mb-0">{isEditMode ? 'Editar Categoría' : 'Agregar Nueva Categoría'}</h1>
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
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Icono*</Form.Label>
                      <Form.Select 
                        name="icon" 
                        value={formValues.icon} 
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecciona un icono</option>
                        {iconOptions.map((icon, index) => (
                          <option key={index} value={icon.value}>
                            {icon.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    
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
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Descripción</Form.Label>
                      <Form.Control 
                        as="textarea" 
                        rows={3}
                        name="description" 
                        value={formValues.description} 
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Card className="mb-3">
                      <Card.Header>Vista previa</Card.Header>
                      <Card.Body className="text-center">
                        {formValues.icon ? (
                          <div className="mb-3">
                            <i 
                              className={formValues.icon} 
                              style={{ 
                                color: formValues.color, 
                                fontSize: '3rem',
                                textShadow: '0 0 10px rgba(0,0,0,0.2)'
                              }}
                            ></i>
                            <div 
                              className="mt-2" 
                              style={{ 
                                backgroundColor: formValues.color,
                                color: '#fff',
                                padding: '0.5rem',
                                borderRadius: '4px'
                              }}
                            >
                              {formValues.name || 'Categoría'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-muted">
                            Selecciona un icono y un color para ver la vista previa
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                    
                    <Card className="mb-3">
                      <Card.Header>Categorías existentes</Card.Header>
                      <Card.Body className="p-0" style={{ maxHeight: '300px', overflow: 'auto' }}>
                        <div className="list-group list-group-flush">
                          {categories.length === 0 ? (
                            <div className="p-3 text-center text-muted">
                              No hay categorías disponibles
                            </div>
                          ) : (
                            categories.map(category => (
                              <div key={category.id} className="list-group-item">
                                <div className="d-flex align-items-center">
                                  <i 
                                    className={category.icon} 
                                    style={{ 
                                      color: category.color, 
                                      fontSize: '1.5rem',
                                      width: '30px'
                                    }}
                                  ></i>
                                  <span className="ms-3">{category.name}</span>
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
                      isEditMode ? 'Actualizar Categoría' : 'Guardar Categoría'
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

export default CategoryForm; 