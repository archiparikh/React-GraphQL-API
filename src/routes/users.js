const express = require('express');
const store = require('../data/store');
const { NotFoundError, ValidationError, ConflictError } = require('../errors');
const { isValidEmail } = require('../validators');

const router = express.Router();

/** GET /users — list all users */
router.get('/', (req, res) => {
  res.json(store.getAllUsers());
});

/** GET /users/:id — get a single user */
router.get('/:id', (req, res, next) => {
  const user = store.getUserById(req.params.id);
  if (!user) return next(new NotFoundError(`User ${req.params.id} not found`));
  res.json(user);
});

/** POST /users — create a user */
router.post('/', (req, res, next) => {
  const { name, email } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return next(new ValidationError('Field "name" is required'));
  }
  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return next(new ValidationError('Field "email" must be a valid email address'));
  }

  if (store.getUserByEmail(email)) {
    return next(new ConflictError(`Email "${email}" is already in use`));
  }

  const user = store.createUser(name.trim(), email.trim());
  res.status(201).json(user);
});

/** PUT /users/:id — replace a user */
router.put('/:id', (req, res, next) => {
  const { name, email } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return next(new ValidationError('Field "name" is required'));
  }
  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return next(new ValidationError('Field "email" must be a valid email address'));
  }

  const existing = store.getUserByEmail(email);
  if (existing && existing.id !== req.params.id) {
    return next(new ConflictError(`Email "${email}" is already in use`));
  }

  const user = store.updateUser(req.params.id, { name: name.trim(), email: email.trim() });
  if (!user) return next(new NotFoundError(`User ${req.params.id} not found`));
  res.json(user);
});

/** DELETE /users/:id — delete a user */
router.delete('/:id', (req, res, next) => {
  const deleted = store.deleteUser(req.params.id);
  if (!deleted) return next(new NotFoundError(`User ${req.params.id} not found`));
  res.status(204).send();
});

module.exports = router;
