# provisioning-worker

[English](#english) | [Polski](#polski)

## English

### Overview

This repository provides a deployment package for a production worker running the `rfmm` application and its own PostgreSQL instance in a Docker Swarm environment managed through Portainer.

The aim is to simplify provisioning: once a worker has joined the Swarm, its application and database can be deployed together from one Git-based stack definition. Both services are assigned to the selected worker, while the database uses persistent local storage.

This repository supplies the deployment definition, PostgreSQL configuration, initial database schema and TypeScript database-integration files. The application itself is delivered as a separate container image.

### Repository contents

| Path | Purpose |
| --- | --- |
| `worker-stack.yml` | Swarm stack defining the application, PostgreSQL, overlay network, persistent volume and placement rules |
| `postgres_config/postgresql.conf` | PostgreSQL server configuration |
| `postgres_config/pg_hba.conf` | PostgreSQL client-access and authentication rules |
| `src/integrations/postgres/migrations.sql` | Initial database schema and indexes |
| `src/integrations/postgres/client.ts` | PostgreSQL connection-pool configuration and connection-check helpers |
| `src/integrations/postgres/types.ts` | TypeScript interfaces for application database records |

The current repository does not contain an `.env.example` file. Supply deployment variables through Portainer.

### What the stack deploys

- **Application:** one `rfmm` service replica, using the image selected by `RFMM_IMAGE`.
- **Database:** one PostgreSQL 15 service replica, with the `medical_app` database.
- **Networking:** a stack-scoped overlay network connecting the application to PostgreSQL.
- **Persistence:** a local `pg_data` volume for PostgreSQL data.
- **Placement:** both services are constrained to the hostname selected by `WORKER_HOSTNAME`.
- **Application access:** container port `3000` is published on host port `8080` in host mode.
- **Database initialization:** configuration files and the initialization SQL are supplied as Docker configs.

The application receives its database connection string through `DATABASE_URL`. The database is addressed as `postgres` inside the stack network.

### Deployment variables

| Variable | Purpose |
| --- | --- |
| `DB_PASSWORD` | Password supplied to PostgreSQL and the application's database connection string |
| `WORKER_HOSTNAME` | Target worker hostname; defaults to `swarm-worker-1` |
| `RFMM_IMAGE` | Application image reference; if omitted, the stack uses its built-in registry reference and image tag |

Set `RFMM_IMAGE` explicitly when deploying to a different environment. The selected node must be able to pull that image, with any required private-registry authentication configured.

The `VITE_POSTGRES_*` settings in `client.ts` belong to the integration code; they are separate from the stack deployment variables listed above.

### Deploy through Portainer

1. **Prepare the worker.** Join the intended node to the Docker Swarm and confirm that it is active. From a manager, inspect the nodes with:

   ```bash
   docker node ls
   ```

   The hostname used in `WORKER_HOSTNAME` must match the target node.

2. **Check deployment prerequisites.** Confirm that the worker can access the application image and that the PostgreSQL access rules in `postgres_config/pg_hba.conf` match the deployment network.

3. **Create a stack in Portainer.** Open **Stacks**, choose **Add stack**, give it a distinct name such as `new-worker-deploy`, and select **Repository** as the deployment source.

4. **Enter the Git repository settings:**

   - Repository URL: `https://github.com/DariuszPiskorowski/provisioning-worker.git`
   - Repository reference: `main`, or the intended deployment branch
   - Compose path: `worker-stack.yml`

   For a private repository, configure Git authentication in Portainer using an account and token with access to that repository. Git authentication is not required to read this public repository.

5. **Set the environment variables.** Provide `DB_PASSWORD`, set `WORKER_HOSTNAME` to the intended node, and select the appropriate `RFMM_IMAGE`.

6. **Deploy the stack.** Portainer retrieves the repository files and submits the application and database services to Swarm, which schedules them according to the placement constraints.

7. **Check the deployment.** Inspect services and task placement from a manager:

   ```bash
   docker service ls
   docker stack services new-worker-deploy
   docker stack ps new-worker-deploy
   ```

   Replace `new-worker-deploy` with the actual stack name. On the target worker, use `docker ps` to inspect its local containers. The application is published on port `8080` of the selected worker.

### Quick deployment checklist

- The target worker has already joined the Swarm and is active.
- The repository contains the intended stack and PostgreSQL configuration.
- The worker can pull the selected application image.
- Portainer uses the Repository deployment source and `worker-stack.yml`.
- `DB_PASSWORD`, `WORKER_HOSTNAME` and the intended application image are configured.
- Both services are scheduled on the intended worker.
- PostgreSQL and the application are running.

### Database initialization and persistence

The stack mounts `src/integrations/postgres/migrations.sql` at `/docker-entrypoint-initdb.d/init.sql`. PostgreSQL executes this initialization script when starting with an empty data directory.

The script creates the application's tables, indexes, UUID extension and initial device-status record. It is an initialization script, not a migration runner that automatically reapplies schema changes to an existing database.

Database data is stored in a local volume on the selected worker. Changing the placement hostname does not transfer that data to another node.

For separate workers with independent databases, deploy separate stack instances with distinct stack names and the appropriate `WORKER_HOSTNAME` values.

### Updates and recovery settings

Update the application by selecting a new `RFMM_IMAGE` tag and redeploying the stack. PostgreSQL image updates are managed separately through its image tag in `worker-stack.yml`.

The application uses a `start-first` update order, while PostgreSQL uses `stop-first`. Both services have restart policies and update-failure rollback settings. PostgreSQL also includes a `pg_isready` health check.

The stack provisions services on an existing Swarm worker; it does not install Docker, join the node to the Swarm or build the application image.

---

## Polski

📦 provisioning-worker
Repozytorium zawiera pliki potrzebne do wdrożenia nowego workera produkcyjnego z własną instancją PostgreSQL oraz kontenerem aplikacji rfmm w środowisku Docker Swarm, zarządzanym przez Portainera.

📂 Zawartość repozytorium
worker-stack.yml – plik definiujący stack (Postgres + aplikacja).

postgresql.conf – konfiguracja PostgreSQL.

pg_hba.conf – ustawienia dostępu do PostgreSQL.

src/integrations/migrations.sql – migracje tworzące strukturę bazy.

.env.example – przykład pliku .env z hasłem do bazy.

🚀 Jak użyć w Portainerze (Git stack)
Przygotuj repozytorium

Upewnij się, że worker-stack.yml oraz pliki konfiguracyjne znajdują się w tym repozytorium.

W .env.example ustaw przykładowe hasło do bazy (DB_PASSWORD).

Dodaj token do prywatnego repo na GitHubie

Wejdź w GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic).

Utwórz nowy token z uprawnieniami repo → skopiuj.

W Portainerze dodasz go w polu Authentication w sekcji Git stack.

Wejdź w Portainera

W menu wybierz Stacks.

Kliknij Add stack.

Nadaj nazwę np. new-worker-deploy.

Wybierz zakładkę Repository.

W polu Repository URL wpisz:

```bash
Copy
Edit
https://github.com/DariuszPiskorowski/provisioning-worker.git
```
W polu Repository reference wpisz main (lub inną gałąź).

W polu Compose path wpisz:

```cpp
Copy
Edit
worker-stack.yml
```
W sekcji Authentication wprowadź swój GitHub username i token.

Dodaj zmienną środowiskową

W sekcji Environment variables kliknij Add environment variable.

Nazwa: DB_PASSWORD
Wartość: secure_password_2024
(Nie wpisujemy hasła w yml, Portainer wstrzyknie je automatycznie)

Upewnij się, że worker jest w Swarmie

Na menedżerze:

```bash
Copy
Edit
docker node ls
```
Worker musi być widoczny i aktywny.

Deploy stacka

Kliknij Deploy the stack w Portainerze.

Portainer pobierze pliki z GitHuba, utworzy kontenery i połączy je w sieci.

📋 Checklista szybkiego wdrożenia nowego workera
1. Worker podłączony do Swarma (docker swarm join ...).

2. Repozytorium provisioning-worker aktualne na GitHubie.

3. W Portainerze → Stacks → Add stack.

4. Wybór trybu Repository z adresem repo.

5. Dodanie zmiennej DB_PASSWORD.

6. Deploy stacka.

7. Sprawdzenie statusu:

```bash
Copy
Edit
docker service ls
docker ps
```

📌 Ważne
Migracje bazy są ładowane automatycznie przy pierwszym starcie kontenera PostgreSQL z pliku migrations.sql.

Każdy worker ma własną instancję Postgresa i działa niezależnie.

Aktualizacja aplikacji rfmm odbywa się osobno przez zmianę tagu obrazu w worker-stack.yml lub w głównym stacku produkcyjnym.

Postgresa możesz aktualizować ręcznie przez zmianę tagu obrazu postgres: w tym samym stacku.