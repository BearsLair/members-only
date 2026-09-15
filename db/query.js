const pool = require("./pool");

async function getAllMessages() {
  console.log("In database...");
  try {
    const { rows } = await pool.query("SELECT * FROM messages");
    return rows;
  } catch (error) {
    console.error("Error getting all messages from db: ", error);
  }
}

async function postUserData(data) {
  const { firstname, lastname, username, password } = data;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id;",
      [username, password],
    );

    const id = result.rows[0].id;

    await client.query(
      "INSERT INTO userinfo (firstname, lastname, usersid) VALUES ($1, $2, $3)",
      [firstname, lastname, id],
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("error posting user details to db: ", error);
  } finally {
    client.release();
  }
}

module.exports = { getAllMessages, postUserData };
