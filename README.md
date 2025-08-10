provisioning-worker
Automatyczny provisioning nowego workera w Docker Swarm: uruchomienie aplikacji RFMM + PostgreSQL z jednorazową inicjalizacją bazy (migracje).

Struktura repo
pgsql
Copy
Edit
provisioning-worker/
├─ worker-stack.yml
├─ postgres_config/
│  ├─ postgresql.conf
│  └─ pg_hba.conf
└─ src/
   └─ integrations/
      └─ migrations.sql
worker-stack.yml – definicja stacka (Swarm) z usługami rfmm i postgres.

postgres_config/*.conf – konfiguracja Postgresa.

src/integrations/migrations.sql – jednorazowe migracje (wykonywane przy pustym volume).

Wymagania wstępne
Swarm z co najmniej jednym managerem i dołączonym workerem.

Portainer połączony z klastrem (opcjonalnie możesz robić deploy przez CLI).

Prywatny rejestr Dockera dostępny z workerów (np. 100.119.56.20:5000) oraz docker login skonfigurowany na workerach/środowisku Portainera.

Worker ma hostname zgodny z tym, który ustawisz w zmiennej WORKER_HOSTNAME.

Zmienne
W worker-stack.yml używamy zmiennych:

RFMM_IMAGE – obraz apki, np.
100.119.56.20:5000/rfmm:prod-2025-08-07-02-33

WORKER_HOSTNAME – nazwa node’a, np. swarm-worker-1

DB_PASSWORD – hasło użytkownika postgres dla lokalnej bazy.

Możesz:

zdefiniować je w Portainer → Stacks → Environment variables,

albo dodać plik .env w repo (nie zalecamy trzymania haseł w repo; lepiej ustawić je w Portainerze).

Przykładowy .env.example:

ini
Copy
Edit
RFMM_IMAGE=100.119.56.20:5000/rfmm:prod-2025-08-07-02-33
WORKER_HOSTNAME=swarm-worker-1
DB_PASSWORD=secure_password_2024
Deploy przez Portainera (Git stack)
Stacks → Add stack → Repository

Repository URL: https://github.com/<org>/<repo>.git

Reference: main

Compose path: worker-stack.yml

Environment variables: ustaw RFMM_IMAGE, WORKER_HOSTNAME, DB_PASSWORD

(Opcj.) Auto update: Polling lub Webhook

Wybierz Swarm, kliknij Deploy the stack.

Portainer:

sklonuje repo,

utworzy Swarm Configs z plików konfiguracyjnych/migracji,

wystartuje postgres (z pustym volumem) → wykona migrations.sql raz,

wystartuje rfmm.

Deploy przez CLI (alternatywa)
Na managerze (repo sklonowane lokalnie):

bash
Copy
Edit
export RFMM_IMAGE=100.119.56.20:5000/rfmm:prod-2025-08-07-02-33
export WORKER_HOSTNAME=swarm-worker-1
export DB_PASSWORD=secure_password_2024

docker stack deploy -c worker-stack.yml new-worker-deploy
Dostęp do aplikacji
http://<tailscale-ip-workera>:8080 (mapowanie 8080:3000)

Typowe operacje
Nowy worker:

Dołącz worker do Swarma (docker swarm join ...)

Ustaw WORKER_HOSTNAME na jego hostname

Deploy przez Portainer/CLI (jak wyżej)

Update apki:

Zmień tag w RFMM_IMAGE (np. nowa wersja po CI)

Redeploy stack (Portainer/CLI)

Update Postgresa:

Zmień image: postgres:15 → :16

Redeploy (dane zostają w pg_data)

Ponowne uruchomienie migracji (tylko do testów!):

Usuń volume pg_data tego stacka → pierwsze podniesienie wykona migrations.sql ponownie

Troubleshooting
Apka nie łączy się z DB: sprawdź DATABASE_URL (host musi być postgres — nazwa serwisu).

Migracje się nie wykonały: volume nie był pusty; usuń volume i podnieś serwis bazy ponownie.

Brak plików configów: upewnij się, że configs.file wskazuje na istniejące ścieżki w repo.

Stack nie startuje na właściwym hoście: sprawdź node.hostname i realny hostname noda (docker node ls).

