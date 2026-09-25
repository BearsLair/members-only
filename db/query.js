const pool = require("./pool");

async function getAllMessages() {
  try {
    const { rows } = await pool.query(
      "SELECT messages.id AS id, title, date, message, firstname, lastname, admin FROM messages INNER JOIN userinfo ON userinfo.usersid = messages.usersid",
    );
    return rows;
  } catch (error) {
    console.error("Error getting all messages from db: ", error);
  }
}

async function postUserData(data) {
  console.log("In post user data to db.");
  const { firstname, lastname, username, password, admin } = data;
  console.log(
    firstname,
    " ",
    lastname,
    " ",
    username,
    " ",
    password,
    " ",
    admin,
  );
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

    if (admin === true) {
      await client.query(
        "INSERT INTO userinfo (firstname, lastname, usersid, admin) VALUES ($1, $2, $3, $4)",
        [firstname, lastname, id, admin],
      );
    } else {
      await client.query(
        "INSERT INTO userinfo (firstname, lastname, usersid) VALUES ($1, $2, $3)",
        [firstname, lastname, id],
      );
    }

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

async function postMessage(title, message, usersid) {
  try {
    await pool.query(
      `INSERT INTO messages (title, message, usersid) VALUES ($1, $2, $3)`,
      [title, message, usersid],
    );
  } catch (error) {
    console.error("Error posting message to db: ", error);
  }
}

async function deleteMessage(id) {
  try {
    await pool.query(`DELETE FROM messages WHERE id = $1`, [id]);
  } catch (error) {
    console.error("Error deleting message from db: ", error);
  }
}

module.exports = {
  getAllMessages,
  postUserData,
  postUpgradeToMember,
  postMessage,
  deleteMessage,
};
