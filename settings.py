import os, json, logging
from datetime import datetime
from constants import *
from logging.config import dictConfig

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# setting logger configuration
LOG_JSON_FILE_PATH = os.path.join(BASE_DIR, 'conf', 'logging.json')
if os.path.isfile(LOG_JSON_FILE_PATH):
    with open(LOG_JSON_FILE_PATH, 'r') as _logconf:
        print("new logger initiated...")
        dictConfig(json.load(_logconf))
else:
    print("logger file:{0} configuration file found.".format(LOG_JSON_FILE_PATH))
LOGGER = logging.getLogger(__name__)
LOGGER.info("base dir path:{0}".format(BASE_DIR))

if os.environ.get('PORT'):
# We're hosted on Heroku! Use the MongoHQ sandbox as our backend.+
    LOGGER.info("application running in server environment")
    MONGO_HOST = MONGO_HOST
    MONGO_PORT = 27017
    MONGO_USERNAME = MONGO_USERNAME
    MONGO_PASSWORD = MONGO_PASSWORD
    MONGO_DBNAME = MONGO_DBNAME
# also, correctly set the API entry point+# SERVER_NAME = '127.0.0.1:8000' #10.240.115.93:27017'
else:
    # Running on local machine. Let's just use the local mongod instance.
    LOGGER.info("application running in local environment")
    MONGO_HOST = MONGO_HOST
    MONGO_PORT = MONGO_PORT
    MONGO_USERNAME = MONGO_USERNAME
    MONGO_PASSWORD = MONGO_PASSWORD
    MONGO_DBNAME = MONGO_DBNAME

URL_PREFIX = URL_PREFIX
API_VERSION = API_VERSION

TOKEN_SECRET = os.environ.get('SECRET_KEY') or 'JWT Token Secret String'

# let's not forget the API entry point (not really needed anyway)
SERVER_NAME = SERVER_NAME
DEBUG = DEBUG
XML = False

# Enable reads (GET), inserts (POST) and DELETE for resources/collections
# (if you omit this line, the API will default to ['GET'] and provide
# read-only access to the endpoint).
RESOURCE_METHODS = ['GET', 'POST', 'DELETE']
# Enable reads (GET), edits (PATCH) and deletes of individual items
# (defaults to read-only item access).
ITEM_METHODS = ['GET', 'PATCH', 'DELETE','PUT']

# We enable standard client cache directives for all resources exposed by the
# API. We can always override these global settings later.
#CACHE_CONTROL = 'max-age=0'
#CACHE_EXPIRES = 0
MONGO_QUERY_BLACKLIST = ['$where']
# Our API will expose two resources (MongoDB collections): 'people' and
# 'works'. In order to allow for proper data validation, we define behaviour
# and structure.

PERSONS_SCHEMA = SCHEMAS['persons']

PERSONS = {
    'item_title': 'persons',
    'schema': PERSONS_SCHEMA,
    'url': 'persons',
    'authentication': None
}

# The DOMAIN dict explains which resources will be available and how they will
# be accessible to the API consumer.
DOMAIN = {
    'persons': PERSONS
}
