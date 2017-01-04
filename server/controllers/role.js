import db from '../models';

/**
 * Role class that handles all role related actions
 */
class Role {
  /**
   * Method that handles role creation
   * @param {Object} req
   * @param {Object} res
   * @return {Object} response with appropriate status message
   */
  static create(req, res) {
    db.Role.create({
      title: req.body.title
    })
      .then((role) => {
        res.status(201).send(role);
      })
      .catch((err) => {
        res.status(400).send(err.errors);
      });
  }

  /**
   * Method that handles retrieving roles
   * @param {Object} req
   * @param {Object} res
   * @return {Object} response with appropriate status message
   */
  static list(req, res) {
    db.Role.all()
      .then((role) => {
        res.status(201).send(role);
      })
      .catch((err) => {
        res.status(400).send(err.errors);
      });
  }
}

export default Role;
