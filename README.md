
# 🏡 HearHome

<div align="center">

### Plataforma Integral de Gestión Residencial e Inmobiliaria

**Una forma más sencilla de administrar propiedades, conectar residentes y organizar comunidades.**

![Estado](https://img.shields.io/badge/Estado-En%20desarrollo-yellow?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL%20Server-Base%20de%20datos-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-Frontend-E34F26?style=for-the-badge&logo=html5&logoColor=white)

</div>

---

## 📖 Acerca del proyecto

**HearHome** es una plataforma web diseñada para centralizar la administración de edificios y comunidades residenciales, facilitando la gestión de propiedades, residentes, pagos, solicitudes de mantenimiento y comunicación.

El sistema busca sustituir procesos manuales y herramientas dispersas por un entorno digital organizado, accesible y fácil de utilizar.

HearHome contempla dos tipos de usuarios: **Administradores** y **Residentes**, cada uno con funciones y permisos específicos.

> **Nuestra visión:** simplificar la administración residencial mediante una plataforma que conecte a las personas, sus hogares y los servicios que necesitan.

---

## ✨ Funcionalidades principales

### 🏢 Administración de propiedades
- Registro y administración de edificios.
- Gestión de unidades residenciales.
- Organización de residentes por propiedad.
- Visualización de información administrativa.

### 👥 Gestión de residentes
- Registro de nuevos usuarios.
- Vinculación mediante código único de edificio.
- Solicitudes de acceso pendientes de autorización.
- Aprobación y asignación de unidades por el administrador.
- Acceso a funcionalidades según el rol del usuario.

### 💳 Control de pagos
- Consulta de pagos pendientes y realizados.
- Registro de importes acordados por residente.
- Historial de movimientos.
- Identificación de pagos vencidos.
- Carga de comprobantes de pago.
- Validación de pagos por el administrador.

### 🔧 Solicitudes de mantenimiento
- Creación de solicitudes.
- Clasificación por prioridad.
- Seguimiento del estado de cada solicitud.
- Registro de información y fotografías.
- Consulta del historial de mantenimientos.

### 💬 Comunicación residencial
- Mensajería entre administradores y residentes.
- Conversaciones asociadas a las unidades.
- Publicación de avisos y anuncios.
- Centralización de la comunicación de la comunidad.

### 📊 Panel administrativo
- Resumen de información relevante.
- Seguimiento de pagos.
- Consulta de solicitudes pendientes.
- Supervisión de residentes y propiedades.

> **Nota:** Estas funcionalidades representan el alcance previsto del proyecto. Su implementación se realizará progresivamente.

---

## 🛠️ Tecnologías utilizadas

| Área | Tecnologías |
|---|---|
| Frontend | HTML5, CSS3, JavaScript |
| Backend | Node.js, Express.js |
| Base de datos | Microsoft SQL Server Express |
| Arquitectura | MVC y API REST |
| Pruebas | Postman |
| Control de versiones | Git y GitHub |
| Entorno de desarrollo | Visual Studio Code |

---

## 📂 Estructura del proyecto

```text
HearHome/
│
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   │
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── package.json
│   └── README.md
│
├── Frontend/
│   ├── css/
│   ├── index.html
│   ├── registro.html
│   ├── espera.html
│   ├── admin-accesos.html
│   ├── admin-chat.html
│   ├── admin-edificios.html
│   ├── admin-nuevo-edificio.html
│   ├── admin-solicitudes.html
│   ├── residente-chat.html
│   ├── residente-inicio.html
│   └── residente-pagos.html
│
└── README.md
```

*La estructura podrá actualizarse conforme avance la implementación.*

---

## 👤 Roles del sistema

### Administrador

Responsable de gestionar los edificios, unidades y residentes asociados a sus propiedades.

Entre sus funciones se encuentran la autorización de nuevos residentes, supervisión de pagos, administración de solicitudes de mantenimiento y comunicación con los usuarios.

### Residente

Usuario vinculado a una unidad dentro de un edificio registrado.

Puede consultar su información, revisar pagos, enviar comprobantes, registrar solicitudes de mantenimiento y comunicarse con la administración.

---

## 🚀 Instalación y ejecución

### Requisitos

- Node.js y npm.
- SQL Server Express para las funcionalidades que requieren base de datos.
- Visual Studio Code o un editor equivalente.
- Git.

### 1. Clonar el repositorio

```bash
git clone https://github.com/KingVara2/HearHome.git
```

### 2. Entrar al Backend

```bash
cd HearHome/Backend
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Iniciar el servidor

```bash
node src/server.js
```

### 5. Verificar el servidor

Si el servidor está configurado en el puerto 3000, visitar:

```text
http://localhost:3000/api/health
```

### 6. Visualizar el Frontend

Abrir la carpeta `Frontend` en Visual Studio Code y ejecutar `index.html` mediante la extensión **Live Server**.

**Importante:** la integración completa entre las interfaces, el Backend y SQL Server continúa en desarrollo.

---

## 🗺️ Etapas de desarrollo

- [x] Definición del alcance del proyecto.
- [x] Organización inicial del repositorio.
- [x] Diseño inicial de interfaces web.
- [x] Configuración inicial del servidor Express.
- [ ] Diseño e implementación de la base de datos.
- [ ] Implementación de autenticación y autorización.
- [ ] Desarrollo de endpoints de los módulos principales.
- [ ] Integración del Frontend con el Backend.
- [ ] Pruebas funcionales y corrección de errores.
- [ ] Documentación y entrega de la versión inicial.

---

## 🎯 Objetivo del proyecto

Desarrollar una plataforma web funcional que facilite la administración residencial mediante la digitalización de procesos relacionados con propiedades, residentes, pagos, mantenimiento y comunicación, ofreciendo una experiencia organizada, segura y accesible.

---

## 👨‍💻 Equipo de desarrollo

| Integrante | Responsabilidad |
|---|---|
| **Ulises Vara** | Dirección del proyecto, Backend y base de datos |
| **Martín Ruiz** | Frontend, pruebas y documentación |

El desarrollo se realiza de manera colaborativa, utilizando GitHub para administrar versiones, compartir avances y mantener organizada la integración de componentes.

---

## 🔮 Evolución futura

Una vez completada la primera versión funcional, HearHome podrá ampliarse con características como notificaciones automáticas, reportes avanzados, integraciones de pago y nuevas herramientas de administración.

Estas funcionalidades no forman parte del alcance inicial y se consideran posibles mejoras posteriores.

---

<div align="center">

### 🏡 HearHome

**Tu comunidad, tu espacio, tu hogar.**

*Proyecto académico de desarrollo de software.*

</div>
<div align="center">
  <img src="assets/hearhome-banner.png"
       alt="HearHome - Plataforma de Gestión Residencial"
       width="100%">
</div>
