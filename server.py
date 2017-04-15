import logging, jwt, uuid
from datetime import datetime, timedelta
from functools import wraps
from eve import Eve
from flask import request, jsonify, g, make_response
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash
from auth.views import EncrptDecrpt
from constants import *
from data_validations import Validations

app = Eve(static_url_path='/static')
encrypt_decrypt = EncrptDecrpt()

app.config.update(
	DEBUG=DEBUG,
    #EMAIL SETTINGS
	MAIL_SERVER=MAIL_SERVER,
	MAIL_PORT=MAIL_PORT,
	MAIL_USE_SSL=MAIL_USE_SSL,
	MAIL_USERNAME = MAIL_USERNAME,
	MAIL_PASSWORD = encrypt_decrypt.decryption(MAIL_PASSWORD)
)

mail=Mail(app)

# commonly used code
def create_token(user_id, days=60):
    payload = {
        'sub': str(user_id),
        'iat': datetime.now(),
        'exp': datetime.now() + timedelta(days=days)
    }
    token = jwt.encode(payload, TOKEN_SECRET)
    return token.decode('unicode_escape')

def parse_token(req):
    token = req.headers.get('Authorization').split()[1]
    return jwt.decode(token, TOKEN_SECRET)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.headers.get('Authorization'):
            response = jsonify(error='Missing authorization header')
            response.status_code = 401
            return response
        payload = parse_token(request)
        if datetime.fromtimestamp(payload['exp']) < datetime.now():
            response = jsonify(error='Token has expired')
            response.status_code = 401
            return response
        g.user_id = payload['sub']
        return f(*args, **kwargs)
    return decorated_function

# registration
@app.route('/api/1.0/auth/signup', methods=['POST'])
def signup():
    message = {}
    try:
        payload = request.json
        logger.info("signup payload request:{0}".format(payload))
        if 'password' not in payload:
            raise Exception('{0} field not found in input payload'.format('password', payload), 400)
        payload['password'] = {
                'password':str(generate_password_hash(request.json['password'])),
                'password_raw':str(request.json['password']),
                'last_password_updated_date':datetime.now()
        }
        payload['tokens'] = {
            'registration': '',
            'login': '',
            'forgot_password':''
        }
        payload['created_date'] = datetime.now()
        payload['email_confirmed'] = False
        payload['pictures'] = {
            'thumbnail': '',
            'large': '',
            'medium': ''
        }
        payload['modified_date'] = datetime.now()
        payload['status'] = 'inactive'
        # initiated persons collections to create new user
        validation = Validations('persons')
        violations = validation.validate_schema(payload, ['default', 'unique'])
        if violations:
            raise Exception(violations, 400)
        accounts = app.data.driver.db['persons']
        try:
            user = accounts.insert(payload)
            logger.info("user successfully created:{0}".format(user))
            user_id = str(user['_id'])
            registration_token = str(uuid.uuid4())
            accounts.update({'_id': user_id}, {'$set': {'tokens.registration': registration_token}})
            # registration email code.
            msg = Message('Confirm your Fab Promo Codes account',sender='Team@FabPromoCodes.in',recipients=[request.json['email']])
            with open(REGISTRATION_EMAIL_TEMPLATE, 'r') as _file:
                html_data = _file.read()
                msg.html = html_data.format(server_url=SERVER_NAME, user_id=user_id, token=registration_token)
            msg.html = ''
            mail.send(msg)

        except Exception as e:
            logger.error("got exception in signup:{0}".format(e.message))
            raise Exception(e.message, 400)
            #raise Exception("error message:{0}".format(e.message))
    except Exception as e:
        logger.error("got exception in signup last try block:{0}".format(e.message))
        response = jsonify(error=e[0], data=[])
        response.status_code = e[1]
        return response



@app.route('/')
def index():
    return make_response(open('static/app/index.html').read())


if __name__ == '__main__':
    logger = logging.getLogger(__name__)
    app.run()