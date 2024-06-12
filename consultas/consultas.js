//npm i pg

const { Pool } = require("pg");

const config = {
  host: "localhost",
  database: "bancosolar",
  user: "postgres",
  password: "postgres",
  port: 5432,
};

const pool = new Pool(config);

const agregar = async (nombre, balance) => {
  console.log("Valores recibidos: ", nombre, balance);
  try {
    const result = await pool.query({
      text: "INSERT INTO usuarios (nombre, balance) VALUES ($1, $2) RETURNING *",
      values: [nombre, balance],
    });
    return result.rows[0];
  } catch (err) {
    console.error("Codigo del error: ", err.code);
  }
};

const todos = async () => {
  try {
    const result = await pool.query({
      text: "SELECT * FROM usuarios",
    });
    return result.rows;
  } catch (err) {
    console.error("Codigo del error: ", err.code);
  }
};

//funcion para eliminar un registro según su nombre recibido como un query.string
const eliminar = async (id) => {
  try {
    const result = await pool.query({
      text: "DELETE FROM usuarios WHERE id = $1 RETURNING *",
      values: [id],
    });
    return result.rows[0];
  } catch (err) {
    console.error("Codigo del error: ", err.code);
  }
};

//funcion para editar un registro
const editar = async (id, nombre, balance) => {
  try {
    const result = await pool.query({
      text: "UPDATE usuarios SET nombre = $2, balance = $3 WHERE id = $1 RETURNING *",
      values: [id, nombre, balance],
    });
    return result.rows[0];
  } catch (err) {
    console.error("Codigo del error: ", err.code);
  }
};

const nuevatransferencia = async (emisor, receptor, monto) => {
  try {
    if (monto < 0) {
      return "El monto debe ser mayor a cero";
    } else {
      await pool.query("BEGIN");
      console.log([emisor, receptor, monto]);
      const restar = await pool.query({
        text: "UPDATE usuarios SET balance=balance- $2 WHERE nombre = $1 RETURNING *",
        values: [emisor, monto],
      });

      if (restar.rowCount == 1) {
        console.log("Restar ", restar.rows[0]);
      } else {
        await pool.query("ROLLBACK");
        return "No se pudo realizar transaccion restar";
      }

      const sumar = await pool.query({
        text: "UPDATE usuarios SET balance=balance+ $2 WHERE nombre = $1 RETURNING *",
        values: [receptor, monto],
      });

      if (sumar.rowCount == 1) {
        console.log("Sumar ", sumar.rows[0]);
        await pool.query("COMMIT");
      } else {
        await pool.query("ROLLBACK");
        return "No se pudo realizar transaccion sumar";
      }
      //(select id from usuarios where nombre= $1)
      const result = await pool.query({
        text: "INSERT INTO transferencias (emisor, receptor, monto, fecha) values ((select id from usuarios where nombre= $1), (select id from usuarios where nombre= $2), $3, current_timestamp) RETURNING *",
        values: [emisor, receptor, monto],
      });
      if (result.rowCount == 1) {
        console.log("Transferencia ok ", result.rows[0]);
        return result.rows[0];
      } else {
        await pool.query("ROLLBACK");
        return "No se pudo realizar transaccion final";
      }
    }
  } catch (err) {
    console.error("Codigo del error: ", err.code);
  }
};

const vertransferencias = async () => {
  try {
    const result = await pool.query({
      rowMode: "array",
      text: "SELECT t.id, e.nombre, r.nombre, t.monto, t.fecha FROM transferencias t INNER JOIN usuarios e ON e.id =t.emisor INNER JOIN usuarios r ON r.id=t.receptor",
    });
    return result.rows;
  } catch (err) {
    console.error("Codigo del error: ", err.code);
  }
};

module.exports = {
  agregar,
  todos,
  eliminar,
  editar,
  nuevatransferencia,
  vertransferencias,
};
