const express = require('express');
const https = require('https');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const oracledb = require('oracledb');
try {
  oracledb.initOracleClient({libDir: 'C:/instantclient_21_7'});
} catch (err) {
  console.error('Whoops!');
  console.error(err);
  process.exit(1);
}

app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({
  limit: '100mb',
  parameterLimit: 100000,
  extended: true 
}));

// oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [ oracledb.CLOB ];

const config1 = {
  user: 'CDC_MARS',
  password: 'cdcmars$1',
  connectString: `(DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(Host =10.1.1.59)(Port = 1521))
    (CONNECT_DATA =
      (SID = MDM)
    )
  )`
}

const config2 = {
  user: 'user_mgmt',
  password: 'user_mgmt',
  connectString: `(DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = 10.251.2.77)(PORT = 1521))
    (CONNECT_DATA =
      (SERVICE_NAME = ORCL2)
    )
  )`
}

const error_type = {
  12170 : 'TNS Connection Timeout Occured',
  900   : 'SQL Error',
  942   : 'Table or View Doesnt Exists',
  1722  : 'Invalid Number',
}

app.use(
  cors({
    // origin: 'http://127.0.0.1/cors.html'
    origin: '*'
  })
);


// login
  app.post( 
    '/apis/login',
    body('username').not().isEmpty().trim().escape(),
    body('password').not().isEmpty().trim().escape(),
    async function(req, res){

    let USERNAME = req.body.username,
        PASSWORD = req.body.password;

    try {
        conn = await oracledb.getConnection(config1)
        // console.log(conn, 'cn');
        let query = `BEGIN PROC_USER_LOGIN(:P_USER_ID,:P_PASSWORD,:P_MESSAGE,:P_CODE,:P_USER_INFO,:P_USER_CUSTOMER,:P_PROVINCE,:P_CITY); END;`;
        const result = await conn.execute(
          query,
          {
            P_USER_ID: { type: oracledb.STRING, dir: oracledb.BIND_IN, val:USERNAME},
            P_PASSWORD: { type: oracledb.STRING, dir: oracledb.BIND_IN, val:PASSWORD},
            P_MESSAGE: { type: oracledb.STRING, dir: oracledb.BIND_OUT},
            P_CODE: { type: oracledb.STRING, dir: oracledb.BIND_OUT},
            P_USER_INFO: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT},
            P_USER_CUSTOMER: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT},
            P_PROVINCE: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT},
            P_CITY: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT}
          },
          {outFormat: oracledb.OUT_FORMAT_OBJECT});
          
        let row;
        let customer = [], province = [], city=[];
        while ((row = await result.outBinds.P_USER_CUSTOMER.getRow())) {
        customer.push(row);
        }
        while ((row = await result.outBinds.P_PROVINCE.getRow())) {
          province.push(row);
        }
        while ((row = await result.outBinds.P_CITY.getRow())) {
          city.push(row);
        }

        res.json({
          code: 200,
          data: {
            userInfo: await result.outBinds.P_USER_INFO.getRow(),
            customer: customer,
            province: province,
            city:city
           },
          status: true ? 'Success' : 'Error'
        })

      } catch (err) {
        res.json({
          code: 400,
          data: error_type[err.errorNum],
          status: 'Failed'
        })

        console.log(err);

      } finally {
        if (conn) { // conn assignment worked, need to close
          await conn.close()
        }
      }
  });
// login

// get single customer images
  app.post(
    '/apis/getCustomerImages',
    body('P_CUST_ID').not().isEmpty().trim().escape(),
    async function(req, res){

    let CUST_ID = req.body.P_CUST_ID;
      console.log(CUST_ID)
    try {
        conn = await oracledb.getConnection(config1)

        // let query = `BEGIN TEST1(:cursor); END;`;
        let query = `BEGIN PFOC_CUSTOMER_IMAGES(:P_CUSTOMER_ID , :P_MESSAGE , :P_CODE , :P_CUSTOMER_IMAGES ); END;`;

        const result = await conn.execute(
          query,
          {
            P_CUSTOMER_ID: { type: oracledb.STRING, dir: oracledb.BIND_IN, val:CUST_ID},
            P_MESSAGE : { type: oracledb.STRING, dir: oracledb.BIND_OUT},
            P_CODE : { type: oracledb.STRING, dir: oracledb.BIND_OUT},
            P_CUSTOMER_IMAGES: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT},
          },
          {outFormat: oracledb.OUT_FORMAT_OBJECT});

        // console.dir(result.outBinds.cursor, {depth: null});

        const resultSet = result.outBinds.P_CUSTOMER_IMAGES;
        let row;
        let images = [];
        while ((row = await resultSet.getRow())) {
          images.push(row);
        }

        res.json({
          code: result.outBinds.P_CODE,
          data:images,
          status: true ? 'Success' : 'Error'
        })

      } catch (err) {
        res.json({
          code: 400,
          data: error_type[err.errorNum],
          status: 'Failed'
        })

        console.log(err);

      } finally {
        /*if (conn) {
          await conn.close()
        }*/
      }
  });
// get single customer images

// insert vat
  app.post(
    '/apis/updateVat',
    async function(req, res){

    let P_USER_ID = req.body.P_USER_ID,
        P_CDC_CUS_ID = req.body.P_CDC_CUS_ID,
        P_CUST_NUMBER = req.body.P_CDC_CUS_ID,
        P_CUST_NAME_AR = req.body.P_CUST_NAME_AR
        P_VAT_NUM = req.body.P_VAT_NUM
        P_MAIN_CR_NUM = req.body.P_MAIN_CR_NUM
        P_NA_STREET_NAME = req.body.P_NA_STREET_NAME
        P_NA_BUILDING_NUMBER = req.body.P_NA_BUILDING_NUMBER
        P_NA_ADDITIONAL_NUMBER = req.body.P_NA_ADDITIONAL_NUMBER
        P_NA_UNIT_NUMBER = req.body.P_NA_UNIT_NUMBER
        P_NA_CITY = req.body.P_NA_CITY
        P_NA_POSTAL_CODE = req.body.P_NA_POSTAL_CODE
        P_NA_DISTRICT = req.body.P_NA_DISTRICT
        P_NA_PROVINCE = req.body.P_NA_PROVINCE
        P_REMARKS = req.body.P_REMARKS
        P_VAT_CERTIFICATE = req.body.P_VAT_CERTIFICATE
        P_CR_CERTIFICATE = req.body.P_CR_CERTIFICATE
        P_NA_CERTIFICATE = req.body.P_NA_CERTIFICATE


    try {
        conn = await oracledb.getConnection(config1)

        let query = `BEGIN PFOC_SALES_SUBMITT(
          :P_USER_ID,
          :P_CDC_CUS_ID,
          :P_CUST_NUMBER,
          :P_CUST_NAME_AR,
          :P_VAT_NUM,
          :P_MAIN_CR_NUM,
          :P_NA_STREET_NAME,
          :P_NA_BUILDING_NUMBER,
          :P_NA_ADDITIONAL_NUMBER,
          :P_NA_UNIT_NUMBER,
          :P_NA_CITY,
          :P_NA_POSTAL_CODE,
          :P_NA_DISTRICT,
          :P_NA_PROVINCE,
          :P_REMARKS,
          :P_VAT_CERTIFICATE,
          :P_CR_CERTIFICATE,
          :P_NA_CERTIFICATE,
          :P_MESSAGE,
          :P_CODE
          );

          END;`;

        const result = await conn.execute(
          query,
          {
          P_USER_ID: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_USER_ID},
          P_CDC_CUS_ID: { type: oracledb.STRING, dir: oracledb.BIND_IN , val:P_CDC_CUS_ID},
          P_CUST_NUMBER: { type: oracledb.STRING, dir: oracledb.BIND_IN , val:P_CUST_NUMBER},
          P_CUST_NAME_AR: { type: oracledb.STRING, dir: oracledb.BIND_IN , val:P_CUST_NAME_AR},
          P_VAT_NUM: { type: oracledb.STRING, dir: oracledb.BIND_IN , val:P_VAT_NUM},
          P_MAIN_CR_NUM: { type: oracledb.STRING, dir: oracledb.BIND_IN , val:P_MAIN_CR_NUM},
          P_NA_STREET_NAME: { type: oracledb.STRING, dir: oracledb.BIND_IN , val:P_NA_STREET_NAME},
          P_NA_BUILDING_NUMBER: { type: oracledb.STRING, dir: oracledb.BIND_IN , val:P_NA_BUILDING_NUMBER},
          P_NA_ADDITIONAL_NUMBER: { type: oracledb.STRING, dir: oracledb.BIND_IN , val:P_NA_ADDITIONAL_NUMBER},
          P_NA_UNIT_NUMBER: { type: oracledb.STRING, dir: oracledb.BIND_IN , val:P_NA_UNIT_NUMBER},
          P_NA_CITY: { type: oracledb.STRING, dir: oracledb.BIND_IN , val:P_NA_CITY},
          P_NA_POSTAL_CODE: { type: oracledb.STRING, dir: oracledb.BIND_IN , val:P_NA_POSTAL_CODE},
          P_NA_DISTRICT: { type: oracledb.STRING, dir: oracledb.BIND_IN , val:P_NA_DISTRICT},
          P_NA_PROVINCE: { type: oracledb.STRING, dir: oracledb.BIND_IN , val:P_NA_PROVINCE},
          P_REMARKS: { type: oracledb.STRING, dir: oracledb.BIND_IN , val:P_REMARKS},
          P_VAT_CERTIFICATE: { type: oracledb.STRING, dir: oracledb.BIND_IN , val:P_VAT_CERTIFICATE},
          P_CR_CERTIFICATE: { type: oracledb.STRING, dir: oracledb.BIND_IN , val:P_CR_CERTIFICATE},
          P_NA_CERTIFICATE: { type: oracledb.STRING, dir: oracledb.BIND_IN , val:P_NA_CERTIFICATE},
          P_MESSAGE: { dir: oracledb.BIND_OUT, type: oracledb.STRING } ,
          P_CODE: { dir: oracledb.BIND_OUT, type: oracledb.STRING } , 
          },
          {outFormat: oracledb.OUT_FORMAT_OBJECT});

        console.log(result);

        res.json({
          code: 200,
          data: result.outBinds.P_MESSAGE,
          status: true ? 'Success' : 'Error'
        })

      } catch (err) {
        res.json({
          code: 400,
          data: error_type[err.errorNum],
          status: 'Failed'
        })

        console.log(err);

      } finally {
        /*if (conn) {
          await conn.close()
        }*/
      }
  });
// insert vat

// approve vat
app.post(
  '/apis/approveVat',
  async function(req, res){

  let P_USER_ID = req.body.P_USER_ID,
      P_CDC_CUS_ID = req.body.P_CDC_CUS_ID,
      P_CUST_NUMBER = req.body.P_CUST_NUMBER,
      P_CUST_NAME_AR = req.body.P_CUST_NAME_AR,
      P_VAT_NUM = req.body.P_VAT_NUM,
      P_MAIN_CR_NUM = req.body.P_MAIN_CR_NUM,
      P_NA_STREET_NAME = req.body.P_NA_STREET_NAME,
      P_NA_BUILDING_NUMBER = req.body.P_NA_BUILDING_NUMBER,
      P_NA_ADDITIONAL_NUMBER = req.body.P_NA_ADDITIONAL_NUMBER,
      P_NA_UNIT_NUMBER = req.body.P_NA_UNIT_NUMBER,
      P_NA_CITY = req.body.P_NA_CITY,
      P_NA_POSTAL_CODE = req.body.P_NA_POSTAL_CODE,
      P_NA_DISTRICT = req.body.P_NA_DISTRICT,
      P_NA_PROVINCE = req.body.P_NA_PROVINCE,
      P_REMARKS = req.body.P_REMARKS;

  try {
      conn = await oracledb.getConnection(config1)

      let query = `BEGIN PFOC_SUPERVISOR_APPROVED(
        :P_USER_ID,
        :P_CDC_CUS_ID,
        :P_CUST_NUMBER,
        :P_CUST_NAME_AR,
        :P_VAT_NUM,
        :P_MAIN_CR_NUM,
        :P_NA_STREET_NAME,
        :P_NA_BUILDING_NUMBER,
        :P_NA_ADDITIONAL_NUMBER,
        :P_NA_UNIT_NUMBER,
        :P_NA_CITY,
        :P_NA_POSTAL_CODE,
        :P_NA_DISTRICT,
        :P_NA_PROVINCE,
        :P_REMARKS,
        :P_MESSAGE,
        :P_CODE);

        END;`;

      const result = await conn.execute(
        query,
        {
        P_USER_ID: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_USER_ID},
        P_CDC_CUS_ID: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_CDC_CUS_ID},
        P_CUST_NUMBER: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_CUST_NUMBER},
        P_CUST_NAME_AR: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_CUST_NAME_AR},
        P_VAT_NUM: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_VAT_NUM},
        P_MAIN_CR_NUM: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_MAIN_CR_NUM},
        P_NA_STREET_NAME: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_NA_STREET_NAME},
        P_NA_BUILDING_NUMBER: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_NA_BUILDING_NUMBER},
        P_NA_ADDITIONAL_NUMBER: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_NA_ADDITIONAL_NUMBER},
        P_NA_UNIT_NUMBER: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_NA_UNIT_NUMBER},
        P_NA_CITY: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_NA_CITY},
        P_NA_POSTAL_CODE: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_NA_POSTAL_CODE},
        P_NA_DISTRICT: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_NA_DISTRICT},
        P_NA_PROVINCE: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_NA_PROVINCE},
        P_REMARKS: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_REMARKS},
        P_MESSAGE: { dir: oracledb.BIND_OUT, type: oracledb.STRING } ,
        P_CODE: { dir: oracledb.BIND_OUT, type: oracledb.STRING } , 
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT});

      console.log(result);

      res.json({
        code: 200,
        data: result.outBinds.P_MESSAGE,
        status: true ? 'Success' : 'Error'
      })

    } catch (err) {
      res.json({
        code: 400,
        data: error_type[err.errorNum],
        status: 'Failed'
      })

      console.log(err);

    } finally {
    }
});
// approve vat

// reject vat
app.post(
  '/apis/rejctVat',
  async function(req, res){

  let P_USER_ID = req.body.P_USER_ID,
      P_CUSTOMER_ID = req.body.P_CDC_CUS_ID;

  console.log(P_USER_ID, P_CUSTOMER_ID)

  try {
      conn = await oracledb.getConnection(config1)

      let query = `BEGIN PFOC_CUSTOMER_REJECT(
        :P_USER_ID,
        :P_CUSTOMER_ID,
        :P_MESSAGE,
        :P_CODE);

        END;`;

      const result = await conn.execute(
        query,
        {
        P_USER_ID: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_USER_ID},
        P_CUSTOMER_ID: { type: oracledb.STRING, dir: oracledb.BIND_IN , val: P_CUSTOMER_ID},
        P_MESSAGE: { dir: oracledb.BIND_OUT, type: oracledb.STRING } ,
        P_CODE: { dir: oracledb.BIND_OUT, type: oracledb.STRING } , 
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT});

      console.log(result);

      res.json({
        code: 200,
        data: result.outBinds.P_MESSAGE,
        status: true ? 'Success' : 'Error'
      })

    } catch (err) {
      res.json({
        code: 400,
        data: error_type[err.errorNum],
        status: 'Failed'
      })

      console.log(err);

    } finally {
    }
});
// reject vat

app.post(
  '/apis/getCustomerInfo',
  async function(req, res){

  let CUSTOMER_ID = req.body.P_CUSTOMER_ID;

  try {
      conn = await oracledb.getConnection(config1)

      let query = `BEGIN PFOC_SALES_CUSTOMER_INFO(:P_CUSTOMER_ID , :P_MESSAGE , :P_CODE , :P_SALES_CUSTOMER_INFO ); END;`;

      const result = await conn.execute(
        query,
        {
          P_CUSTOMER_ID: {type:oracledb.STRING , dir:oracledb.BIND_IN,val:CUSTOMER_ID},
          P_MESSAGE: { type: oracledb.STRING, dir: oracledb.BIND_OUT},
          P_CODE: { type: oracledb.STRING, dir: oracledb.BIND_OUT},
          P_SALES_CUSTOMER_INFO: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT},
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT});
      
        console.log(res)
      res.json({
        code: 200,
        data: await result.outBinds.P_SALES_CUSTOMER_INFO.getRow(),
        status: true ? 'Success' : 'Error'
      })

    } catch (err) {
      res.json({
        code: 400,
        data: error_type[err.errorNum],
        status: 'Failed'
      })

      console.log(err);

    } finally {
      /*if (conn) {
        await conn.close()
      }*/
    }
});

app.post(
  '/apis/getSupervisorCustomer',
  async function(req, res){

    let USER_ID = req.body.P_CUSTOMER_ID;
    console.log(USER_ID)

  try {
      conn = await oracledb.getConnection(config1)

      let query = `BEGIN PFOC_SUPERVISOR_CUSTOMER_INFO(:P_USER_ID,:P_MESSAGE , :P_CODE , :P_SUPERVISOR_CUSTOMER_INFO ); END;`;

      const result = await conn.execute(
        query,
        {
          P_USER_ID: {type:oracledb.STRING , dir:oracledb.BIND_IN,val:USER_ID},
          P_MESSAGE: { type: oracledb.STRING, dir: oracledb.BIND_OUT},
          P_CODE: { type: oracledb.STRING, dir: oracledb.BIND_OUT},
          P_SUPERVISOR_CUSTOMER_INFO: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT},
        },
        {outFormat: oracledb.OUT_FORMAT_OBJECT});
      
      const resultSet = result.outBinds.P_SUPERVISOR_CUSTOMER_INFO;
      let row;
      let temp = [];
      while ((row = await resultSet.getRow())) {
        temp.push(row);
      }

      res.json({
        code: 200,
        data: temp,
        status: true ? 'Success' : 'Error'
      })

    } catch (err) {
      res.json({
        code: 400,
        data: error_type[err.errorNum],
        status: 'Failed'
      })

      console.log(err);

    } finally {
      /*if (conn) {
        await conn.close()
      }*/
    }
});


app.get(
  '/apis/v',
  function(req, res){
    console.log('ran');
    res.send('ran');
});

app.use(function(req, res, next){
  // res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    res.send('404, Page not found').send('Not found');
    return;
  }

  // respond with json
  if (req.accepts('json')) {
    res.send({ error: 'Not found' });
    return;
  }

  // default to plain-text. send()
  res.type('txt').send('Not found');
});

const port = 3005;

app.listen(port, () => console.log('Example app listening on port '+ port));