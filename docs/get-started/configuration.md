---
title: Configuration
---
# Configuration

Epochtalk forum configurations can be set either manually or using the admin panel.

### Manual Configuration
The forum server configs can and must be set manually with a `.env` file in the root directory of the project.
```sh
DATABASE_URL="postgres://localhost/epochtalk_dev"
HOST="localhost"
PORT="8080"
PUBLIC_URL="http://localhost:8080"
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_AUTH_PASS=""
```
### Admin Panel Configuration
Some configurations can also be set using the settings tab in the administration panel.
![Admin Settings](http://i.imgur.com/DNygrYN.png)

### Saas mode
This can be set in the .env file by setting the var SAAS_MODE to true. What this basically does is the emailer and images config are hidden in the admin/settings/general view. These configs can only be edited through the .env file or directly in the database only and requires a restart for the changes to take effect.
