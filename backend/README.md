# Attendance System Backend

Spring Boot backend for the attendance system.

## Tech Stack

- Java 21
- Spring Boot 3.2.5
- PostgreSQL
- Spring Security + JWT
- Flyway database migrations
- Maven
- Docker support

## GitHub Safety

Safe to upload:

- `src/`
- `pom.xml`
- `Dockerfile`
- `Procfile`
- `docker-compose.yml`
- `.env.example`
- `.gitignore`
- `README.md`

Do not upload:

- `.env`
- `target/`
- `*.log`
- `.idea/`
- `*.iml`

These are already ignored in `.gitignore`.

## Environment Variables

For local development, use `backend/.env`.

For Railway, add these in Railway Variables instead of committing them to GitHub:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://host:port/database
SPRING_DATASOURCE_USERNAME=your_database_user
SPRING_DATASOURCE_PASSWORD=your_database_password
APP_JWT_SECRET=your-long-random-secret
APP_CORS_ALLOWED_ORIGINS=https://your-vercel-frontend-url.vercel.app
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
```

Optional local variables:

```env
PORT=8080
SERVER_PORT=8080
```

The app uses `PORT` first, then `SERVER_PORT`, then `8080`. This is important for Railway.

## Local Development

### Option 1: Maven

Make sure PostgreSQL is running and the values in `.env` are correct.

```bash
mvn clean package -DskipTests
java -jar target/attendance-system-1.0.0.jar
```

Backend URL:

```text
http://localhost:8080/api
```

Swagger UI:

```text
http://localhost:8080/api/swagger-ui.html
```

Health check:

```text
http://localhost:8080/api/actuator/health
```

### Option 2: Docker Compose

```bash
docker compose up --build
```

This starts PostgreSQL and the backend together.

## Railway Deployment

Recommended Railway setup:

1. Push the project to GitHub.
2. Create a Railway project.
3. Connect the GitHub repo.
4. Set the Railway service root directory to:

```text
backend
```

5. Add PostgreSQL in Railway.
6. Add the environment variables listed above.
7. Deploy.

Railway can deploy this backend using the included `Dockerfile`.

## Vercel Frontend Connection

After Railway deploys the backend, copy the Railway backend URL and update the frontend environment variable on Vercel:

```env
VITE_API_BASE_URL=https://your-railway-backend-url.up.railway.app/api
```

Then update Railway CORS:

```env
APP_CORS_ALLOWED_ORIGINS=https://your-vercel-frontend-url.vercel.app
```

## Database Migrations

Flyway migrations are stored in:

```text
src/main/resources/db/migration
```

On startup, Flyway applies pending migrations automatically.

## Important Production Notes

- Use a strong `APP_JWT_SECRET` in Railway.
- Do not commit `.env`.
- Do not use local database URLs like `localhost` in Railway.
- Keep `SPRING_JPA_HIBERNATE_DDL_AUTO=validate` in production.
- If CORS fails, make sure `APP_CORS_ALLOWED_ORIGINS` exactly matches your Vercel URL.
