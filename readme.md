# E-Commerce REST API

## Project Overview

A backend REST API for an e-commerce application built with Node.js, Express.js, MongoDB, Mongoose, and Zod.

The project was developed as a practical backend training project, focusing on building a structured and scalable e-commerce API with authentication, authorization, product and category management, shopping carts, orders, inventory management, and Stripe payments.

The API follows a layered architecture, separating responsibilities across routes, controllers, services, models, validators, middleware, utilities, and configuration.

## Features

### Authentication & Authorization

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Admin and Buyer roles
- Protected routes

### Product Management

- Create,retrieve, update, and delete products
- Category association
- Product slugs
- Product search
- Filtering and sorting
- Pagination

### Category Management

- Create categories
- Update categories
- Delete categories
- Retrieve categories
- Retrieve individual categories

### Shopping Cart

- Retrieve the user's cart
- Add products to cart
- Update product quantities
- Remove products from cart
- Clear cart
- Cart total calculation

### Order Management

- Create orders from the authenticated user's cart
- Retrieve individual orders
- Retrieve all orders for administrators
- Retrieve the current user's orders
- Cancel pending orders
- Order status management
- Unique order number generation
- MongoDB transactions
- Transaction rollback when order creation and order cancle fails

### Inventory Management

- Product stock management
- Inventory updates during order processing
- Stock validation before creating orders

### Payments

- Stripe payment integration
- Payment processing
- Stripe webhooks
- Payment status handling

### Validation & Error Handling

- Request validation with Zod
- Centralized error handling
- Custom application errors
- Async error handling middleware

## Tech Stack

- **Node.js** — JavaScript runtime
- **Express.js** — Web application framework
- **MongoDB** — NoSQL database
- **Mongoose** — MongoDB object modeling
- **Zod** — Request validation
- **JWT** — Authentication
- **bcrypt** — Password hashing
- **Stripe** — Payment processing
- **Slugify** — Product/category slug generation
- **Jest** — Testing framework
- **Supertest** — HTTP integration testing
- **MongoDB Memory Server** — Isolated MongoDB test environment

## Project Structure

```text
ecommerce-api/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── stripe.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── cart.controller.js
│   │   ├── category.controller.js
│   │   ├── order.controller.js
│   │   ├── payment.controller.js
│   │   └── product.controller.js
│   │
│   ├── middlewares/
│   │   ├── asyncHandler.js
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   │
│   ├── models/
│   │   ├── Cart.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── cart.routes.js
│   │   ├── category.routes.js
│   │   ├── order.routes.js
│   │   ├── payment.routes.js
│   │   └── product.routes.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── cart.service.js
│   │   ├── category.service.js
│   │   ├── order.service.js
│   │   ├── payment.service.js
│   │   └── product.service.js
│   │
│   ├── utils/
│   │   ├── AppError.js
│   │   └── jwt.js
│   │
│   ├── validators/
│   │   ├── auth.schema.js
│   │   ├── cart.schema.js
│   │   ├── category.schema.js
│   │   ├── order.schema.js
│   │   └── product.schema.js
│   │
│   └── app.js
│
├── test/
│   ├── setup.js
│   ├── helpers.js
│   ├── auth.test.js
│   ├── products.test.js
│   ├── cart.test.js
│   └── orders.test.js
│
├── server.js
├── .env
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Directory Responsibilities

| Directory      | Responsibility                                                    |
| -------------- | ----------------------------------------------------------------- |
| `config/`      | Database and third-party service configuration                    |
| `controllers/` | Handle HTTP requests and responses                                |
| `middlewares/` | Authentication, authorization, validation, async handling, errors |
| `models/`      | Mongoose schemas and database models                              |
| `routes/`      | API endpoint definitions                                          |
| `services/`    | Business logic and application operations                         |
| `utils/`       | Shared utilities and custom application errors                    |
| `validators/`  | Zod validation schemas                                            |
| `tests/`       | Integration tests, test setup, and reusable test helpers          |

## Architecture

The project follows a layered backend architecture:

```text
Client
  │
  ▼
Routes
  │
  ▼
Middleware
  │
  ├── Authentication
  ├── Authorization
  └── Validation
  │
  ▼
Controllers
  │
  ▼
Services
  │
  ▼
Models
  │
  ▼
MongoDB

```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- MongoDB
- A Stripe account for payment functionality

## Installation

### 1. Clone the repository:

**Clone the repository from GitHub**

```bash
git clone https://github.com/o-arafa/ecommerce-api.git
```

**Navigate to the project directory**

```bash
  cd ecommerce-api
```

**Install the required dependencies**

```bash
  npm install
```

### 2. Configure environment variables

Create a `.env` file.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

### 3. Run the development server

```bash
npm run dev
```

The API will be available at:

```text
http://localhost:5000
```

## Testing

The project includes integration tests using Jest and Supertest.

The tests use MongoDB Memory Server to create an isolated MongoDB replica set for testing. Test data is cleaned after every test, allowing tests to run independently.

### Integration Test Coverage

The integration test suite covers the following areas:

Authentication

- User registration (success, duplicate email, Zod validation, password mismatch)
- User login (success, incorrect password, non-existing email)

Products

- Retrieve products with pagination and search
- Retrieve a single product by id or by slug
- Create, update, and delete products
- Admin-only authorization and validation errors

Shopping Cart

- Retrieve the current user's cart
- Add products to the cart with stock reservation
- Reject adding more than the available stock
- Update product quantities with total recalculation
- Remove items from the cart and release reservations
- Clear the cart and release all reservations

Orders

- Create orders from the cart (decreases stock and deletes the cart)
- Reject incomplete shipping information and empty carts
- Inventory validation during order creation
- Transaction rollback when order creation fails
- Retrieve a single order (owner or admin only)
- Retrieve all orders for admins and the current user's orders
- Order status transitions with allowed flow validation
- Cancel pending orders with stock restoration

### Test Setup

The test/setup directory contains the configuration required to prepare and initialize the test environment.

The test/helpers directory contains reusable utilities used by multiple integration tests, such as creating test data and handling authentication.

### Running Tests

Run the test suite using:

```text
npm test
```

## API Endpoint Summary

```text
Authentication
POST   /api/auth/register
POST   /api/auth/login

Products
GET    /api/products
POST   /api/products
GET    /api/products/:productId
PATCH  /api/products/:productId
DELETE /api/products/:productId

Categories
GET    /api/categories
POST   /api/categories
GET    /api/categories/:categoryId
PATCH  /api/categories/:categoryId
DELETE /api/categories/:categoryId

Cart
GET    /api/cart
POST   /api/cart/add
PUT    /api/cart/:productId
DELETE /api/cart/:productId
DELETE /api/cart/clear

Orders
GET    /api/order/all
GET    /api/order/my-orders
GET    /api/order/:orderId
POST   /api/order
PUT    /api/order/:id/cancel
PUT    /api/order/:orderId/status

Payments
POST   /api/payments/checkout
POST   /api/payments/webhook
```

## Author

**Obeida Arafa**

- GitHub: [@o-arafa](https://github.com/o-arafa)
- LinkedIn: [Obeida Arafa](https://linkedin.com/in/o-arafa)
- Email: obeidaarafa@gmail.com

---

## ⭐ Show your support

Give a ⭐️ if you like this project!
