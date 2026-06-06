const express = require("express");
const router = express.Router();

const { MongoClient } = require("mongodb");


const SERVICE_NAME = "login";
const SERVICE_ROOT = "/";


const STATUS_OK = 200;
const STATUS_BADFORMAT = 400;
const STATUS_UNAUTHORIZED = 401;
const STATUS_SERVER_ERROR = 500;


const DB_URL = "mongodb://localhost:27017/";
const DB_NAME = "amorylentejas";
const DB_USERS_COLLECTION = "volunteers";


router.post(SERVICE_ROOT, async (req, res) => {
  
  if (req.body != undefined && req.body.user != undefined && req.body.password != undefined) {
    
    const client = new MongoClient(DB_URL);
    
    try {
      
      const db = client.db(DB_NAME);
      const volunteers = db.collection(DB_USERS_COLLECTION);
      
      
      const userFound = await volunteers.findOne({ 
        user: req.body.user, 
        password: req.body.password 
      });

      
      if (userFound) {
        console.log("[" + SERVICE_NAME + "] Usuario autenticado correctamente: " + req.body.user);
        res.status(STATUS_OK).end();
      } else {
    
        console.log("[" + SERVICE_NAME + "] Intento de acceso fallido para: " + req.body.user);
        res.status(STATUS_UNAUTHORIZED).end();
      }
      
    } catch (error) {
      console.error("[" + SERVICE_NAME + "] Error interno de base de datos: " + error.toString());
      res.status(STATUS_SERVER_ERROR).end();
    } finally {
      
      await client.close();
    }

  } else {
    
    res.status(STATUS_BADFORMAT).end();
  }
});

module.exports = router;