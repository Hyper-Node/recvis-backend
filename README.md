# hyplag-recvis-backend

## About RecVis
- RecVis project provides a novel approach to discover scientific literature based on Hyplag.org open source project. Users are able to discover relevant papers based on only given input academic paper. RecVis will recommend similar literature and will provide a visualization with custimizable weights for filtering out most relavent papers.

## Screenshots from RecVis
- The user interface is developed using standard web development technologies such as HTMl, Javascript, CSS and Bootstrap. Following is the welcome page of RecVis.

![alt text](https://github.com/ag-gipp/hyplag-recvis-frontend/blob/master/images/recvis-welcome-page.png?raw=true)

- User dashboard.

![alt text](https://github.com/ag-gipp/hyplag-recvis-frontend/blob/master/images/recvis-folders.png?raw=true)

- Visualization of recommended literature. Visualization of the data is created using D3.js.

![alt text](https://github.com/ag-gipp/hyplag-recvis-frontend/blob/master/images/recvis-overview.png?raw=true)

## Deployment/Development of RecVis Backend
### Configuration of backend
- cd /path/to/repo
- cd src
- cp config/config-env-template.txt ./.env
- nano .env
    - set PORT
    - set your Hyplag instance URL (or keep as is if you have account on backend.hyplag.org)
    - set your hyplag username & password.
    - set your MONGO_DB_URL. We suggest using mlab.com as a free mongoDB as a service for development purposes.
    - set VALID_CORS_URL that is, where your HTTP requests will initate from (e.g. that is especially required if you serve your front-end at different sub-domain than your backend.)
    - set name of your JWT.key file and make sure it is present in "secret" folder. [This link](https://gist.github.com/ygotthilf/baa58da5c3dd1f69fae9) shows how to generate JWT key pair.
    - for development purposes you can accept HTTP request from any domain by keeping IS_ANY_CORS_ACCEPTED set to true.
    - IS_HYPLAG_BACKEND_MOCKED currently not functional.
    - set TINY_SCHOLAR_API_IP and TINY_SCHOLAR_API_PORT accordingly. You need to be running this service in order to be able to fetch year & venue data of recommeded articles. See the Tiny Scholar API repo from related links.

### Installing necessary libraries
- npm install

### Running backend
- node app.js

## Related Links
- RecVis Front-end Repository: https://github.com/ag-gipp/hyplag-recvis-frontend
- RecVis Tiny Scholar API (Currently Required by RecVis Backend): https://github.com/ag-gipp/hyplag-recvis-tiny-scholar-api

## Credits
- This project is developed by [Data & Knowledge Engineering Group](https://dke.uni-wuppertal.de/de.html "Data & Knowledge Engineering Group Web Page")