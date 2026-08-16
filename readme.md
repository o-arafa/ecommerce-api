# E-Shop API

E-commerce REST API built with Node.js, Express, and MongoDB.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Validation:** Zod
- **Auth:** JWT

## Features

- Product CRUD with inventory
- Category CRUD
- Authentication (JWT)
- Cart with reservation
- Orders
- Stripe Payments

## Setup

```bash
https://github.com/o-arafa/ecommerce-api.git
cd ecommerce-api
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables
   create .env file, and add the required configurations

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
```

4. Run the application

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Author

**Obeida Arafa**

- GitHub: [@o-arafa](https://github.com/o-arafa)
- LinkedIn: [Obeida Arafa](https://linkedin.com/in/o-arafa)
- Email: obeidaarafa@gmail.com

---

## ⭐ Show your support

Give a ⭐️ if you like this project!