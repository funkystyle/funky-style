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
        DEBUG=True


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

MAX_CONTENT_LENGTH =1024 * 1024 * 1024 # 1024 MB
PAGINATION_LIMIT=50000



# logger configuration file
LOGGER_JSON_FILE = CONFIG_DATA['LOGGER_JSON_FILE']
PASSWORD_CRYPTION_TOKEN =CONFIG_DATA['PASSWORD_CRYPTION_TOKEN']
# server constants
HOST = CONFIG_DATA['HOST']
SERVER_URL = CONFIG_DATA['SERVER_URL']
PORT = CONFIG_DATA['PORT']
DEBUG = CONFIG_DATA['DEBUG']
URL_PREFIX = CONFIG_DATA['URL_PREFIX']
API_VERSION = CONFIG_DATA['API_VERSION']
PROTOCAL = CONFIG_DATA['PROTOCAL']

IGNORE_COLLECTION_NAMES = CONFIG_DATA['IGNORE_COLLECTION_NAMES']
PRIORITY = CONFIG_DATA['PRIORITY']

INDEX_XML_TEMPLATE = CONFIG_DATA['INDEX_XML_TEMPLATE']
SUB_FILE_TEMPLATE = CONFIG_DATA['SUB_FILE_TEMPLATE']
LOOK_UP_FIELDS = CONFIG_DATA['LOOK_UP_FIELDS']

PRIORITY = CONFIG_DATA['PRIORITY']

EXTRA_URLS = CONFIG_DATA['EXTRA_URLS']

XML_FILES_FOLDER = CONFIG_DATA['XML_GENERATOR_FILE_PATH']

# LOCAL HOST MACHINE DETAILS
MONGO_HOST = CONFIG_DATA['MONGO_HOST']
MONGO_PORT = CONFIG_DATA['MONGO_PORT']
MONGO_USERNAME = CONFIG_DATA['MONGO_USERNAME']
MONGO_PASSWORD = CONFIG_DATA['MONGO_PASSWORD']
MONGO_DBNAME = CONFIG_DATA['MONGO_DBNAME']
MONGO_AUTHDBNAME = "admin"
#"""
#MONGO_URI = 'mongodb://t:t127.0.0.1:27017mongodb://@127.0.0.1:27027/admin'

TOKEN_SECRET = CONFIG_DATA['PASSWORD_CRYPTION_TOKEN']#os.environ.get('SECRET_KEY') or 'JWT Token Secret String'

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
    'deep_link':{
        'is_default':{
           'type': 'boolean',
            'default': False
        },
        'tags': {
            'type': 'dict',
            'schema': {
                'tags': {'type': 'string'},
                'replace': {'type': 'boolean'}
            }
        },
        'affiliate_network': {
            'type': 'string',
            'required': True,
            'unique': True
        },
        'start_url': {
            'type': 'dict',
            'schema': {
                    'url': {'type': 'string'},
                    'encode': {'type': 'boolean', 'default': False}
            }
        },
        'end_url': {
            'type': 'dict',
            'schema': {
                    'url': {'type': 'string'},
                    'encode': {'type': 'boolean', 'default': False}
            }
        },
        "encode_main_url":{
            'type': 'boolean', 'default': False
        },
        'replace': {
            'type': 'list',
            'schema':{
                'type': 'dict',
                'schema': {
                    'replace_string': {'type': 'string'},
                    'find_string': {'type': 'string'},
                    'encode': {'type': 'boolean', 'default': False}
                 }
             }
        },
        'created_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        }
    },
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
            'type': 'string',
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
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
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
        'fav_stores': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'stores',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'fav_coupons': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'coupons',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        }
    },
    'stores':{
        "number_of_clicks": {
            "type": "integer",
            "default": 0
        },
        'name': {
            'type': 'string',
            'required': True,
            'unique': True
        },
        'url': {
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
        },
        'related_coupons': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'coupons',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'related_deals': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'deals',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'image':{
            'type': 'string'
        },
        'top_description':{
            'type': 'string'
        },
        'footer_description': {
            'type': 'string'
        },
        'h1': {
            'type': 'string'
        },
        'h2': {
            'type': 'string'
        },
        'top_stores': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'stores',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'featured_store': {
            'type': 'boolean'
        },
        'rating':{
            'type': 'float'
        },
        'side_banner': {
            'type': 'string'
        },
        'side_banner_url': {
            'type': 'string'
        },
        'top_banner': {
            'type': 'string'
        },
        'top_banner_url': {
            'type': 'string'
        },
        'meta_title':{
            'type': 'string'
        },
        'meta_description': {
            'type': 'string'
        },
        'top_catagory_store': {
          'type': 'list',
          'schema': {
              'type': 'objectid',
              'data_relation': {
                  'resource': 'categories',
                  'embeddable': True,
                  'field': '_id'
              }
          }
        },
        'all_tag_image': {
            'type': 'string'
        },
        'image_text':{
            'type': 'string'
        },
        'twitter_id':{
            'type': 'string'
        },
        'breadcrumb':{
            'type': 'list'
        },
        'number_of_deals': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'deals',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'twitter_url': {
            'type': 'string'
        },
        'facebook_url': {
            'type': 'string'
        },
        'google_plus_url': {
            'type': 'string'
        },
        'pintrest_url': {
            'type': 'string'
        },
        'youtube_url': {
            'type': 'string'
        },
        'store_address': {
            'type': 'string'
        },
        'store_email_id': {
            'type': 'string'
        },
        'contact_number': {
            'type': 'string'
        },
        'store_url': {
            'type': 'string'
        },
        'status': {
            'type': 'boolean'
        },
        'number_of_coupons': {
            'type': 'integer'
        },
        'menu': {
            'type': 'string'
        },
        'last_modified_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True,
                'field': '_id'
            }

        },
        'created_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        }
    },
    'categories':{
        "number_of_clicks": {
            "type": "integer",
            "default": 0
        },
        'name': {
            'type': 'string',
            'required': True,
            'unique': True
        },
        'url': {
            'type': 'string',
            'required': True,
            'unique': True
        },
        'image': {
            'type': 'string'
        },
        'top_description': {
            'type': 'string'
        },
        'footer_description': {
            'type': 'string'
        },
        'h1': {
            'type': 'string'
        },
        'h2': {
            'type': 'string'
        },
        'related_categories': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'categories',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'related_coupons': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'coupons',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'related_deals': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'deals',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'top_stores': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'stores',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'top_categories': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'categories',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'side_banner': {
            'type': 'string'
        },
        'side_banner_url': {
            'type': 'string'
        },
        'top_banner': {
            'type': 'string'
        },
        'top_banner_url': {
            'type': 'string'
        },
        'featured_category':{
            'type': 'boolean'
        },
        'seo_title':{
            'type': 'string'
        },
        'seo_description':{
            'type': 'string'
        },
        'alt_image':{
            'type': 'string'
        },
        'image_text':{
            'type': 'string'
        },
        'rating':{
            'type': 'float'
        },
        'breadcrumb':{
            'type': 'list'
        },
        'status':{
            'type': 'boolean'
        },
        'category_type':{
            'type': 'string'
        },
        'menu': {
            'type': 'string'
        },
        'last_modified_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        },
        'created_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        }
    },
    "deals": {
        "number_of_clicks":{
            "type": "integer",
            "default": 0
        },
        'dynamic_fields': {
            'type': 'dict'
        },
        "name": {
            "unique":True,
            "required": True,
            "type": "string",
        },
        'deal_type': {
            "type": "string"
        },
        'deal_video': {
            "type": "string"
        },
        'url': {
            "unique":True,
            "required": True,
            "type": "string"
        },
        'destination_url': {
            "unique":True,
            "required": True,
            "type": "string"
        },
        'description': {
            "type": "string"
        },
        'images': {
            "type": "list"
        },
        'breadcrumb': {
            "type": "list"
        },
        'actual_price': {
            "type": "float"
        },
        'discount_price': {
            "type": "float"
        },
        'rating': {
            "type": "float"
        },
        'deal_brands': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'deal_brands',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'deal_category': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'deal_categories',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'stores': {
            'type': 'list',
            'schema': {
                'type': 'dict',
                'schema': {
                    'store' : {
                        'type': 'objectid',
                        'data_relation': {
                            'resource': 'stores',
                            'embeddable': True
                        }
                    },
                    'actual_price': {'type': 'float'},
                    'discount_price': {'type': 'float'},
                    'landing_page': {'type': 'string'}
                }
            }
        },
        'store_temp': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'stores',
                'embeddable': True,
                'field': '_id'
            }
        },
        'featured_deal': {
            "type": "boolean"
        },
        'expired_date':{
            "type": "datetime"
        },
        'h1': {
            "type": "string"
        },
        'h2': {
            "type": "string"
        },
        'seo_title': {
            "type": "string"
        },
        'seo_description': {
            "type": "string"
        },
        'status': {
            "type": "boolean"
        },
        'upcoming': {
            "type": "boolean"
        },
        'top_banner': {
            "type": "string"
        },
        'side_banner': {
            "type": "string"
        },
        'related_deals': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'deals',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'last_modified_by':{
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        },
        'created_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        }
    },
    'coupons':{
        "number_of_clicks": {
            "type": "integer",
            "default": 0
        },
        'title': {
            "required": True,
            "unique": True,
            "type": "string",
        },
        'description': {
            "type": "string"
        },
        'coupon_type': {
            "type": "string"
        },
        'coupon_code': {
            "type": "string"
        },
        'coupon_sorting': {
            'type': 'integer'
        },
        'destination_url': {
            "type": "string"
        },
        'discount_type': {
            "type": "string"
        },
        'discount': {
            "type": "string"
        },
        'expire_date': {
            "type": "datetime"
        },
        'featured_coupon': {
            "type": "boolean"
        },
        'related_stores': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'stores',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'recommended_stores': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'stores',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'related_categories': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'categories',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'deal_of_the_day': {
            "type": "boolean"
        },
        'status': {
            "type": "string"
        },
        'last_modified_by':{
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        },
        'created_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        }
    },
    'master_seo':{
        'meta_title': {
            "type": "string"
        },
        'meta_description': {
            "type": "string"
        },
        'h1': {
            "type": "string"
        },
        'h2': {
            "type": "string"
        },
        'selection_type': {
            "type": "dict",
            "unique": True
        },
        'status': {
            "type": "boolean"
        },
        'last_modified_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        },
        'created_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        }
    },
    'banner': {
        'title': {
            "type": "string",
            "required":True
        },
        'image': {
            "type": "string",
            "required": True
        },
        'image_text': {
            "type": "string"
        },
        'expired_date': {
            "type": "datetime"
        },
        'deal_of_the_day_banner': {
            "type": "string"
        },
        'destination_url': {
            "type": "string"
        },
        'status': {
            "type": "boolean"
        },
        'top_banner_string':{
          'type': 'string'
        },
        'side_banner_string':{
          'type': 'string'
        },
        'last_modified_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        },
        'created_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        }
    },
    'cms_pages': {
        'name': {
            "type": "string",
            "unique": True,
            "required": True
        },
        'url': {
            "type": "string",
            "unique": True,
            "required": True
        },
        'description': {
            "type": "string"
        },
        'seo_title': {
            "type": "string"
        },
        'seo_description': {
            "type": "string"
        },
        'h1': {
            "type": "string"
        },
        'status': {
            'type': 'boolean'
        },
        'last_modified_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        },
        'created_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        }
    },
    'deal_categories_collection': {
        "number_of_clicks": {
            "type": "integer",
            "default": 0
        },
        'name': {
            "type": "string",
            "unique": True,
            "required": True
        },
        'url': {
            "type": "string",
            "unique": True,
            "required": True
        },
        'featured': {
            "type": "boolean"
        },
        'top_description': {
            "type": "string"
        },
        'footer_description': {
            "type": "string"
        },
        'alt_image': {
            "type": "string"
        },
        'image': {
            "type": "string"
        },
        'h1': {
            "type": "string"
        },
        'h2': {
            "type": "string"
        },
        'seo_title': {
            "type": "string"
        },
        'seo_description': {
            "type": "string"
        },
        'status': {
            'type': 'boolean'
        },
        'rating': {
            'type': 'float'
        },
        'related_categories':{
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'deal_categories',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'last_modified_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        },
        'created_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        },
        'fields': {
            'type': 'list',
            'schema': {
                'type': 'dict',
                'schema': {
                    'field_name': {'type': 'string'},
                    'field_type': {'type': 'string'}
                }
            }
        }

    },
    'deal_brands': {
        "number_of_clicks": {
            "type": "integer",
            "default": 0
        },
        'name': {
            "type": "string",
            "unique": True,
            "required": True
        },
        'url': {
            "type": "string",
            "unique": True,
            "required": True
        },
        'top_description': {
            "type": "string"
        },
        'footer_description': {
            "type": "string"
        },
        'featured': {
            "type": "boolean"
        },
        'image': {
            "type": "string"
        },
        'alt_image': {
            "type": "string"
        },
        'h1': {
            "type": "string"
        },
        'h2': {
            "type": "string"
        },
        'seo_title': {
            "type": "string"
        },
        'seo_description': {
            "type": "string"
        },
        'status': {
            'type': 'boolean'
        },
        'rating': {
            'type': 'float'
        },
        'related_brands':{
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'deal_brands',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'last_modified_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        },
        'created_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        }
    },
    'coupon_reports': {
        'user': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        },
        'coupon': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'coupons',
                'embeddable': True
            }
        },
        'status': {
            'type': 'boolean'
        },
        'issue': {
            'type': 'string'
        },
        'description': {
            'type': 'string'
        }
    },
    'coupon_comments': {
        'user': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        },
        'coupon': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'coupons',
                'embeddable': True
            }
        },
        'status': {
            'type': 'boolean'
        },
        'comment': {
            'type': 'string'
        }

    },
    'blog': {
        'title': {
            "type": "string",
            "unique": True,
            "required": True
        },
        'url': {
            "type": "string",
            "unique": True,
            "required": True
        },
        'related_categories': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'categories',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'related_blogs': {
            'type': 'list',
            'schema': {
                'type': 'objectid',
                'data_relation': {
                    'resource': 'blog',
                    'embeddable': True,
                    'field': '_id'
                }
            }
        },
        'description': {
            "type": "string"
        },
        'image': {
            "type": "string"
        },
        'h1': {
            "type": "string"
        },
        'h2': {
            "type": "string"
        },
        'seo_title': {
            "type": "string"
        },
        'seo_description': {
            "type": "string"
        },
        'status': {
            'type': 'string'
        },
        'rating': {
            'type': 'float'
        },
        'last_modified_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        },
        'breadcrumb': {
            'type': 'list',
            'required': True
        },
        'created_by': {
            'type': 'objectid',
            'data_relation': {
                'resource': 'persons',
                'embeddable': True
            }
        }
    },
    'user_favourites': {
        'user_id': {
            'type': 'objectid',
            "unique": True,
            "required": True,
            'data_relation': {
                'resource': 'persons',
                'embeddable': True,
                'field': '_id'
            }
        }
    }

}

PERSONS_SCHEMA = SCHEMAS['persons']
STORES_SCHEMA = SCHEMAS['stores']


DEALS_SCHEMA = SCHEMAS['deals']
CATEGORIES_SCHEMA = SCHEMAS['categories']
COUPONS_SCHEMA = SCHEMAS['coupons']
CMS_PAGES_SCHEMA = SCHEMAS['cms_pages']
DEAL_CATEGORIES_SCHEMA = SCHEMAS['deal_categories_collection']
DEAL_BRANDS_SCHEMA = SCHEMAS['deal_brands']
BANNER_SCHEMA = SCHEMAS['banner']
MASTER_SEO_SCHEMA = SCHEMAS['master_seo']
COUPON_REPORTS_SCHEMA = SCHEMAS['coupon_reports']
COUPONS_COMMENTS_SCHEMA = SCHEMAS['coupon_comments']
BLOG_SCHEMA = SCHEMAS['blog']
DEEP_LINK_SCHEMA = SCHEMAS['deep_link']
USER_FAV_SCHEMA = SCHEMAS['user_favourites']



PERSONS = {
    'item_title': 'persons',
    'schema': PERSONS_SCHEMA,
    'url': 'persons'
}
USER_FAV_COLLECTION = {
    'item_title': 'user_favs',
    'schema': USER_FAV_SCHEMA,
    'url': 'user-favs'
}
STORES = {
    'item_title': 'stores',
    'schema': STORES_SCHEMA,
    'additional_lookup': {
        'url': 'regex("[\w\-]+")',
        'field': 'url'
    }
}

DEEP_LINK = {
    'item_title': 'deep_link',
    'schema': DEEP_LINK_SCHEMA,
    'additional_lookup': {
        'url': 'regex("[\w\-]+")',
        'field': 'affiliate_network'
    }
}

DEALS = {
    'item_title': 'deals',
    'allow_unknown': True,
    'additional_lookup': {
        'url': 'regex("[\w\-]+")',
        'field': 'url'
    },
    'schema': DEALS_SCHEMA
}

CATEGORIES = {
    'item_title': 'categories',
    'schema': CATEGORIES_SCHEMA,
    'additional_lookup': {
        'url': 'regex("[\w\-]+")',
        'field': 'url'
    }
}

CMS_PAGES = {
    'item_title': 'cms_pages',
    'schema': CMS_PAGES_SCHEMA,
    'additional_lookup': {
        'url': 'regex("[\w\-]+")',
        'field': 'url'
    }
}

COUPONS = {
    'item_title': 'coupons',
    'schema': COUPONS_SCHEMA
}

DEAL_CATEGORIES = {
    'item_title': 'deal_categories',
    'schema': DEAL_CATEGORIES_SCHEMA,
    'additional_lookup': {
        'url': 'regex("[\w\-]+")',
        'field': 'url'
    }
}

DEAL_BRANDS = {
    'item_title': 'deal_brands',
    'schema': DEAL_BRANDS_SCHEMA,
    'additional_lookup': {
        'url': 'regex("[\w\-]+")',
        'field': 'url'
    }
}

BANNER = {
    'item_title': 'banner',
    'schema': BANNER_SCHEMA
}

MASTER_SEO = {
    'item_title': 'master_seo',
    'schema': MASTER_SEO_SCHEMA
}

COUPON_REPORTS ={
    'item_title': 'coupon_reports',
    'schema': COUPON_REPORTS_SCHEMA
}

COUPONS_COMMENTS = {
    'item_title': 'coupon_comments',
    'schema': COUPONS_COMMENTS_SCHEMA
}

BLOG = {
    'item_title': 'blog',
    'schema': BLOG_SCHEMA,
    'additional_lookup': {
        'url': 'regex("[\w\-]+")',
        'field': 'url'
    }
}



# The DOMAIN dict explains which resources will be available and how they will
# be accessible to the API consumer.
DOMAIN = {
    'persons': PERSONS,
    'stores':  STORES,
    'deals': DEALS,
    'categories': CATEGORIES,
    'coupons':  COUPONS,
    'cms_pages': CMS_PAGES,
    'deal_brands': DEAL_BRANDS,
    'deal_categories': DEAL_CATEGORIES,
    'banner': BANNER,
    'master_seo': MASTER_SEO,
    'coupons_comments': COUPONS_COMMENTS,
    'coupons_reports': COUPON_REPORTS,
    'blog': BLOG,
    'deep_link': DEEP_LINK,
    'user_favs': USER_FAV_COLLECTION
}

COLLECTION_NAMES = DOMAIN.keys()