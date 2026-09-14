async function getHomePage(req, res) {
  try {
    res.render("home");
  } catch (error) {
    console.error("Error retrieving home page: ", error);
  }
}

async function getSignUp(req, res) {
  try {
    res.render("sign-up");
  } catch (error) {
    console.error("Error retrieving sign-up page: ", error);
  }
}

async function postSignUp(req, res) {
  try {
    console.log(req.body);
    res.redirect("/");
  } catch (error) {
    console.error("Error posting sign up info: ", error);
  }
}

module.exports = {
  getHomePage,
  getSignUp,
  postSignUp,
};
