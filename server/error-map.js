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
    if (errType) {
     boomErr = errType(null, error);

     // Update boom error message
     boomErr.output.payload.message = error.message || boomErr.output.payload.message;
    }
    else { boomErr = Boom.badImplementation(null, error); }

    // Copy stack from original error
    boomErr.stack = error.stack;

    return boomErr;
  }
};
