## React Application with reCAPTCHA
### An project deploy React Application with reCAPTCHA Policy Based Challenge installed

Project structure:

```
├── compose.yaml
├── Dockerfile
├── .dockerignore
├── .nginx
│   └── nginx.conf
├── package.json
├── public
│   ├── ...
│   └── robots.txt
├── README.md
├── src
│   ├── ...
│   └── App.tsx
│   └── index.js
└── yarn.lock

```

[_compose.yaml_](compose.yaml)

```
services:
  frontend:
    build:
      context: .
    container_name: frontend
    ports:
      - "80:80"
```

The compose file defines an application with an services `frontend`.
When deploying the application, docker compose maps port 80 of the frontend service container to port 80 of the host as specified in the file.  

## Deploy with docker

```
sudo docker build -t react-recaptcha . && docker run -p 8080:80 react-recaptcha
```
