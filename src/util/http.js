const axios = require("axios");
const _ = require("lodash");
const CircularJSON = require("circular-json");
const { HTTPError } = require("./error");

function http(config) {
  return new Promise((resolve, reject) => {
    axios
      .request(config)
      .then(response => {
        let res = {
          status: response.status,
          data: response.data,
          headers: response.headers
        };
        resolve(res);
      })
      .catch(err => {
        let statusCode = _.get(err, "response.status") || 500;
        let data = {
          body: _.get(err, "response.data"),
          request: _.get(err, "config")
        };
        let error = new HTTPError(
          statusCode,
          {
            message: _.get(err, "message")
          },
          data
        );
        reject(error);
      });
  });
}

module.exports = {
  http
};
