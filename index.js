//npm init --yes
//npm install express
//npm i -g nodemon
//npm i nodemon --D
//nodemon index

//Carga de servidor y definicion de las rutas
const express = require("express");
const app = express();
const port = 3000;

app.listen(port, () => console.log("Servidor escuchado en puerto 3000"));

//Importando funcion desde el modulo consultas.js
const {
  agregar,
  todos,
  editar,
  eliminar,
  nuevatransferencia,
  vertransferencias,
} = require("./consultas/consultas.js");
//middleware para recibir desde el front como json
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/usuario", async (req, res) => {
  const { nombre, balance } = req.body;
  try {
    const result = await agregar(nombre, balance);
    console.log("Valor devuelto por la funcion de base de datos: ", result);
    res.send(result);
    //res.json(result);
  } catch (err) {
    res.send(err);
  }
});

app.get("/usuarios", async (req, res) => {
  try {
    const result = await todos();
    console.log("Respuesta de la funcion todos: ", result);
    res.json({
      status: "Ok",
      data: result,
      mensaje: "Estado de conexion exitosa",
    });
  } catch (err) {
    res.send(err);
  }
});

app.put("/usuario", async (req, res) => {
  const { name, balance } = req.body;
  const { id } = req.query; //params
  try {
    const result = await editar(id, name, balance);
    console.log("Respuesta de la funcion editar: ", result);
    res.send(result);
  } catch (err) {
    res.send(err);
  }
});

app.delete("/usuario", async (req, res) => {
  const { id } = req.query;
  try {
    const result = await eliminar(id);
    console.log("Respuesta de la funcion eliminar: ", result);
    res.send(result);
  } catch (err) {
    res.send(err);
  }
});

app.post("/transferencia", async (req, res) => {
  const { emisor, receptor, monto } = req.body;
  try {
    const result = await nuevatransferencia(emisor, receptor, monto);
    console.log("Respuesta de transferenciar: ", result);
    res.send(result);
  } catch (err) {
    res.send(err);
  }
});

app.get("/transferencias", async (req, res) => {
  try {
    const result = await vertransferencias();
    console.log("Respuesta de transferencia: ", result);
    res.json(result);
  } catch (err) {
    res.send(err);
  }
});
