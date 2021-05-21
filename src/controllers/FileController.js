const path = require('path');

class FileController {
  async download(request, response) {
    try {
      const { filename } = request.params;

      return response.download(
        path.join(__dirname, `../../uploads/${filename}`)
      );
    } catch (error) {
      return response.status(500).send({ message: 'Internal server error' });
    }
  }
}

module.exports = new FileController();
