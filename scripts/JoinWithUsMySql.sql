-- Crear base de datos
CREATE DATABASE JoinWithUs;
USE JoinWithUs;

-- Tabla de Usuarios
CREATE TABLE Users (
    UserId INT AUTO_INCREMENT PRIMARY KEY,
    FullName VARCHAR(150) NOT NULL,
    BirthDate DATE NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    DNI VARCHAR(20) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL CHECK (Role IN ('user', 'organizer', 'admin', 'helper')),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Eventos
CREATE TABLE Events (
    EventId INT AUTO_INCREMENT PRIMARY KEY,
    OrganizerId INT NOT NULL,
    Title VARCHAR(200) NOT NULL,
    Description TEXT NOT NULL,
    StartDate DATETIME NOT NULL,
    EndDate DATETIME NOT NULL,
    Address VARCHAR(255),
    Latitude DECIMAL(10,7),
    Longitude DECIMAL(10,7),
    Visibility VARCHAR(20) NOT NULL CHECK (Visibility IN ('public')),
    Categories VARCHAR(255),
    BannerUrl VARCHAR(255),
    VideoUrl VARCHAR(255),
    Status VARCHAR(20) DEFAULT 'draft' CHECK (Status IN ('draft', 'published')),
    Capacity INT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (OrganizerId) REFERENCES Users(UserId)
);

-- Tabla de Tickets
CREATE TABLE Tickets (
    TicketId INT AUTO_INCREMENT PRIMARY KEY,
    EventId INT NOT NULL,
    Type VARCHAR(50) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Description VARCHAR(255),
    StockAvailable INT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (EventId) REFERENCES Events(EventId)
);

-- Tabla de Pedidos (Orders)
CREATE TABLE Orders (
    OrderId INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    EventId INT NOT NULL,
    TicketId INT NOT NULL,
    Quantity INT NOT NULL,
    TotalPrice DECIMAL(10,2) NOT NULL,
    PaymentStatus VARCHAR(20) NOT NULL CHECK (PaymentStatus IN ('paid', 'pending', 'refunded')),
    OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (EventId) REFERENCES Events(EventId),
    FOREIGN KEY (TicketId) REFERENCES Tickets(TicketId)
);

-- Tabla de Reseñas
CREATE TABLE Reviews (
    ReviewId INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (EventId) REFERENCES Events(EventId),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- Tabla de Notificaciones
CREATE TABLE Notifications (
    NotificationId INT AUTO_INCREMENT PRIMARY KEY,
    UserId INT NOT NULL,
    EventId INT NOT NULL,
    Message TEXT NOT NULL,
    IsRead BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (EventId) REFERENCES Events(EventId)
);

-- Insertar registros en la tabla de Usuarios
INSERT INTO Users (FullName, BirthDate, Phone, DNI, Email, PasswordHash, Role)
VALUES 
('Juan Pérez', '1990-05-15', '123456789', '12345678A', 'juan.perez@example.com', 'hashedpassword1', 'admin'),
('Ana Martínez', '1985-07-22', '987654321', '98765432B', 'ana.martinez@example.com', 'hashedpassword2', 'organizer'),
('Carlos García', '2000-03-30', '555555555', '12365478C', 'carlos.garcia@example.com', 'hashedpassword3', 'user'),
('Laura Sánchez', '1995-12-10', '666666666', '65498723D', 'laura.sanchez@example.com', 'hashedpassword4', 'admin'),
('Pedro Fernández', '1982-11-25', '777777777', '32198765E', 'pedro.fernandez@example.com', 'hashedpassword5', 'helper');

-- Insertar registros en la tabla de Eventos
INSERT INTO Events (OrganizerId, Title, Description, StartDate, EndDate, Address, Latitude, Longitude, Visibility, Categories, BannerUrl, VideoUrl, Status, Capacity)
VALUES
(2, 'Concierto de Rock', 'Un evento de música rock en vivo', '2025-06-10 18:00:00', '2025-06-10 22:00:00', 'Avenida Central 123, Ciudad', 40.7128, -74.0060, 'public', 'Música', 'https://res.cloudinary.com/dlbvvaqsq/image/upload/v1747850787/f2a830ea-d3f6-41dc-9f2a-199add80b380.png', 'https://youtu.be/NQNF2qcbY4k?si=YEwrSsj5zqRZJQmp', 'published', 500),
(2, 'Conferencia de Tecnología', 'Charlas sobre innovación tecnológica', '2025-07-15 09:00:00', '2025-07-15 17:00:00', 'Calle de la Innovación 456, Ciudad', 40.7128, -74.0060, 'public', 'Tecnología', 'https://res.cloudinary.com/dlbvvaqsq/image/upload/v1747850867/1e6236c8-d88d-43a6-993d-e49adffb853d.jpg', 'https://youtu.be/FDgc8sZQYx0?si=ZnZJIcCytVPhYYvP', 'published', 200),
(1, 'Feria de Emprendedores', 'Exposición de startups y nuevos negocios', '2025-08-01 10:00:00', '2025-08-01 18:00:00', 'Plaza Mayor, Ciudad', 40.7128, -74.0060, 'public', 'Negocios', 'https://res.cloudinary.com/dlbvvaqsq/image/upload/v1747850920/79e2502c-7ede-415b-9a24-1311ff964260.jpg', 'https://youtu.be/a_gbE9A3Oz4?si=xO8FOR1k6hTC7Fac', 'published', 300),
(1, 'Festival de Cine', 'Muestra de películas independientes', '2025-09-05 19:00:00', '2025-09-05 23:00:00', 'Calle de las Artes 789, Ciudad', 40.7128, -74.0060, 'public', 'Cine', 'https://res.cloudinary.com/dlbvvaqsq/image/upload/v1747851335/e21b0b40-8aac-4984-9b66-e887b3cdb5ab.webp', 'https://youtu.be/pSy15uFkuME?si=Q9lLf0iWEX3-wfyb', 'published', 150),
(2, 'Exposición de Arte', 'Arte contemporáneo en la galería', '2025-05-25 17:00:00', '2025-05-25 21:00:00', 'Calle del Arte 321, Ciudad', 40.7128, -74.0060, 'public', 'Arte', 'https://res.cloudinary.com/dlbvvaqsq/image/upload/v1747851360/c0544c0d-5f09-41fe-9920-2a1bae1457a8.avif', 'https://youtu.be/P8v5-DCN-Q4?si=-xfva_Ixnf_vIbU7', 'published', 100);

-- Insertar registros en la tabla de Tickets
INSERT INTO Tickets (EventId, Type, Price, Description, StockAvailable)
VALUES
(1, 'General', 50.00, 'Entrada general al concierto', 500),
(2, 'VIP', 100.00, 'Acceso a zona VIP', 100),
(3, 'General', 0.00, 'Entrada para expositores', 50),
(4, 'General', 20.00, 'Entrada general al festival de cine', 150),
(5, 'VIP', 10.00, 'Entrada a la exposición de arte', 100);

-- Insertar registros en la tabla de Pedidos
INSERT INTO Orders (UserId, EventId, TicketId, Quantity, TotalPrice, PaymentStatus)
VALUES
(1, 1, 1, 2, 100.00, 'paid'),
(2, 2, 2, 1, 100.00, 'paid'),
(3, 3, 3, 1, 0.00, 'paid'),
(4, 4, 4, 3, 60.00, 'paid'),
(5, 5, 5, 5, 50.00, 'paid');

-- Insertar registros en la tabla de Reseñas
INSERT INTO Reviews (EventId, UserId, Rating, Comment)
VALUES
(1, 1, 5, 'La plataforma es súper intuitiva. En minutos creé mi primer evento y comencé a vender entradas.'),
(2, 2, 4, 'Me encanta el panel de control, puedo ver las estadísticas de ventas en tiempo real. Muy útil.'),
(3, 3, 3, 'Excelente servicio. Gestionar múltiples eventos nunca fue tan fácil.'),
(4, 4, 5, 'Pude personalizar mis eventos con imágenes, fechas y precios sin complicaciones. Muy recomendable.'),
(5, 5, 4, 'Tuve un problema con el acceso, pero el soporte fue rápido y eficiente. ¡Gracias!');

-- Insertar registros en la tabla de Notificaciones
INSERT INTO Notifications (UserId, Type, Message)
VALUES
(1, 'Evento', '¡El evento Concierto de Rock ha sido publicado!'),
(2, 'Evento', 'La Conferencia de Tecnología ha sido aprobada.'),
(3, 'Pedido', 'Tu pedido para la Feria de Emprendedores ha sido confirmado.'),
(4, 'Reserva', 'La Boda en Restaurante Los Olivos ha sido confirmada.'),
(5, 'Cupones', 'Tienes un nuevo cupón de descuento de 10% para la Exposición de Arte.');