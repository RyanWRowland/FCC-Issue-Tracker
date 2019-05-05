/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

const Issue = require('../models/issues.js');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let testableId, testableDate;
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.include(res.body, {
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Every field filled in',
            assigned_to: 'Chai and Mocha',
            status_text: 'In QA',
            open: true
          });
          assert.isDefined(res.body.created_on);
          assert.isDefined(res.body.updated_on);
          assert.isDefined(res.body._id);
         
          testableId = res.body._id;
          testableDate = res.body.created_on;
         
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Required fields filled in',
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.include(res.body, {
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Required fields filled in',
            assigned_to: '',
            status_text: '',
            open: true
          });
          assert.isDefined(res.body.created_on);
          assert.isDefined(res.body.updated_on);
          assert.isDefined(res.body._id);
          
          done();
        });
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 400);
          assert.equal(res.text, 'missing required field(s)');
          
          done();
        });
      });
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({})
        .end(function(err, res){
          assert.equal(res.status, 400);
          assert.equal(res.text, 'no updated field sent');
          
          done();
        });
      });
      
      test('One field to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: testableId,
          issue_text: 'updated'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          
          Issue.findById(testableId, (err, issue) => {
            assert.equal(issue.issue_text, 'updated');
            assert.notEqual(issue.updated_on, testableDate); // date is updated
            
            testableDate = issue.updated_on; // update test date for later test
          });
          
          done();
        });
      });
      
      test('Multiple fields to update', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: testableId,
          issue_text: 'updated again',
          assigned_to: 'Bob',
          open: 'false'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'successfully updated');
          
          Issue.findById(testableId, (err, issue) => {
            assert.equal(issue.issue_text, 'updated again');
            assert.equal(issue.assigned_to, 'Bob');
            assert.equal(issue.open, false);
            assert.notEqual(issue.updated_on, testableDate); // date is updated
          });
          
          done();
        });
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({
          open: false
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          res.body.forEach(item => assert.isFalse(item.open));
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({
          open: false,
          assigned_to: 'Bob'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          res.body.forEach(item => {
            assert.isFalse(item.open);
            assert.equal(item.assigned_to, 'Bob');
          });
          done();
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({})
        .end(function(err, res){
          assert.equal(res.status, 400);
          assert.equal(res.text, '_id error');
          
          done();
        });
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
        .delete('/api/issues/test')
        .send({
          _id: testableId
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal(res.text, 'deleted ' + testableId);
          
          done();
        });
      });
      
    });

});
