{
  "project": {
    "name": "TecnoMundo Repair Management",
    "type": "fullstack",
    "frontend": {
      "framework": "react-vite",
      "srcDir": "frontend/src"
    },
    "backend": {
      "framework": "fastapi",
      "srcDir": "backend/app"
    },
    "database": {
      "modelsDir": "backend/app/models",
      "migrationsDir": "backend/scripts"
    }
  },
  "security": {
    "jwtExpiration": "24h",
    "passwordPolicy": {
      "minLength": 8,
      "uppercase": true,
      "lowercase": true,
      "numbers": true
    },
    "corsPolicy": {
      "production": "restrictive",
      "dev": "relaxed"
    },
    "rateLimiting": {
      "enabled": true,
      "requestsPerMinute": 120
    }
  },
  "environments": {
    "dev": "config/dev.json",
    "test": "config/test.json",
    "prod": "config/prod.json"
  }
}