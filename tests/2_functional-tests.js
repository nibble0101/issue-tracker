const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

const path = "/api/issues/apitest";

suite("Functional Tests", function () {
  let _id;
  test("Create an issue with every field", (done) => {
    chai
      .request(server)
      .post(`${path}`)
      .send({
        issue_title: "Fix error in posting data",
        issue_text: "When we post data it has an error.",
        created_by: "Jane Doe",
        assigned_to: "John Doe",
        status_text: "In QA",
      })
      .end((err, res) => {
        const { body } = res;
        _id = body._id;
        assert.isObject(body);
        done();
      });
  });

  test("Create an issue with required fields", (done) => {
    chai
      .request(server)
      .put(`${path}`)
      .send({
        issue_title: "Fix error in posting data",
        issue_text: "When we post data it has an error.",
        created_by: "Tom Doe",
      })
      .end((err, res) => {
        const { body } = res;
        assert.isObject(body);
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
        assert.isObject(body);
        done();
      });
  });
  test("View issues on a project", (done) => {
    chai
      .request(server)
      .get(`${path}`)
      .end((err, res) => {
        const { body } = res;
        assert.isArray(body);
        assert.isAbove(body.length, 0);
        done();
      });
  });
  test("View issues on a project with one filter", (done) => {
    chai
      .request(server)
      .get(`${path}?created_by=Jane Doe`)
      .end((err, res) => {
        const { body } = res;
        assert.isArray(body);
        done();
      });
  });
  test("View issues on a project with multiple filters", (done) => {
    chai
      .request(server)
      .get(`${path}?created_by=Jane Doe&open=true`)
      .end((err, res) => {
        const { body } = res;
        assert.isArray(body);
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
        assert.isObject(body);
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
        assert.isObject(body);
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
        assert.isObject(body);
        done();
      });
  });
  test("Update an issue with no fields to update", (done) => {
    chai
      .request(server)
      .put(`${path}`)
      .send({})
      .end((err, res) => {
        const { body } = res;
        assert.isObject(body);
        done();
      });
  });
  test("Update an issue with an invalid _id", (done) => {
    chai
      .request(server)
      .put(`${path}`)
      .send({
        _id: "Invalid id",
      })
      .end((err, res) => {
        const { body } = res;
        assert.isObject(body);
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
        assert.isObject(body);
        assert.deepEqual(body, { error: "missing _id" });
        done();
      });
  });
});
