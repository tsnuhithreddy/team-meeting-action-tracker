/**
 * Async Error Handler Wrapper
 * Wraps asynchronous controller functions to forward any thrown errors to the global error middleware.
 */
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
