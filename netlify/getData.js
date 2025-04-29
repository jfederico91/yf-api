exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: "OK " + JSON.stringify(event.queryStringParameters)
  };
};

