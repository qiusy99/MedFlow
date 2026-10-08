# MedFlow

MedFlow is a full-stack clinical equipment command center for managing hospitals, medical equipment, technicians, work orders, and service reports.

## Tech Stack

- Backend: FastAPI, SQLAlchemy, PostgreSQL
- Frontend: React, Material UI
- Cloud: AWS Lambda, RDS, S3, CloudFront

## Setup

The setup script checks the required prerequisites, creates the Python virtual environment if it does not already exist, and installs the backend and frontend dependencies.

### Prerequisites

Make sure the following are installed:

- Python
- Node.js
- npm
- Git Bash on Windows

### Environment Variables

Create `backend/.env` and configure the required environment variables.

Required variables include:

```text
DATABASE_URL=
SECRET_KEY=
```

Additional environment variables may be required depending on the application's AWS and frontend configuration.

Do not commit `.env` or other files containing credentials to version control.

### Run Setup

From the project root:

```bash
bash bin/setup.sh
```

The setup script can be run multiple times safely. It preserves an existing virtual environment and does not overwrite `backend/.env`.

The script can also be run from another working directory by providing its path.

## Database Seeding

The seed script creates the database tables when necessary and loads deterministic sample data for MedFlow.

The seed data includes examples for the application's business scenarios, including low-charge equipment, equipment under maintenance, work order statuses, priorities, and equipment/technician location discrepancies.

### Seed the Database

```bash
bash bin/seed.sh
```

The command is idempotent and can be run multiple times without creating duplicate seed records.

### Reset and Reload Seed Data

To clear the existing MedFlow business data and reload the seed data:

```bash
bash bin/seed.sh --reset
```

The script asks for confirmation before clearing the data.

To skip the confirmation prompt:

```bash
bash bin/seed.sh --reset --yes
```

Use `--yes` only when an automatic reset is intended.

## Script Behavior

Both `bin/setup.sh` and `bin/seed.sh`:

- use strict Bash error handling with `set -euo pipefail`
- resolve project paths relative to the script location
- can be run from different working directories
- stop when a required step fails
- do not contain database passwords or connection strings

The seed script also checks database connectivity before creating tables or loading data. If the database is unavailable or `DATABASE_URL` is not configured, the script exits with an error instead of partially seeding the database.