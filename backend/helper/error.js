function genInvErr(err, errTitle, errMessage, metaData) {
  const invErr = {
    stack: err.stack,
    message: err.message,
    dynamicError: {
      errTitle,
      errMessage,
      metaData,
    },
  };

  return invErr;
}

module.exports = {
  genInvErr,
};
