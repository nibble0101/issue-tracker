"use strict";

const db = require("../db/db");
const { getDate, getId } = require("../utils/utils");

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(function (req, res) {
      const { project } = req.params;

      if (!db.hasOwnProperty(project)) {
        return res.send({ result: "Project doesn't exist" });
      }
      const { query } = req;
      if (Object.keys(query).length === 0) {
        return res.json(db[project]);
      }

      const filteredIssuesArr = db[project].filter((issueObj) => {
        for (const field in query) {
          if (query[field] !== issueObj[field]) return false;
        }
        return true;
      });

      return res.json(filteredIssuesArr);
    })

    .post(function (req, res) {
      const { project } = req.params;
      const { body } = req;

      if (
        !body.hasOwnProperty("issue_title") ||
        !body.hasOwnProperty("issue_text") ||
        !body.hasOwnProperty("created_by")
      ) {
        return res.json({ error: "required field(s) missing" });
      }

      if (!body.hasOwnProperty("assigned_to")) {
        body.assigned_to = "";
      }

      if (!body.hasOwnProperty("status_text")) {
        body.status_text = "";
      }

      const date = getDate();
      body._id = getId();
      body.created_on = date;
      body.updated_on = date;
      body.open = true;

      if (!db.hasOwnProperty(project)) {
        db[project] = [body];
        return res.json(body);
      }

      db[project].push(body);
      res.json(body);
    })

    .put(function (req, res) {
      try {
        const { project } = req.params;
        if (!db.hasOwnProperty(project)) {
          return res.json({ result: "Project doesn't exist" });
        }
        const { body } = req;
        const { _id } = body;

        if (!body.hasOwnProperty("_id")) {
          return res.json({ error: "missing _id" });
        }

        if (Object.keys(body).length === 1) {
          return res.json({ error: "no update field(s) sent", _id });
        }

        const issueIndex = db[project].findIndex((issueObj) => {
          return _id === issueObj._id;
        });

        const issueObj = db[project][issueIndex];

        for (const field in body) {
          if (issueObj.hasOwnProperty(field)) {
            issueObj[prop] = body[field];
          }
        }

        db[project][issueIndex] = issueObj;
        return res.json({ result: "successfully updated", _id });
      } catch (error) {
        return res.json({ error: "could not update", _id: req.body._id });
      }
    })

    .delete(function (req, res) {
      try {
        const { project } = req.params;

        if (!db.hasOwnProperty(project)) {
          return res.json({ result: "Project doesn't exist" });
        }
        const { _id } = req.body;

        if (!_id) {
          return res.json({ error: "missing _id" });
        }

        const issueIndex = db[project].findIndex(
          (issueObj) => issueObj._id === _id
        );

        // Issue doesn't exist
        if (issueIndex < 0) {
          return res.json({ error: "could not delete", _id: _id });
        }

        db[project].splice(issueIndex, 1);
        return res.json({ result: "successfully deleted", _id });
      } catch (error) {
        return res.json({ error: "could not delete", _id: req.body._id });
      }
    });
};
