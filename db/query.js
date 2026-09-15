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

module.exports = { getAllMessages };
