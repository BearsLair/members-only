const pool = require("./pool");

async function getAllMessages() {
  try {
    const { rows } = await pool.query(
      "SELECT title, date, message, firstname, lastname FROM messages INNER JOIN userinfo ON userinfo.usersid = messages.usersid",
    );
    return rows;
  } catch (error) {
    console.error("Error getting all messages from db: ", error);
  }
}

async function postUserData(data) {
  console.log("In post user data to db.");
  const { firstname, lastname, username, password } = data;
  console.log(firstname, " ", lastname, " ", username, " ", password);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id",
      [username, password],
    );

    console.log("result returned from first query: ", result);

    const id = result.rows[0].id;

    console.log("id from first query result: ", id);

    await client.query(
      "INSERT INTO userinfo (firstname, lastname, usersid) VALUES ($1, $2, $3)",
      [firstname, lastname, id],
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("error posting user details to db: ", error);
  } finally {
    client.release();
  }
}

async function postUpgradeToMember(id) {
  await pool.query(`UPDATE userinfo SET member = true WHERE usersid = $1`, [
    id,
  ]);
}

module.exports = { getAllMessages, postUserData, postUpgradeToMember };
