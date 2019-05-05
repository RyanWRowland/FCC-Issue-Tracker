/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

const mongoose = require('mongoose');
const Issue = require('../models/issues.js');

const sanitize = string => string ? string.replace(/>/g, '&gt').replace(/</g, '&lt') : '';
const format = doc =>  {
  const json = doc.toJSON();
  return {
    _id: json._id,
    issue_title: sanitize(json.issue_title),
    issue_text: sanitize(json.issue_text),
    created_on: json.created_on,
    updated_on: json.updated_on,
    created_by: sanitize(json.created_by),
    assigned_to: sanitize(json.assigned_to),
    open: json.open,
    status_text: sanitize(json.status_text)
  }
};

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      const project = req.params.project;
      let query = {project, ...req.query};
      Issue.find(query).sort('-updated_on').exec((err, issues) => {
        //if (issues.length === 0) return res.status(404).send('No issues found');
        res.json(issues.map(issue => format(issue)));
      });
    })
    
    .post(function (req, res){
      const project = req.params.project;
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        return res.status(400).send('missing required field(s)');
      }
      const issue = new Issue({project, ...req.body});
      issue.save((err, issue) => {
        if (err || !issue) {
          res.status(500).send('could not create issue');
          return;
        }
        //res.json(issue);
        res.json(format(issue));
      });
      
    })
    
    .put(function (req, res){
      const project = req.params.project;
      const { _id, ...updates } = req.body;
      for (let field in updates) {
        if (!updates[field]) {
          delete updates[field];
        }
      }
      if (updates.open) {
        updates.open === 'false' ? updates.open = false : updates.open = true;
      }
      if (Object.keys(updates).length === 0) return res.status(400).send('no updated field sent');
      Issue.findByIdAndUpdate(_id, { updated_on: Date.now(), ...updates }, (err, doc) => {
        if (err || !doc) return res.status(500).send('could not update ' + _id);
        res.send('successfully updated');
      });
    })
    
    .delete(function (req, res){
      const project = req.params.project;
      const id = req.body._id;
      if (!id) return res.status(400).send('_id error');
      Issue.findByIdAndDelete(id, (err) => {
        if (err) return res.status(500).send('could not delete ' + id);
        res.send('deleted ' + id);
      })
    });
    
};
