# 🍕 Pizza Shop API

Food delivery app (aka. iFood/Uber Eats) back-end built with TypeScript, Drizzle a ElysiaJS.

> 🔥 This project aims to keep runtime agnostic, this means it should work on Bun, Node, Cloudflare Workers or any Web Standard API compatible runtime.

## Running

> Following this order, clone the project, install dependencies, configure the .env file in the root folder, and finally run the application.

commands:
```
git clone git@github.com:h3zord/pizza-shop-api.git
cd pizza-shop-api
bun i
bun dev
```

.env file:
```sh
# URL base para a API da aplicação.
API_BASE_URL="http://localhost:3333"

# URL de redirecionamento para autenticação.
AUTH_REDIRECT_URL="http://localhost:5173/dashboard"

# URL de conexão com o banco de dados PostgreSQL.
DB_URL="postgresql://pizza-shop-db_owner:h6TiworN8JQf@ep-fragrant-resonance-a57e0jcb.us-east-2.aws.neon.tech/pizza-shop-db?sslmode=require"

# Chave secreta usada para assinar tokens JWT.
JWT_SECRET_KEY="my-super-secret-key"
```

## Features

> The **summary** of the features are listed below. All the features contains E2E tests.

- it should be able to register a new restaurant
- it should be able to sign in as a restaurant manager
- it should be able to register as a new customer
- it should be able to crete an order to the restaurant
- it should be able to manage the restaurant menu
- it should be able to manage the restaurant evaluations
- it should be able to leave an evaluation
- it should be able to manage the restaurant orders
- it should be able to update the restaurant public profile
- it should be able to open/close the restaurant
- it should be able to list metrics from the restaurant