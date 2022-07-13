## Setup
1. Create PostgreSQL database
```sql
CREATE DATABASE openmusic;
``` 
2. Rename file **.template.env** to **.env**
3. Rename file **.template.prod.env** to **.prod.env**
4. Fill PostgreSQL configuration on **.env**
```env
PGUSER=<your_db_username>
PGHOST=localhost
PGPASSWORD=<your_db_password>
PGDATABASE=openmusic
PGPORT=5432
```
5. Fill Authentication configuration on **.env**
```js
// Generate Token with Node REPL
require('crypto').randomBytes(64).toString('hex');
```
```env
ACCESS_TOKEN_KEY=<token>
REFRESH_TOKEN_KEY=<token>
ACCESS_TOKEN_AGE=3600
```
6. Install all depedencies on terminal using npm
```bash
npm install
```
7. Run migration coomand on terminal using npm
```bash
npm run migrate up
```

## Testing
Open the **postman_testing** folder then import collection and environment to Postman.

## Usage
- For Development run this command on terminal to start development server ```npm run start-dev```
- For Production purpose run this command on terminal to start production server ```npm start```