# Projeto Amazon Scraper

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Docker
- Docker Compose

### Executar com Docker Compose
```bash
# rodar o docker-compose
docker-compose up --build
# parar o docker-compose
docker-compose down
# ou tudo em uma linha 
docker-compose down -v && docker-compose build --no-cache && docker-compose up
```

Isso irá inicializar:
- **Backend** na porta 3333
- **Frontend** na porta 3000

### Acessar a aplicação
- Frontend: seu IP ou localhost (4173)
- Backend API: http://localhost:3333

## 📁 Estrutura
```
traine-full/
├── backend-app/
    ├── arquivos & folders do backend...
├── frontend/
    ├── frontend-app/
        ├── arquivos & folders do frontend...
├── docker-compose.yml
└── README.md
```

**Autor:** Deyvis

