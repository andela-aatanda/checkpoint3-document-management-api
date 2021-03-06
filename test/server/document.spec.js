import request from 'supertest';
import chai from 'chai';
import app from '../../app';
import db from '../../server/models';
import testdata from '../testdata';

const expect = chai.expect;
const fakeUser = testdata.fakeUser;
const fakeAdmin = testdata.fakeAdmin;
const fakeAdminDocument = testdata.fakeAdminDoc;
const fakeUserDocument = testdata.fakeUserDoc;
const privateDoc = testdata.privateDoc;
const roleDoc = testdata.roleDoc;
const testDate = '2017-01-23';
const docId = 1;
const newDocTitle = { title: 'Sweet Talker' };
let adminToken;
let userToken;

describe('GET /document', () => {
  before((done) => {
    db.Document.sync({ force: true }).then(() => {
      return db.User.sync({ force: true }).then(() => {
        request(app)
          .post('/api/user').send(fakeAdmin)
          .then(res => {
            adminToken = res.body.token;
            request(app)
              .post('/api/user').send(fakeUser)
              .then(response => {
                userToken = response.body.token;
                done();
              });
          });
      });
    });
  });

  it('should create document with published date and public access', (done) => {
    request(app)
      .post('/api/document').send(fakeUserDocument)
      .set('Authorization', userToken)
      .end((err, res) => {
        expect(res.status).to.equal(201);
        expect(res.body.access).to.equal('public');
        expect(res.body.createdAt).to.be.defined;
        done();
      });
  });

  it('should return correct error status code for existing document', (done) => {
    request(app)
      .post('/api/document').send(fakeUserDocument)
      .set('Authorization', adminToken)
      .end((err, res) => {
        expect(res.status).to.equal(302);
        done();
      });
  });

  it('should create admin document', (done) => {
    request(app)
      .post('/api/document').send(fakeAdminDocument)
      .set('Authorization', adminToken)
      .end((err, res) => {
        expect(res.status).to.equal(201);
        done();
      });
  });

  it('should create new document', (done) => {
    request(app)
      .post('/api/document').send(privateDoc)
      .set('Authorization', adminToken)
      .end((err, res) => {
        expect(res.status).to.equal(201);
        done();
      });
  });

  it('should create new document', (done) => {
    request(app)
      .post('/api/document').send(roleDoc)
      .set('Authorization', adminToken)
      .end((err, res) => {
        expect(res.status).to.equal(201);
        done();
      });
  });

  it('should return document created on specified date', (done) => {
    request(app)
      .get(`/api/document?date=${testDate}`)
      .set('Authorization', adminToken)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('should return document of specified user', (done) => {
    request(app)
      .get('/api/document')
      .set('Authorization', adminToken)
      .end((err, res) => {
        expect(res.body.length).to.equal(4);
        done();
      });
  });

  it('should not return all documents to non admin user and not user\'s role', (done) => {
    request(app)
      .get('/api/document')
      .set('Authorization', userToken)
      .end((err, res) => {
        expect(res.body.length).to.equal(2);
        done();
      });
  });

  it('should return document of specified user', (done) => {
    request(app)
      .get('/api/user/1/document')
      .set('Authorization', adminToken)
      .end((err, res) => {
        expect(res.body[0].title).to.equal(fakeAdminDocument.title);
        done();
      });
  });

  it('should return bad request for non positive integer id', (done) => {
    request(app)
      .get('/api/user/-1/document')
      .set('Authorization', adminToken)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
  });

    it('should return not found for non existing user document', (done) => {
    request(app)
      .get('/api/user/7/document')
      .set('Authorization', adminToken)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
  });

  it('should return correct status code for unauthorized requests', (done) => {
    request(app)
      .get('/api/user/1/document')
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
  });

  it('should return error status code for unauthorized requests', (done) => {
    request(app)
      .post('/api/document').send(fakeAdminDocument)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
  });

  it('should return documents to authorized user', (done) => {
    request(app)
      .get('/api/document')
      .set('Authorization', adminToken)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('should return unauthorized for access without credentials', (done) => {
    request(app)
      .get('/api/document/Admin')
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
  });

  it('should return documents that can be accessed by specified role', (done) => {
    request(app)
      .get('/api/document/Regular')
      .set('Authorization', adminToken)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('should return documents that can be accessed by admin role', (done) => {
    request(app)
      .get('/api/document/Admin')
      .set('Authorization', adminToken)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('should order document when specified', (done) => {
    request(app)
      .get('/api/document?order=order')
      .set('Authorization', userToken)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('should limit document when specified', (done) => {
    request(app)
      .get('/api/document?limit=1')
      .set('Authorization', userToken)
      .end((err, res) => {
        expect(res.body.length).to.equal(1);
        done();
      });
  });

  it('should allow pagination', (done) => {
    request(app)
      .get('/api/document?page=3')
      .set('Authorization', adminToken)
      .end((err, res) => {
        expect(res.body.length).to.equal(1);
        done();
      });
  });

  it('should return bad request for negative limit', (done) => {
    request(app)
      .get('/api/document?limit=-1')
      .set('Authorization', userToken)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
  });

  it('should return error status code for unauthorized requests', (done) => {
    request(app)
      .get('/api/document')
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
  });

  it('should return correct updated attribute', (done) => {
    request(app)
      .put('/api/document/1').send(newDocTitle)
      .set('Authorization', adminToken)
      .end((err, res) => {
        expect(res.body.title).to.equal(newDocTitle.title);
        done();
      });
  });

  it('should return correct updated attribute', (done) => {
    request(app)
      .put('/api/document/-1').send(newDocTitle)
      .set('Authorization', adminToken)
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
  });

  it('should return error status code for unauthorized requests', (done) => {
    request(app)
      .put('/api/document/1')
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
  });

  it('should be able to delete document', (done) => {
    request(app)
      .delete(`/api/document?id=${docId}`)
      .set('Authorization', adminToken)
      .end((err, res) => {
        expect(res.body.message).to.equal('Document deleted');
        done();
      });
  });

  it('should not allow unauthorized requests to delete document', (done) => {
    request(app)
      .delete(`/api/document?id=${docId}`)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
  });
});
