var _ = require('lodash');
var Promise = require('bluebird');

var errorTemplate = function(name) {
  return function (message, extra) {
    const error = new Promise.OperationalError(message ? message : undefined);
    Error.captureStackTrace(error, this.constructor);
    error.name = name;
    error.extra = extra;
    return error;
  };
};

// Postgres error codes that we expect to handle
var pgErrorMap = {
  '23000': errorTemplate('IntegrityContraintViolationError'),
  '23001': errorTemplate('RestrictViolationError'),
  '23502': errorTemplate('NotNullViolationError'),
  '23503': errorTemplate('ForeignKeyViolationError'),
  '23505': errorTemplate('UniqueViolationError'),
  '23514': errorTemplate('CheckViolationError'),
  '23P01': errorTemplate('ExclusionViolationError')
};

// map handled Postgres errors to our own custom error types
function handlePgError(error) {
  // If code is not present, error is not a pg error
  if (!error.code) { throw error; }

  // map to the correct custom error or return a generic PostgresError
  var ErrorType = _.get(pgErrorMap, error.code, errorTemplate('PostgresError'));
  // initialize the error with details and code
  var pgError = new ErrorType(error.detail || error.message, error.code);

  throw pgError;
}

var errors = {
  CreationError: errorTemplate('CreationError'),
  DeletionError: errorTemplate('DeletionError'),
  NotFoundError: errorTemplate('NotFoundError'), // 404
  BadRequestError: errorTemplate('BadRequestError'), // 400
  ConflictError: errorTemplate('ConflictError'),
  handlePgError: handlePgError
};

module.exports = errors;
