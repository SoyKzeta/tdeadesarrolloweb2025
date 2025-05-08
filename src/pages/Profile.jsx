import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Modal, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/useAuth.js';
import { getUserProfile, updateUserProfile, addShippingAddress, deleteShippingAddress } from '../firebase/firestore';
import { toast } from 'react-toastify';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });
  const [error, setError] = useState('');

  // Cargar el perfil del usuario
  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser) {
        try {
          const userProfile = await getUserProfile(currentUser.uid);
          setProfile(userProfile);
          setEditedProfile(userProfile);
        } catch (error) {
          console.error("Error al cargar el perfil:", error);
          setError("No se pudo cargar la información de tu perfil.");
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfile();
  }, [currentUser]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en el formulario de dirección
  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Guardar perfil
  const handleSaveProfile = async () => {
    try {
      await updateUserProfile(currentUser.uid, editedProfile);
      setProfile(editedProfile);
      setEditing(false);
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      toast.error("No se pudo actualizar el perfil");
    }
  };

  // Añadir dirección
  const handleAddAddress = async () => {
    try {
      // Validar que todos los campos estén completos
      const requiredFields = ['name', 'address', 'city', 'state', 'zipCode', 'phone'];
      const missingFields = requiredFields.filter(field => !newAddress[field]);
      
      if (missingFields.length > 0) {
        setError("Por favor completa todos los campos");
        return;
      }

      await addShippingAddress(currentUser.uid, newAddress);
      
      // Recargar el perfil
      const updatedProfile = await getUserProfile(currentUser.uid);
      setProfile(updatedProfile);
      setEditedProfile(updatedProfile);
      
      // Limpiar formulario y cerrar modal
      setNewAddress({
        name: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: ''
      });
      setShowAddressModal(false);
      setError('');
      
      toast.success("Dirección añadida correctamente");
    } catch (error) {
      console.error("Error al añadir dirección:", error);
      toast.error("No se pudo añadir la dirección");
    }
  };

  // Eliminar dirección
  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
      try {
        await deleteShippingAddress(currentUser.uid, addressId);
        
        // Recargar el perfil
        const updatedProfile = await getUserProfile(currentUser.uid);
        setProfile(updatedProfile);
        setEditedProfile(updatedProfile);
        
        toast.success("Dirección eliminada correctamente");
      } catch (error) {
        console.error("Error al eliminar dirección:", error);
        toast.error("No se pudo eliminar la dirección");
      }
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin fa-3x"></i>
          <p className="mt-3">Cargando tu perfil...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="section-title text-center mb-4">Mi Perfil</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Información Personal</h5>
                <Button 
                  variant="link" 
                  onClick={() => setEditing(!editing)}
                  className="p-0"
                >
                  {editing ? "Cancelar" : <i className="fas fa-edit"></i>}
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {editing ? (
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre completo</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="name" 
                      value={editedProfile.name || ''} 
                      onChange={handleInputChange} 
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Correo electrónico</Form.Label>
                    <Form.Control 
                      type="email" 
                      value={currentUser.email} 
                      disabled 
                    />
                    <Form.Text className="text-muted">
                      El correo no se puede cambiar.
                    </Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Teléfono</Form.Label>
                    <Form.Control 
                      type="tel" 
                      name="phone" 
                      value={editedProfile.phone || ''} 
                      onChange={handleInputChange} 
                    />
                  </Form.Group>
                  <Button variant="warning" onClick={handleSaveProfile}>
                    Guardar Cambios
                  </Button>
                </Form>
              ) : (
                <div>
                  <p><strong>Nombre:</strong> {profile.name || 'No especificado'}</p>
                  <p><strong>Correo:</strong> {currentUser.email}</p>
                  <p><strong>Teléfono:</strong> {profile.phone || 'No especificado'}</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Direcciones de Envío</h5>
                <Button 
                  variant="warning" 
                  size="sm"
                  onClick={() => setShowAddressModal(true)}
                >
                  <i className="fas fa-plus me-1"></i> Añadir
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {profile.shippingAddresses && profile.shippingAddresses.length > 0 ? (
                <ListGroup variant="flush">
                  {profile.shippingAddresses.map((address) => (
                    <ListGroup.Item key={address.id} className="address-item">
                      <div className="d-flex justify-content-between">
                        <div>
                          <p className="fw-bold mb-1">{address.name}</p>
                          <p className="mb-1">{address.address}</p>
                          <p className="mb-1">{address.city}, {address.state} {address.zipCode}</p>
                          <p className="mb-0">{address.phone}</p>
                        </div>
                        <div>
                          <Button 
                            variant="link" 
                            className="text-danger p-0 ms-2"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-center my-4">
                  No tienes direcciones de envío guardadas.
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para agregar dirección */}
      <Modal 
        show={showAddressModal} 
        onHide={() => {
          setShowAddressModal(false);
          setError('');
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Añadir Nueva Dirección</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control 
                type="text" 
                name="name" 
                value={newAddress.name} 
                onChange={handleAddressInputChange} 
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control 
                type="text" 
                name="address" 
                value={newAddress.address} 
                onChange={handleAddressInputChange} 
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ciudad</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="city" 
                    value={newAddress.city} 
                    onChange={handleAddressInputChange} 
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado/Provincia</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="state" 
                    value={newAddress.state} 
                    onChange={handleAddressInputChange} 
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Código Postal</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="zipCode" 
                    value={newAddress.zipCode} 
                    onChange={handleAddressInputChange} 
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control 
                    type="tel" 
                    name="phone" 
                    value={newAddress.phone} 
                    onChange={handleAddressInputChange} 
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddressModal(false)}>
            Cancelar
          </Button>
          <Button variant="warning" onClick={handleAddAddress}>
            Guardar Dirección
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Profile; 