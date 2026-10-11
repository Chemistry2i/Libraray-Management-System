# Railway MySQL schema

`railway_schema.sql` creates the consolidated schema for a **new, empty MySQL 8 database**. It includes the core LMS tables, approval workflow, notifications, fines, waitlists, book views, Cloudinary metadata, digital collections and rights/usage tracking, plus the borrowing statistics views.

## Run on Railway

1. Create or select the Railway MySQL database and copy its connection host, port, database name, and username from the Railway Variables panel.
2. From the repository root, run:

```sh
mysql -h YOUR_HOST -P YOUR_PORT -u YOUR_USERNAME -p YOUR_DATABASE < backend/tables/railway_schema.sql
```

The command prompts for the database password. Do not put database credentials in this file or commit them.

The SQL uses `CREATE TABLE IF NOT EXISTS`, but it is intended for a fresh database. It does not migrate an existing LMS schema or reconcile existing tables with different columns. For an existing installation, take a backup and apply only the applicable incremental scripts from `backend/database/` in their documented order. Do not run both the consolidated fresh-install schema and the incremental migrations against the same new database.

This script was assembled from the checked-in base schema, feature migrations, and runtime SQL initialization. It has not been executed against your Railway instance; verify the Railway database backup and connection target before running it.
