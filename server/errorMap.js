var Boom = require('boom');

var errorMap = {
  'IntegrityContraintViolationError': Boom.badImplementation,
  'RestrictViolationError': Boom.badImplementation,
  'NotNullViolationError': Boom.badImplementation,
  'ForeignKeyViolationError': Boom.badImplementation,
  'UniqueViolationError': Boom.badImplementation,
  'CheckViolationError': Boom.badImplementation,
  'ExclusionViolationError': Boom.badImplementation,
  'CreationError': Boom.badImplementation,
  'DeletionError': Boom.badImplementation,
  'ConflictError': Boom.badImplementation,
  'NotFoundError': Boom.notFound
};

module.exports = {
  toHttpError: function(error) {
    return errorMap(error.name)(error.message) || Boom.badImplementation(error.message);
  }
};
