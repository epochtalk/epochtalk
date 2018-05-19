var Boom = require('boom');

const INTERNAL = 500;
const NOT_FOUND = 404;

var errorMap = {
  'IntegrityContraintViolationError': INTERNAL,
  'RestrictViolationError': INTERNAL,
  'NotNullViolationError': INTERNAL,
  'ForeignKeyViolationError': INTERNAL,
  'UniqueViolationError': INTERNAL,
  'CheckViolationError': INTERNAL,
  'ExclusionViolationError': INTERNAL,
  'CreationError': INTERNAL,
  'DeletionError': INTERNAL,
  'ConflictError': INTERNAL,
  'NotFoundError': NOT_FOUND
};

module.exports = {
  toHttpError: function(error) {
    var errCode = errorMap[error.name];
    var boomErr = Boom.boomify(error, errCode);
    boomErr.output.payload.message = error.message || boomErr.output.payload.message;
    return boomErr;
  }
};
