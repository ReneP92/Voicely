# Voicely

Voicely is SaaS platform for Customer Service, Marketing and Sales departments to streamline and simlify workflows. Its survey capabilities let teams allow to create meaningful and insightful surveys that deliver responses that are actionable. Offering an integration to common CRM tools such as Salesforce, Hubspot, Mailchimp, ..etc. customer data is acccisible and forms the basis to send out surveys. Utilizing AI, a knowledge base is set up to help with customer specific information. 

## Architecture
The current architecture follows a monolithic codebase. A monolithic architecture is a software design model where all components of an application are unified into a single, self-contained unit. In this approach, the entire application is built, deployed, and managed as a single entity, often referred to as a monolith. This allows for early stage simlicity and fast iteration.

![Architecture](./docs/Architecture.svg)


### System design
TBD


## Folder Structure
The project has the following structure:
```
.githooks/
    commit-msg
.gitignore
.vscode/
    settings.json
docs/
    ...
deploy/
    .gitkeep
docker-compose.yml
README.md
voicely/
    integrations/
        hubspot/
        salesforce/
    voicely/
        app/
            db/
                __schema/
                    schema.sql
                __test_data/
                    data.sql
                my.cnf
            services/
                knowledge_base_service/
                surveys_service/
                users_service/
                    .env
                    coverage/
                        ...
                    Dockerfile
                    main.js
                    package.json
                    scripts/
                    tests/
                        __mocks__
                    main.js
                    users.js
                    utils/
                        db/
        website/
            public/
            src/
.env.local
.eslintrc.js
```

## Getting Started
This section describes steps to get started with the development lifecycle by setting up a local environment following best practises such as the utlization of docker and test coverage.

### Installation
To get started with the project, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/yourusername/voicely.git
cd voicely
```

2. Install dependencies:
```bash
cd voicely/voicely/app/services/xxxxxx_service
yarn install
```

3. Set up the environment variables:
```bash
cp .env.local .env
```

4. Start the services using Docker Compose from root directory:
```bash
docker-compose up --build
```

### Usage
To run the user service locally, use the following command:
```bash
yarn run dev
```

To run tests:
```bash
yarn test
```


## Users Service
The users service is a REST API that manages the handling and common operations for user data.

### Endpoints
The user service provides the following endpoints acessible through `api-docs/`:
![Users API](./docs/users_api.png) 

## Organisations Service
The organisations service is a REST API that manages the handling and common operations for organisations data.

### Endpoints
The organisation service provides the following endpoints acessible through `api-docs/`:
![Organisations API](./docs/organisations_api.png)


## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
This project is licensed under the MIT License.