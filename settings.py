import logging
from logging.config import dictConfig
from datetime import datetime
import os, json, sys


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

CONFIG_DATA = None
# find environment name: local, dev, tst, stg, prd
def read_configuration_file(config_file_path):
    if os.path.isfile(config_file_path):
        with open(config_file_path, 'r') as logconf:
            return json.load(logconf)
    else:
        LOGGER.error("no configuration file found in the path of: "+ str(config_file_path) + "quitting..")
        sys.exit(0)

env = False
accepted_env = ['stg', 'prd', 'tst', 'dev', 'local']
if os.environ.get('env_name'):
    env = os.environ.get('env_name')
    if env in accepted_env:
        # read configuration file
        config_file_path = os.path.join(BASE_DIR, 'conf', str(env)+'_conf.json')
        LOGGER.info("configuration file path:{0}".format(config_file_path))
        CONFIG_DATA = read_configuration_file(config_file_path)
        LOGGER.info("configuration data is:{0}".format(CONFIG_DATA))
    else:
        LOGGER.error("environment variable must be in "+str(accepted_env)+ ". quitting...")
        exit()
    if env not in ['dev', 'local']:
        DEBUG=False
else:
    LOGGER.warn("no environment name specified. taking default env local...")
    #exit()
    config_file_path = os.path.join(BASE_DIR, 'conf', 'local_conf.json')
    CONFIG_DATA = read_configuration_file(config_file_path)

if not CONFIG_DATA:
    LOGGER.error("no configuration data found, quitting")
    exit()

# if no environment variable is given, default it will take local.
ENV_NAME = env
LOGGER.info("application env name:{0}".format(ENV_NAME))
# email constants
REGISTRATION_EMAIL_TEMPLATE = CONFIG_DATA['REGISTRATION_EMAIL_TEMPLATE']
MAIL_SERVER=CONFIG_DATA['MAIL_SERVER']
MAIL_PORT=CONFIG_DATA['MAIL_PORT']
MAIL_USE_SSL=CONFIG_DATA['MAIL_USE_SSL']
MAIL_USERNAME = CONFIG_DATA['MAIL_USERNAME']
MAIL_PASSWORD = CONFIG_DATA['MAIL_PASSWORD']

# logger configuration file
LOGGER_JSON_FILE = CONFIG_DATA['LOGGER_JSON_FILE']
PASSWORD_CRYPTION_TOKEN =CONFIG_DATA['PASSWORD_CRYPTION_TOKEN']
# server constants
HOST = CONFIG_DATA['HOST']
PORT = CONFIG_DATA['PORT']
DEBUG = CONFIG_DATA['DEBUG']
URL_PREFIX = CONFIG_DATA['URL_PREFIX']
API_VERSION = CONFIG_DATA['API_VERSION']

# LOCAL HOST MACHINE DETAILS
MONGO_HOST = CONFIG_DATA['MONGO_HOST']
MONGO_PORT = CONFIG_DATA['MONGO_PORT']
MONGO_USERNAME = CONFIG_DATA['MONGO_USERNAME']
MONGO_PASSWORD = CONFIG_DATA['MONGO_PASSWORD']
MONGO_DBNAME = CONFIG_DATA['MONGO_DBNAME']
MONGO_AUTHDBNAME = "admin"
#"""
#MONGO_URI = 'mongodb://t:t127.0.0.1:27017mongodb://@127.0.0.1:27027/admin'

TOKEN_SECRET = os.environ.get('SECRET_KEY') or 'JWT Token Secret String'

# let's not forget the API entry point (not really needed anyway)

XML = False

# Enable reads (GET), inserts (POST) and DELETE for resources/collections
# (if you omit this line, the API will default to ['GET'] and provide
# read-only access to the endpoint).
RESOURCE_METHODS = ['GET', 'POST']
# Enable reads (GET), edits (PATCH) and deletes of individual items
# (defaults to read-only item access).
ITEM_METHODS = ['GET', 'PATCH', 'DELETE','PUT']

IF_MATCH = False
# We enable standard client cache directives for all resources exposed by the
# API. We can always override these global settings later.
#CACHE_CONTROL = 'max-age=0'
#CACHE_EXPIRES = 0
MONGO_QUERY_BLACKLIST = ['$where']
# Our API will expose two resources (MongoDB collections): 'people' and
# 'works'. In order to allow for proper data validation, we define behaviour
# and structure.


SCHEMAS = {
    'persons': {
        'first_name': {
            'type': 'string',
            'required': True,
        },
        'last_name': {
            'type': 'string',
            'required': True
        },
        'email': {
            'type': 'string',
            'required': True,
            'unique': True
        },
        'email_confirmed': {
            'type': 'boolean',
            'default': False
        },
        'mobile_number': {
            'type': 'string',
            'required': True,
            'unique': True
        },
        'password': {
            'type': 'dict',
            'required': True,
            'schema': {
                'password': {'type': 'string'},
                'password_raw': {'type': 'string'},
                'last_password_updated_date': {
                    'type': 'datetime',
                    'empty': True
                }
            },
        },
        'pictures': {
            'type': 'dict',
            'schema': {
                'large': {'type': 'string', 'empty': True},
                'medium': {'type': 'string', 'empty': True},
                'thumbnail': {'type': 'string', 'empty': True}
            },
        },
        'city': {
            'type': 'string',
            'required': True
        },
        'age': {
            'type': 'integer',
            'required': True
        },
        'gender': {
            'type': 'string',
            'allowed': ["male", "female"],
            'required': True
        },
        'user_level': {
            'type': 'list',
            'allowed': CONFIG_DATA['APPLICATION_ROLES'],
            'required': True
        },
        'created_date': {
            'type': 'datetime',
            'default': datetime.now(),
            'required': True
        },
        'modified_date': {
            'type': 'datetime',
            'empty': True
        },
        'last_modified_by': {
            'type': 'objectid',
            'default': None,
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'persons',
                    'embeddable': True
                }
            }
        },
        'status': {
            'type': 'string',
            'default': 'inactive',
            'allowed': ['inactive', 'active', 'deleted']
        },
        'tokens': {
            'type': 'dict',
            'schema': {
                'registration': {'type': 'string', 'empty': True},
                'login': {'type': 'string', 'empty': True},
                'forgot_password': {'type': 'string', 'empty': True}
            },
        },
    },
    'stores':{
        'name': {
            'type': 'string',
            'required': True,
            'unique': True
        },
        'related_stores':{
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'stores',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        }
    }
}

PERSONS_SCHEMA = SCHEMAS['persons']
STORES_SCHEMA = SCHEMAS['stores']

PERSONS = {
    'item_title': 'persons',
    'schema': PERSONS_SCHEMA,
    'url': 'persons'
}

STORES = {
    'item_title': 'stores',
    'schema': STORES_SCHEMA
}
# The DOMAIN dict explains which resources will be available and how they will
# be accessible to the API consumer.
DOMAIN = {
    'persons': PERSONS,
    'stores':  STORES
}

COLLECTION_NAMES = DOMAIN.keys()