const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

require("dotenv").config();

const Browser = require("zombie");
if (process.env.DEVELOPMENT_ENV === "true") {
  Browser.site = "http://localhost:3000/";
} else {
  Browser.site = "https://my-issue-tracker-api.herokuapp.com/";
}

chai.use(chaiHttp);

suite("Functional Tests", function () {
  const browser = new Browser();
  suiteSetup(function (done) {
    browser.visit("/", done);
  });

  test("Create an issue with every field", (done) => {
    browser
      .fill("#testForm input[name=issue_title]", "Issue title")
      .then(() =>
        browser.fill("#testForm input[name=issue_text]", "Issue description")
      )
      .then(() => browser.fill("#testForm input[name=created_by]", "John Doe"))
      .then(() => browser.fill("#testForm input[name=assigned_to]", "Jane Doe"))
      .then(() =>
        browser.fill("#testForm input[name=status_text]", "In progress")
      )
      .then(
        () => browser.pressButton("#testForm button[type=submit]"),
        () => {
          browser.assert.success("Page loaded successfully");
          browser.assert.status(200, "Status code should be 200"); 
          done();
        }
      );
  });
});
