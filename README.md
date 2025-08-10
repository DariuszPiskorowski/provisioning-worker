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

bash
Copy
Edit
https://github.com/DariuszPiskorowski/provisioning-worker.git
W polu Repository reference wpisz main (lub inną gałąź).

W polu Compose path wpisz:

cpp
Copy
Edit
worker-stack.yml
W sekcji Authentication wprowadź swój GitHub username i token.

Dodaj zmienną środowiskową

W sekcji Environment variables kliknij Add environment variable.

Nazwa: DB_PASSWORD
Wartość: secure_password_2024
(Nie wpisujemy hasła w yml, Portainer wstrzyknie je automatycznie)

Upewnij się, że worker jest w Swarmie

Na menedżerze:

bash
Copy
Edit
docker node ls
Worker musi być widoczny i aktywny.

Deploy stacka

Kliknij Deploy the stack w Portainerze.

Portainer pobierze pliki z GitHuba, utworzy kontenery i połączy je w sieci.

📋 Checklista szybkiego wdrożenia nowego workera
Worker podłączony do Swarma (docker swarm join ...).

Repozytorium provisioning-worker aktualne na GitHubie.

W Portainerze → Stacks → Add stack.

Wybór trybu Repository z adresem repo.

Dodanie zmiennej DB_PASSWORD.

Deploy stacka.

Sprawdzenie statusu:

bash
Copy
Edit
docker service ls
docker ps
📌 Ważne
Migracje bazy są ładowane automatycznie przy pierwszym starcie kontenera PostgreSQL z pliku migrations.sql.

Każdy worker ma własną instancję Postgresa i działa niezależnie.

Aktualizacja aplikacji rfmm odbywa się osobno przez zmianę tagu obrazu w worker-stack.yml lub w głównym stacku produkcyjnym.

Postgresa możesz aktualizować ręcznie przez zmianę tagu obrazu postgres: w tym samym stacku.