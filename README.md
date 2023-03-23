# TimeTracker

## Getting Started
1. Install dependencies
```bash
yarn
```
2. Setup PostgresSQL database
```
// Set the environment varaible for connection URL in `.env` file
DATABASE_URL="postgresql://<db-user>:<db-password>@localhost:5432/<db-name>"
```

3. Setup environment variables

Get the required environment variables from Infisical and store them in `.env` file.

4. Start the development server
```bash
yarn dev
```

## Prisma Migrate
1. To apply new migrations
```bash
npx prisma migrate dev
```
2. To generate a migration
```bash
npx prisma migrate dev --name new-field
```