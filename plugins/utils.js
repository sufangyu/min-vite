const { Readable } = require('stream');

/**
 * 读取文件内容
 * @param {*} stream 
 * @returns 
 */
async function readBody(stream) {
  if (stream instanceof Readable) {
    return new Promise((resolve, reject) => {
      let res = '';
      stream.on('data', (data) => res += data);
      stream.on('end', () => resolve(res));
      stream.on('error', (e) => reject(e));
    })
  } else {
    return stream.toString();
  }
}

module.exports = {
  readBody,
};