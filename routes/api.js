"use strict";

const { getDate, getId, readData, writeData } = require("../utils/utils");

module.exports = function (app) {
  app
    .route("/api/issues/:project")

    .get(async function (req, res) {
      const { project } = req.params;

      const data = await readData();

      if (!data.hasOwnProperty(project)) {
        return res.send({ result: "Project doesn't exist" });
      }

      const { query } = req;

      if (Object.keys(query).length === 0) {
        return res.json(data[project]);
      }

      const filteredIssuesArr = data[project].filter((issueObj) => {
        for (const field in query) {
          if (query[field] !== issueObj[field]) return false;
        }
        return true;
      });

      return res.json(filteredIssuesArr);
    })

    .post(async function (req, res) {
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

      const data = await readData();

      if (!data.hasOwnProperty(project)) {
        data[project] = [body];
        await writeData(data);
        return res.json(body);
      }

      data[project].push(body);
      await writeData(data);
      res.json(body);
    })

    .put(async function (req, res) {
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

        const data = await readData();

        if (!data.hasOwnProperty(project)) {
          return res.json({ error: "could not update", _id });
        }

        const issueIndex = data[project].findIndex((issueObj) => {
          return _id === issueObj._id;
        });
        if (issueIndex < 0) {
          return res.json({ error: "could not update", _id });
        }

        const issueObj = data[project][issueIndex];

        for (const field in body) {
          if (issueObj.hasOwnProperty(field)) {
            issueObj[field] = body[field];
          }
        }

        issueObj.updated_on = getDate();

        data[project][issueIndex] = issueObj;
        await writeData(data);
        return res.json({ result: "successfully updated", _id });
      } catch (error) {
        return res.json({ error: "could not update", _id: req.body._id });
      }
    })

    .delete(async function (req, res) {
      try {
        const { project } = req.params;
        const { _id } = req.body;

        if (!_id) {
          return res.json({ error: "missing _id" });
        }

        const data = await readData();

        if (!data.hasOwnProperty(project)) {
          return res.json({ result: "Project doesn't exist" });
        }

        const issueIndex = data[project].findIndex(
          (issueObj) => issueObj._id === _id
        );

        // Issue doesn't exist
        if (issueIndex < 0) {
          return res.json({ error: "could not delete", _id: _id });
        }

        data[project].splice(issueIndex, 1);
        await writeData(data);
        return res.json({ result: "successfully deleted", _id });
      } catch (error) {
        return res.json({ error: "could not delete", _id: req.body._id });
      }
    });
};
