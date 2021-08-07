const express = require('express');
const https = require('https');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
const { body, validationResult } = require('express-validator');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [ oracledb.CLOB ];

const config1 = {
  user: 'cdc',
  password: 'cdc1$',
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
    '/login',
    body('username').not().isEmpty().trim().escape(),
    body('password').not().isEmpty().trim().escape(),
    async function(req, res){

    let username = req.body.username,
        password = req.body.password;

    try {
        conn = await oracledb.getConnection(config1)
        console.log(conn, 'cn');
        /*let query = `
          SELECT * FROM 
          TBL_SYS_USER_LOGIN u,
          TBL_CUSTOMER_APP_DATA c
          WHERE u.USER_ID='${username}' AND u.USER_PASSWORD='${password}' AND u.USER_ID = c.SALESREP_NUMBER AND u.USER_REGION = c.REGION`;*/

        let query = `
          SELECT * FROM 
          TBL_SYS_USER_LOGIN u
          WHERE u.USER_ID='${username}' AND u.USER_PASSWORD='${password}'`;

        console.log(query);

        const result = await conn.execute(query, [], {outFormat: oracledb.OUT_FORMAT_OBJECT})

        // console.log(query);
        console.log(result.rows[0])
        res.json({
          code: 200,
          data: result.rows[0],
          status: result.rows.length > 0 ? 'Success' : 'No record found'
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

// get customer
  /*app.post(
    '/getCustomers',
    body('userid').not().isEmpty().trim().escape(),
    async function(req, res){

    let userid = req.body.userid;

    try {
        conn = await oracledb.getConnection(config1);
        console.log(conn, 'cn');
        let query = `
          SELECT * FROM 
          TBL_SYS_USER_LOGIN u,
          TBL_CUSTOMER_APP_DATA c
          WHERE u.USER_ID='${userid}' AND u.USER_ID = c.SALESREP_NUMBER AND u.USER_REGION = c.REGION`;

        console.log(query);

        const result = await conn.execute(query, [], {outFormat: oracledb.OUT_FORMAT_OBJECT})

        // console.log(query);
        console.log(result)
        res.json({
          code: 200,
          data: result.rows,
          status: result.rows.length > 0 ? 'Success' : 'No record found'
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
  });*/
// get customer

// get customers
  app.post(
    '/getCustomers',
    async function(req, res){

    try {
        conn = await oracledb.getConnection(config1)

        // let query = `BEGIN TEST1(:cursor); END;`;
        let query = `BEGIN PROC_CUSTOMER_LIST(:P_REGION, :P_LOGIN_USER, :cursor); END;`;

        const result = await conn.execute(
          query,
          {
            P_REGION: 'WEST',
            P_LOGIN_USER: '2222221',
            cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT},
          },
          {outFormat: oracledb.OUT_FORMAT_OBJECT});

        console.log(query);
        console.dir(result.outBinds.cursor, {depth: null});

        const resultSet = result.outBinds.cursor;
        let row;
        let temp = [];
        while ((row = await resultSet.getRow())) {
          console.log(row);
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
// get customers

// get single customer images
  app.post(
    '/getCustomerImages',
    body('customerNumber').not().isEmpty().trim().escape(),
    async function(req, res){

    let customerNumber = req.body.customerNumber;
    console.log(req, 'ssssssssssssssssssss');
    try {
        conn = await oracledb.getConnection(config1)

        // let query = `BEGIN TEST1(:cursor); END;`;
        let query = `BEGIN PROC_CUSTOMER_IMAGE(:P_CUST_NUMBER, :cursor); END;`;

        const result = await conn.execute(
          query,
          {
            P_CUST_NUMBER: customerNumber,
            cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT},
          },
          {outFormat: oracledb.OUT_FORMAT_OBJECT});

        console.dir(result.outBinds.cursor, {depth: null});

        const resultSet = result.outBinds.cursor;
        let row;
        let temp = [];
        while ((row = await resultSet.getRow())) {
          console.log(row);
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
// get single customer images

// insert/update vat
  app.post(
    '/updateVat',
    async function(req, res){

    console.log(req.body);

    res.json({
      code: 200,
      data: req.body,
      status: true ? 'Success' : 'Error'
    })

    return;
    
    let customerNumber = req.body.customerNumber;
    
    try {
        conn = await oracledb.getConnection(config1)

        let query = `BEGIN PROC_CUSTOMER_UPDATE(
          :P_USER_ID,
          :P_CUST_NUMBER,
          :P_USER_TYPE,
          :P_LATITUDE,
          :P_LONGITUDE,
          :P_VAT_NUM,
          :P_MAIN_CR_NUM,
          :P_BR_CR_NUM,
          :P_COC_NUM,
          :P_BALADIYA_NUM,
          :P_VAT_CERT_IMG,
          :P_MAIN_CR_CERT_IMG,
          :P_BR_CR_CERT_IMG,
          :P_COC_CERT_IMG,
          :P_BALADIYA_CERT_IMG,
          :P_NATIONAL_ADD_IMG,
          :cursor
          );

          END;`;

        const result = await conn.execute(
          query,
          {
            P_USER_ID: '2222221',
            P_CUST_NUMBER: 343434334,
            P_USER_TYPE: 'amwaj',
            P_LATITUDE: 'amwaj',
            P_LONGITUDE: 'amwaj',
            P_VAT_NUM: 'amwaj',
            P_MAIN_CR_NUM: 'amwaj',
            P_BR_CR_NUM: 'amwaj',
            P_COC_NUM: 'amwaj',
            P_BALADIYA_NUM: 'amwaj',
            P_VAT_CERT_IMG: 'amwaj',
            P_MAIN_CR_CERT_IMG: 'amwaj',
            P_BR_CR_CERT_IMG: 'amwaj',
            P_COC_CERT_IMG: 'amwaj',
            P_BALADIYA_CERT_IMG: 'amwaj',
            P_NATIONAL_ADD_IMG: 'amwaj',
            cursor: '',
          },
          {outFormat: oracledb.OUT_FORMAT_OBJECT});

        console.log(result);
        // console.log(result.outBinds.cursor, {depth: null});

        /*const resultSet = result.outBinds.cursor;
        let row;
        let temp = [];
        while ((row = await resultSet.getRow())) {
          // console.log(row);
          temp.push(row);
        }*/

        res.json({
          code: 200,
          data: 'temp',
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
// insert/update vat

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

const port = 12123;

app.listen(port, () => console.log('Example app listening on port '+ port));