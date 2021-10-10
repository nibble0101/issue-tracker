const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

const path = "/api/issues/apitest";
const allInputFields = {
  issue_title: "Fix error in posting data",
  issue_text: "When we post data it has an error.",
  created_by: "Jane Doe",
  assigned_to: "John Doe",
  status_text: "In QA",
};

const allKeys = [
  "_id",
  "issue_title",
  "issue_text",
  "created_on",
  "updated_on",
  "created_by",
  "assigned_to",
  "open",
  "status_text",
];

suite("Functional Tests", function () {
  let _id;
  test("Create an issue with every field", (done) => {
    chai
      .request(server)
      .post(`${path}`)
      .send(allInputFields)
      .end((err, res) => {
        const { body } = res;
        _id = body._id;
        assert.equal(res.status, 200);
        assert.isObject(body);
        assert.include(body, allInputFields);
        assert.containsAllKeys(body, [
          "_id",
          "created_on",
          "updated_on",
          "open",
        ]);
        done();
      });
  });

  test("Create an issue with required fields", (done) => {
    chai
      .request(server)
      .post(`${path}`)
      .send({
        issue_title: "Fix error in posting data",
        issue_text: "When we post data it has an error",
        created_by: "Tom Doe",
      })
      .end((err, res) => {
        const { body } = res;
        assert.equal(res.status, 200);
        assert.isObject(body);
        assert.equal(body.issue_title, "Fix error in posting data");
        assert.equal(body.issue_text, "When we post data it has an error");
        assert.equal(body.created_by, "Tom Doe");
        assert.equal(body.open, true);
        assert.equal(body.status_text, "");
        assert.containsAllKeys(body, ["_id", "created_on", "updated_on"]);
        done();
      });
  });
  test("Create an issue with missing required fields", (done) => {
    chai
      .request(server)
      .post(`${path}`)
      .send({
        assigned_to: "John Doe",
        status_text: "In QA",
      })
      .end((err, res) => {
        const { body } = res;
        assert.equal(res.status, 200);
        assert.isObject(body);
        assert.deepEqual(body, { error: "required field(s) missing" });
        done();
      });
  });
  test("View issues on a project", (done) => {
    chai
      .request(server)
      .get(`${path}`)
      .end((err, res) => {
        const { body } = res;
        assert.equal(res.status, 200);
        assert.isArray(body);
        assert.equal(body.length, 2);
        body.forEach((issueObj) => {
          assert.containsAllKeys(issueObj, allKeys);
        });
        done();
      });
  });
  test("View issues on a project with one filter", (done) => {
    chai
      .request(server)
      .get(`${path}?created_by=Jane Doe`)
      .end((err, res) => {
        const { body } = res;
        assert.equal(res.status, 200);
        assert.isArray(body);
        body.forEach((issueObj) => {
          assert.equal(issueObj.created_by, "Jane Doe");
        });
        done();
      });
  });
  test("View issues on a project with multiple filters", (done) => {
    chai
      .request(server)
      .get(`${path}?created_by=Jane Doe&open=true`)
      .end((err, res) => {
        const { body } = res;
        assert.equal(res.status, 200);
        assert.isArray(body);
        body.forEach((issueObj) => {
          assert.equal(issueObj.created_by, "Jane Doe");
          assert.equal(issueObj.open, true);
        });
        done();
      });
  });
  test("Update one field on an issue", (done) => {
    chai
      .request(server)
      .put(`${path}`)
      .send({
        _id: _id,
        created_by: "Matt Doe",
      })
      .end((err, res) => {
        const { body } = res;
        assert.equal(res.status, 200);
        assert.isObject(body);
        assert.deepEqual(body, { result: "successfully updated", _id });
        done();
      });
  });
  test("Update multiple fields on an issue", (done) => {
    chai
      .request(server)
      .put(`${path}`)
      .send({
        _id: _id,
        issue_title: "Modified issue title",
        issue_text: "Modified issue text",
        created_by: "Chris Doe",
      })
      .end((err, res) => {
        const { body } = res;
        assert.equal(res.status, 200);
        assert.isObject(body);
        assert.deepEqual(body, { result: "successfully updated", _id });
        done();
      });
  });
  test("Update an issue with missing _id", (done) => {
    chai
      .request(server)
      .put(`${path}`)
      .send({
        created_by: "Tom Doe",
      })
      .end((err, res) => {
        const { body } = res;
        assert.equal(res.status, 200);
        assert.isObject(body);
        assert.deepEqual(body, { error: "missing _id" });
        done();
      });
  });
  test("Update an issue with no fields to update", (done) => {
    chai
      .request(server)
      .put(`${path}`)
      .send({ _id })
      .end((err, res) => {
        const { body } = res;
        assert.equal(res.status, 200);
        assert.isObject(body);
        assert.deepEqual(body, { error: "no update field(s) sent", _id });
        done();
      });
  });
  test("Update an issue with an invalid _id", (done) => {
    chai
      .request(server)
      .put(`${path}`)
      .send({
        _id: "Invalid id",
        created_by: "Maria Doe",
      })
      .end((err, res) => {
        const { body } = res;
        assert.equal(res.status, 200);
        assert.isObject(body);
        assert.deepEqual(body, {
          error: "could not update",
          _id: "Invalid id",
        });
        done();
      });
  });
  test("Delete an issue", (done) => {
    chai
      .request(server)
      .delete(`${path}`)
      .send({ _id })
      .end((err, res) => {
        const { body } = res;
        assert.equal(res.status, 200);
        assert.isObject(body);
        assert.deepEqual(body, { result: "successfully deleted", _id });
        done();
      });
  });
  test("Delete an issue with an invalid _id", (done) => {
    chai
      .request(server)
      .delete(`${path}`)
      .send({
        _id: "Invalid id",
      })
      .end((err, res) => {
        const { body } = res;
        assert.equal(res.status, 200);
        assert.isObject(body);
        assert.deepEqual(body, {
          error: "could not delete",
          _id: "Invalid id",
        });
        done();
      });
  });
  test("Delete an issue with missing _id", (done) => {
    chai
      .request(server)
      .delete(`${path}`)
      .send({})
      .end((err, res) => {
        const { body } = res;
        assert.equal(res.status, 200);
        assert.isObject(body);
        assert.deepEqual(body, { error: "missing _id" });
        done();
      });
  });
});
