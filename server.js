const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Handling uncaught exception something like undefined variable
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION ! 😑 Shutting down....');
  process.exit(1);
});

dotenv.config({ path: './config.env' }); //Order matters here

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
  //to connect locally replace DB with process.env.DATABASE_LOCAL
  console.log('DB connection Successful');
});

//console.log(app.get('env')); //returns the environemnt variable call env
//console.log(process.env); //returns all of the environemnt variables that nodejs needs and have for this project
/*"start": "SET NODE_ENV=development & SET X=21 & nodemon server.js",*/ // Put it inside package.json inside script

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}....`);
});

// Handling unhandled rejection something like wrong db password
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION ! 😑 Shutting down....');
  server.close(() => {
    process.exit(1);
  });
});

//This one is special for heruko which sends every 24hrs a sigterm signal to ask the app to shut down and then restart
process.on('SIGTERM', () => {
  console.log('🥱 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('🤡 Process terminated!');
  });
});
