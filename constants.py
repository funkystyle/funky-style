from datetime import  datetime

# email constants
REGISTRATION_EMAIL_TEMPLATE = 'static/email_templates/registration_mail_link.html'
MAIL_SERVER='smtp.gmail.com'
MAIL_PORT=465
MAIL_USE_SSL=True
MAIL_USERNAME = 'satya.nani.40@gmail.com'
MAIL_PASSWORD = '73630002b4f7fa5f8def7ed0e9ac40c446402f42589582bf575f2e2c8aa8f56436ea7131fafc01fd6d559a0b2576f653373ad2b9ffe68ce7c496bf915a3551418a98c0f2ff5126c89a4c29b9c6a3797d0ea65b61e10e59'

# logger configuration file
LOGGER_JSON_FILE = 'logging.json'
PASSWORD_CRYPTION_TOKEN = "j++^1k=*raynr-mw(9ux=j#omk@=05p4g=-eg3&hwx5y7#cpo7"
# server constants
SERVER_NAME = 'localhost:8000'
DEBUG = True
URL_PREFIX = 'api'
API_VERSION = '1.0'

# LOCAL HOST MACHINE DETAILS
MONGO_HOST = '127.0.0.1'
MONGO_PORT = 27017
MONGO_USERNAME = 't'
MONGO_PASSWORD = 't'
MONGO_DBNAME = 'fb_db'

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
            'allowed': ["submitter", "editor", "admin"],
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
    }
}