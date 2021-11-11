module.exports = (validator) => {
  return (req, res, next) => {
    const { error } = validator(req.body);

    if (!error) {
      next();
    } else {
      return res
        .status(400)
        .json({ success: false, error: error.details[0].message });
    }
  };
};
