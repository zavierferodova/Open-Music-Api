## Setup

1. Install all required depedencies on terminal using npm
```bash
npm install
```
2. Rename **.template.env** file to **.env**
3. Open **.env** and fill PostgreSQL configuration
```env
# Make sure the PGDATABASE is same with database used on core REST API application.

PGUSER=<your_db_username>
PGHOST=localhost
PGPASSWORD=<your_db_password>
PGDATABASE=<core_app_db>
PGPORT=5432
```
4. Then configure the SMTP, on this configuration I use Mail Trap service
```env
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_ADDRESS=<your_mail_address>
MAIL_PASSWORD=<your_mail_password>
```

## Usage
- For Development run this command on terminal to start development server ```npm run start-dev```
- For Production purpose run this command on terminal to start production server ```npm start```

## Testing
To test the export playlist feature on this consumer app you can make POST request on core REST API with route path ```/export/playlists/{id}``` and don't forget to send your user JWT auth token to.