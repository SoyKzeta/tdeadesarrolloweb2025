# GameShop - Tienda Online de Videojuegos

![GameShop Banner](./src/assets/logos/logo.png)

## Descripción del Proyecto

GameShop es una tienda en línea especializada en la venta de videojuegos, accesorios y tarjetas de regalo para diferentes plataformas. Esta aplicación web permite a los usuarios explorar catálogos, filtrar por categorías y plataformas, gestionar un carrito de compras, y completar el proceso de compra de manera intuitiva.

El proyecto ha sido desarrollado como parte del curso de desarrollo web, implementando las mejores prácticas de programación y arquitectura de software moderna.

## Características Principales

- 🎮 Catálogo completo de videojuegos para diferentes plataformas
- 🎧 Sección de accesorios para gaming
- 💳 Venta de tarjetas de regalo digitales
- 🔍 Sistema de búsqueda y filtrado avanzado
- 🛒 Carrito de compras persistente
- 💰 Soporte para múltiples monedas con COP (Peso Colombiano) como moneda principal
- 👤 Gestión de cuentas de usuario (registro, inicio de sesión, perfil)
- 📱 Diseño responsive adaptado a dispositivos móviles y de escritorio
- 🔐 Panel de administración para gestión de productos, categorías y pedidos

## Tecnologías Utilizadas

### Frameworks y Librerías Principales

- **React 18**: Biblioteca JavaScript moderna para construir interfaces de usuario basadas en componentes.
- **Vite**: Herramienta de construcción ultrarrápida que mejora significativamente los tiempos de desarrollo.
- **Firebase 10**: Plataforma completa de desarrollo que proporciona:
  - **Firestore**: Base de datos NoSQL en tiempo real para almacenar productos, usuarios y órdenes.
  - **Authentication**: Sistema seguro de autenticación con múltiples proveedores.
  - **Storage**: Almacenamiento escalable de archivos para imágenes de productos.
  - **Rules**: Implementación de reglas de seguridad personalizadas para proteger los datos.
- **React Router v6**: Sistema de navegación declarativo para aplicaciones React.
- **React Bootstrap 5**: Framework de UI componentes basado en Bootstrap 5 para React.
- **React-Toastify**: Sistema de notificaciones elegantes y configurables.

### Librerías y Herramientas Adicionales

- **Context API**: Implementación avanzada para gestión de estado global (carrito, autenticación, moneda).
- **Font Awesome 6**: Extensa biblioteca de iconos vectoriales modernos.
- **ESLint**: Herramienta de análisis de código estático para mantener la calidad del código.
- **Intl.NumberFormat**: API nativa para formato de precios en múltiples monedas.
- **Local Storage**: Almacenamiento en el navegador para persistencia de datos del usuario.

## Sistema de Monedas

GameShop implementa un sistema de múltiples monedas que permite a los usuarios ver los precios en diferentes divisas:

- **COP (Peso Colombiano)**: Moneda principal del sistema y predeterminada para todos los formularios de administración.
- **USD (Dólar Estadounidense)**: Moneda secundaria con tipo de cambio actualizado.
- **MXN (Peso Mexicano)**: Soporte para el mercado mexicano.
- **EUR (Euro)**: Soporte para el mercado europeo.
- **ARS (Peso Argentino)**: Soporte para el mercado argentino.
- **CLP (Peso Chileno)**: Soporte para el mercado chileno.
- **PEN (Sol Peruano)**: Soporte para el mercado peruano.
- **BRL (Real Brasileño)**: Soporte para el mercado brasileño.

Los precios se ingresan en COP en el panel de administración y se convierten automáticamente a las diferentes monedas según la preferencia del usuario.

## Arquitectura del Proyecto

### Patrón de Diseño

El proyecto sigue el patrón de arquitectura de componentes de React con una clara separación de responsabilidades:

- **Componentes**: Unidades visuales reutilizables (botones, tarjetas, etc.)
- **Páginas**: Componentes de alto nivel que representan rutas completas
- **Contextos**: Gestión de estado global con React Context API
- **Servicios**: Funciones para interactuar con APIs externas (Firebase)
- **Hooks personalizados**: Lógica reutilizable para componentes


## Características del Panel de Administración

El panel de administración incluye:

- **Gestión de Productos**: Formularios para añadir y editar:
  - Juegos con detalles completos (título, descripción, precio en COP, stock, categorías, etc.)
  - Accesorios con especificaciones técnicas
  - Tarjetas de regalo con valores y plataformas asociadas
- **Gestión de Categorías**: Creación y edición de categorías con colores e iconos personalizados
- **Gestión de Plataformas**: Administración de plataformas de juegos
- **Visualización de Pedidos**: Panel para revisar y gestionar pedidos de clientes

## Instalación y Ejecución

# Instalar dependencias
npm install

# Ejecutar el servidor de desarrollo
npm run dev


## Objetivos de Aprendizaje Alcanzados

Este proyecto demuestra competencia en:

1. **Desarrollo Frontend Moderno**: Implementación de React con hooks y Context API
2. **Arquitectura de Aplicaciones**: Estructura organizada y mantenible
3. **Integración con Bases de Datos**: Uso eficiente de Firestore para almacenamiento
4. **Autenticación y Seguridad**: Implementación de login y reglas de seguridad
5. **Responsive Design**: Adaptación a diferentes dispositivos
6. **Gestión de Estado**: Manejo eficiente del estado global y local
7. **Internacionalización**: Sistema de múltiples monedas
8. **Validación de Formularios**: Implementación de validaciones en formularios

## Mejores Prácticas Implementadas

- **Code Splitting**: Carga eficiente de componentes según necesidad
- **Componentes Reutilizables**: DRY (Don't Repeat Yourself) aplicado en todo el código
- **Manejo de Errores**: Captura y presentación adecuada de errores
- **Lazy Loading**: Carga diferida de imágenes y componentes
- **Optimización de Rendimiento**: Uso apropiado de memoización y useCallback
- **Convenciones de Nombrado**: Nomenclatura clara y consistente en todo el proyecto


