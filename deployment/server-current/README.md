# Active tetrixfilm.ru deployment snapshot

This directory is a byte-for-byte snapshot of the static assets currently served by `/var/www/tetrixfilm.ru/current` on the production server.

The server does not retain the React/Vite source tree; it retains only the compiled deployment. This snapshot is therefore a deployment backup, not a replacement for the source tree in `src/`.

User/runtime data such as `/opt/tetrixfilm/data/watch-rooms.json` is intentionally excluded from Git.
