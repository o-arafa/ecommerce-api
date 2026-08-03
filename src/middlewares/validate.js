const { z } = require('zod');

const validate = (schema) => {
  return (req, res, next) => {
    try {
        const cleanData = schema.parse(req.body);
        req.body = cleanData;
        next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = validate;