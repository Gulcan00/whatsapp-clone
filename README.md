# WhatsApp Clone

A full-stack real-time messaging application built with modern web technologies. This project demonstrates real-time communication using WebSockets, user authentication, and a responsive UI.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)

## ✨ Features

- **Real-time Messaging**: Instant message delivery using Socket.IO
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **User Profiles**: Avatar support with Cloudinary integration
- **Responsive UI**: Modern, mobile-friendly interface built with React and Tailwind CSS
- **Contact Management**: View and manage contacts
- **Message History**: Persistent message storage with PostgreSQL

## 🛠 Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing
- **Radix UI** - Accessible UI components
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **Socket.IO** - WebSocket library
- **PostgreSQL** - Database
- **Drizzle ORM** - Type-safe database access
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Cloudinary** - Image hosting
- **Multer** - File upload handling
- **CORS** - Cross-origin request handling

## 📁 Project Structure

```
whatsapp-clone/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   ├── index.html         # HTML template
│   ├── vite.config.js     # Vite configuration
│   └── package.json       # Frontend dependencies
│
├── server/                 # Node.js backend application
│   ├── src/
│   │   ├── routes/        # Express route handlers
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Custom middleware
│   │   ├── controllers/   # Business logic
│   │   └── index.js       # Server entry point
│   ├── drizzle.config.ts  # Database configuration
│   ├── package.json       # Backend dependencies
│   └── tsconfig.json      # TypeScript configuration
│
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 📦 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (local or remote database)
- **Cloudinary Account** (for image uploads)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Gulcan00/whatsapp-clone.git
cd whatsapp-clone
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

### 3. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

## ⚙️ Configuration

### Backend Configuration

Create a `.env.local` file in the `server` directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/whatsapp_clone

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000
NODE_ENV=development
```

### Database Setup

1. Create a PostgreSQL database:
```bash
createdb whatsapp_clone
```

2. Run migrations using Drizzle Kit:
```bash
cd server
npm run db:migrate
```

## 🏃 Running the Application

### Development Mode

#### Terminal 1 - Start Backend Server
```bash
cd server
npm run dev
```
The server will start on `http://localhost:5000`

#### Terminal 2 - Start Frontend Development Server
```bash
cd client
npm run dev
```
The client will start on `http://localhost:5173`

### Production Build

#### Frontend
```bash
cd client
npm run build
npm run preview
```

#### Backend
```bash
cd server
npm start
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Message Endpoints

- `GET /api/messages/:chatId` - Get messages for a chat
- `POST /api/messages` - Send a message
- `DELETE /api/messages/:messageId` - Delete a message

### Contact Endpoints

- `GET /api/contacts` - Get all contacts
- `POST /api/contacts` - Add a contact
- `DELETE /api/contacts/:contactId` - Remove a contact

### WebSocket Events

- `connect` - Connect to the server
- `send_message` - Send a message in real-time
- `receive_message` - Receive a message
- `user_online` - User comes online
- `user_offline` - User goes offline

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the ISC License.

## 📧 Contact

For questions or support, please reach out to the project maintainer.
