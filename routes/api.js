"use strict";

const { getDate, getId } = require("../utils/utils");
const data = require("../db/db");


module.exports = function(app) {
  app
    .route("/api/issues/:project")

    .get(async function(req, res) {
      const { project } = req.params;

      if (!data.hasOwnProperty(project)) {
        return res.send({ result: "Project doesn't exist" });
      }

      const { query } = req;

      if (Object.keys(query).length === 0) {
        return res.json(data[project]);
      }

      // Convert "true"/"false" to boolean

      if (query.hasOwnProperty("open")) {
        if (query.open === "true") {
          query.open = true;
        }
        if (query.open === "false") {
          query.open = false;
        }
      }

      const filteredIssuesArr = data[project].filter((issueObj) => {
        for (const field in query) {
          if (query[field] !== issueObj[field]) return false;
        }
        return true;
      });

      return res.json(filteredIssuesArr);
    })

    .post(async function(req, res) {
      const { project } = req.params;
      const { body } = req;

      if (
        !body.hasOwnProperty("issue_title") ||
        !body.hasOwnProperty("issue_text") ||
        !body.hasOwnProperty("created_by")
      ) {
        return res.json({ error: "required field(s) missing" });
      }
      if (
        !body.issue_title.trim() ||
        !body.issue_text.trim() ||
        !body.created_by.trim()
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


      if (!data.hasOwnProperty(project)) {
        data[project] = [body];
        return res.json(body);
      }

      data[project].push(body);
      res.json(body);
    })

    .put(async function(req, res) {
      try {
        const { project } = req.params;
        const { body } = req;
        const { _id } = body;

        if (!body.hasOwnProperty("_id")) {
          return res.json({ error: "missing _id" });
        }

        if (Object.keys(body).length === 1) {
          return res.json({ error: "no update field(s) sent", _id });
        }


        if (!data.hasOwnProperty(project)) {
          return res.json({ error: 'could not update', _id });
        }

        const issueIndex = data[project].findIndex((issueObj) => {
          return _id === issueObj._id;
        });
        if (issueIndex < 0) {
          return res.json({ error: 'could not update', _id })
        }

        const issueObj = data[project][issueIndex];

        for (const field in body) {
          if (issueObj.hasOwnProperty(field)) {
            issueObj[field] = body[field];
          }
        }

        issueObj.updated_on = getDate();

        data[project][issueIndex] = issueObj;
        return res.json({ result: 'successfully updated', _id });
      } catch (error) {
        return res.json({ error: "could not update", _id: req.body._id });
      }
    })

    .delete(async function(req, res) {
      try {
        const { project } = req.params;
        const { _id } = req.body;

        if (!_id) {
          return res.json({ error: "missing _id" });
        }

        if (!data.hasOwnProperty(project)) {
          return res.json({ result: "Project doesn't exist" });
        }

        const issueIndex = data[project].findIndex(
          (issueObj) => issueObj._id === _id
        );

        if (issueIndex < 0) {
          return res.json({ error: "could not delete", _id: _id });
        }

        data[project].splice(issueIndex, 1);
        return res.json({ result: "successfully deleted", _id });
      } catch (error) {
        return res.json({ error: "could not delete", _id: req.body._id });
      }
    });
};
