//1.2

// Datos del servicio
const SERVICE_NAME = "login";
const SERVICE_ROOT = "/";

// Definición de códigos de estado
const STATUS_OK = 200;
const STATUS_BADFORMAT = 400;
const STATUS_UNAUTHORIZED = 401;

// Importación de Express y creación del router
const express = require("express");
const router = express.Router();

// Endpoint de autenticación de usuarios POST /login
router.post(SERVICE_ROOT, (req, res) => {
  if (req.body != undefined) {
    console.dir(req.body);

    if (req.body.user === undefined || req.body.password === undefined) {
      res.status(STATUS_BADFORMAT).end();
    } else if ((req.body.user === "user" || req.body.user === "user@test.com") && req.body.password === "1234") {
      console.log(`[${SERVICE_NAME}] Usuario autenticado correctamente`);
      res.status(STATUS_OK).end();
    } else {
      console.log(`[${SERVICE_NAME}] Usuario o contraseña incorrectos`);
      res.status(STATUS_UNAUTHORIZED).end();
    }
  } else {
    res.status(STATUS_BADFORMAT).end();
  }
});

module.exports = router;