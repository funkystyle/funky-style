from fab import app
from settings import DEBUG, PORT, HOST

# running server
if __name__ == '__main__':
    app.run(host=HOST, port=PORT, debug=DEBUG)