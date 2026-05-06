-- Appwrite timestamp restore script
-- Run this inside Appwrite's MariaDB container AFTER migration:
--   docker exec -i <mariadb-container> mysql -u appwrite -p appwrite < restore_timestamps.sql
-- Destination DB ID: 69f833ca001139dc8572

SET time_zone = '+00:00';
