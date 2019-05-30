'use strict';
var app = require("express")();
var config = require('config');
var logHelper = require('./utils/logging.js');
var fs = require('fs'),
    path = require('path'),
    http = require('http');
var auth = require("./api/helpers/auth");
var userController = require("./controllers/userController");
//var app = require('connect')();
const swaggerUi = require('swagger-ui-express');

var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var serverPort = process.env.PORT || 3000;

// swaggerRouter configuration
var options = {
  swaggerUi: path.join(__dirname, '/swagger.json'),
  controllers: path.join(__dirname, './controllers'),
  enableCORS: true,
  useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

var optionsCss = {
  customCss: '.opblock-options { display: none }'
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
if(process.argv.length < 3) {
    console.log('Usage: node ' + process.argv[1] + ' HOSTNAME');
    console.log('Usage: Please provide host name dev/prod ' + process.argv[1] + ' HOSTNAME');
    process.exit(1);
}
const hostName = process.argv[2] === 'dev' ? 'localhost': process.argv[2]; //'18.191.162.21' 'ec2-18-191-162-21.us-east-2.compute.amazonaws.com';
//const hostName ='localhost';
console.log('hostName__________________',hostName);

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
try {
  var spec = fs.readFileSync(path.join(__dirname,'api/swagger.yaml'), 'utf8');
  const hostDetail = `${hostName}:${serverPort}`;
  spec = spec.replace('@@host-details@@', hostDetail);
  var swaggerDoc = jsyaml.safeLoad(spec);
} catch(error) {
  console.log('YAML file load error  ',error);
}  

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, api_key, Authorization, Origin, X-Requested-With, Accept, token");
    //req.accepts("*/*");
    next();
  });
  app.use(middleware.swaggerRouter({ignoreMissingHandlers: true}));
  app.use(middleware.swaggerMetadata());

  app.use(
    middleware.swaggerSecurity({
      
      //manage token function in the 'auth' module
      Bearer: userController.validateTokenInternally
    })
  );

  // Validate Swagger requests
  app.use(middleware.swaggerValidator());

  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, optionsCss));

  // Serve the Swagger documents and Swagger UI
  // app.use(middleware.swaggerUi());

  // Start the server
  http.createServer(app).listen(serverPort, function () {
    var logger = logHelper.initialize(config.processname, config.env, config.log4js, config.logLevel);
    logger.info('Your server is listening on port (http://%s:%d)', hostName, serverPort);
    logger.info('Swagger-ui is available on http://%s:%d/docs', hostName, serverPort);
  });

});
