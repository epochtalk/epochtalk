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
    var errType = errorMap[error.name];

    var boomErr;
    if (errType) { boomErr = errType(); }
    else { boomErr = Boom.badImplementation(); }

    // Update boom error message
    boomErr.output.payload.message = error.message || boomErr.output.payload.message;
    return boomErr;
  }
};
