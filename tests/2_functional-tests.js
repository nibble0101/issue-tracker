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

  this.beforeEach(function (done) {
    browser.visit("/", done);
  });

  test("Create an issue with every field", (done) => {
    browser
      .fill("#testForm input[name=issue_title]", "Issue title")
      .then(() =>
        browser.fill("#testForm textarea[name=issue_text]", "Issue description")
      )
      .then(() => browser.fill("#testForm input[name=created_by]", "John Doe"))
      .then(() => browser.fill("#testForm input[name=assigned_to]", "Jane Doe"))
      .then(() =>
        browser.fill("#testForm input[name=status_text]", "In progress")
      )
      .then(() => browser.pressButton("#testForm button[type=submit]"))
      .then(() => {
        browser.assert.success("Page loaded successfully");
        browser.assert.status(200, "Status code should be 200");
        const element = browser.body.querySelector("#jsonResult");
        const issueObject = JSON.parse(element.textContent);
        assert.lengthOf(Object.keys(issueObject), 9);
        assert.isString(issueObject._id);
        assert.isTrue(issueObject.open);
        assert.isString(issueObject.created_on);
        assert.isString(issueObject.updated_on);
        assert.include(issueObject, {
          issue_title: "Issue title",
          issue_text: "Issue description",
          created_by: "John Doe",
          assigned_to: "Jane Doe",
          status_text: "In progress",
        });

        done();
      });
  });

  test("Create an issue with required fields", (done) => {
    browser
      .fill("#testForm input[name=issue_title]", "Issue title")
      .then(() =>
        browser.fill("#testForm textarea[name=issue_text]", "Issue description")
      )
      .then(() => browser.fill("#testForm input[name=created_by]", "John Doe"))
      .then(() => browser.pressButton("#testForm button[type=submit]"))
      .then(() => {
        browser.assert.success("Page loaded successfully");
        browser.assert.status(200, "Status code should be 200");
        const element = browser.body.querySelector("#jsonResult");
        const issueObject = JSON.parse(element.textContent);
        assert.lengthOf(Object.keys(issueObject), 9);
        assert.isString(issueObject._id);
        assert.isTrue(issueObject.open);
        assert.isString(issueObject.created_on);
        assert.isString(issueObject.updated_on);
        assert.include(issueObject, {
          issue_title: "Issue title",
          issue_text: "Issue description",
          created_by: "John Doe",
          assigned_to: "",
          status_text: "",
        });

        done();
      });
  });
  test("Create an issue with missing required fields", (done) => {
    browser
      .fill("#testForm input[name=issue_title]", "Issue title")
      .then(() => browser.fill("#testForm input[name=created_by]", "John Doe"))
      .then(() => browser.pressButton("#testForm button[type=submit]"))
      .then(() => {
        browser.assert.success("Page loaded successfully");
        browser.assert.status(200, "Status code should be 200");
        const element = browser.body.querySelector("#jsonResult");
        const errorObject = JSON.parse(element.textContent);
        assert.deepEqual(errorObject, { error: "required field(s) missing" });
        done();
      });
  });
});
