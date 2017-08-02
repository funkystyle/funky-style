from fab import app
from settings import PORT, HOST, DEBUG

# running server
if __name__ == '__main__':
    app.run(host=HOST, port=PORT, use_reloader=DEBUG)