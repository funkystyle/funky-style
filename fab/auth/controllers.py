from datetime import  datetime, timedelta
import jwt, uuid, logging
from flask import jsonify, request,make_response, g, session
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from flask_mail import Mail, Message
from fab import app, Validations, mail, convert_object_dates_to_string, delete_some_keys_from_dict
from settings import *
from bson.objectid import ObjectId

LOGGER = logging.getLogger(__name__)

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

@app.route('/api/1.0/auth/me', methods=['GET'])
def me():
    if 'user_id' in session:
        accounts = app.data.driver.db['persons']
        try:
            user = accounts.find_one({'_id': ObjectId(session['user_id'])})
        except Exception as e:
            response = jsonify(error='logged user not found in database please contact :{0}'.format(CONFIG_DATA['FAB_SUPPORT_TEAM']))
            response.status_code = 401
            return response
        json_user = convert_object_dates_to_string(user, ['_id', 'created_date', 'modified_date',
                                                          'last_modified_by',''])
        del_some_keys = delete_some_keys_from_dict(json_user, ['password'])

        response = jsonify(error='', data = del_some_keys)
        response.status_code = 200
        return response
    response = jsonify(error='user not logged in.')
    response.status_code = 401
    return response

@app.route('/api/1.0/auth/login', methods=['POST'])
def login():
    try:
        accounts = app.data.driver.db['persons']
        user = accounts.find_one({'email': request.json['email']})
        if not user:
            response = jsonify(error='Your email does not exist')
            response.status_code = 401
            return response
        if user['email_confirmed']:
            response = jsonify(error='Email is not confirmed')
            response.status_code = 401
            return response
        if not user or not check_password_hash(user['password']['password'], request.json['password']):
            response = jsonify(error='Wrong Email or Password')
            response.status_code = 401
            return response
        token = create_token(user)
        user['login_token'] = token
        del user['tokens']
        del user['password']
        accounts.update({'email': request.json['email']}, {"$set": {'tokens.login': token}})
        json_user = convert_object_dates_to_string(user, ['_id', 'created_date', 'modified_date',
                                                          'last_modified_by',''])

        session['user_id'] = json_user['_id']
        session['user_level'] = json_user['user_level']
        g.user = json_user
        response = jsonify(data=json_user, errors = [])
        response.status_code = 200
        return response
    except Exception as e:
        response = jsonify(errors=e.message, data=[])
        response.status_code = 401
        return response

# registration
@app.route('/api/1.0/auth/signup', methods=['POST'])
def signup():
    try:

        payload = request.json
        LOGGER.info("signup payload request:{0}".format(payload))
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
        user_email = accounts.find_one({'email': request.json['email']})
        if not user_email:
            raise Exception("email:{0} already exists.".format(user_email), 400)
        try:
            user_id = str(accounts.insert(payload))
            LOGGER.info("user successfully created:{0}".format(user_id))
            registration_token = str(uuid.uuid4())
            LOGGER.info("updating registration token:{0} for user id:{1}".format(registration_token, user_id))
            accounts.update({'_id': ObjectId(user_id)}, {'$set': {'tokens.registration': registration_token}})
            # registration email code.
            msg = Message('Confirm your Fab Promo Codes account',sender='Team@FabPromoCodes.in',recipients=[request.json['email']])
            with open(REGISTRATION_EMAIL_TEMPLATE, 'r') as _file:
                html_data = _file.read()
                msg.html = html_data.format(server_url=HOST+':'+str(PORT), user_id=user_id, token=registration_token)
            if mail.send(msg):
                LOGGER.info("email sent with registration token:{0} of user_id:{1}".format(registration_token, user_id))
            else:
                LOGGER.info("email sent failed with registration token:{0} of user_id:{1}".format(registration_token, user_id))
            payload['_id'] = user_id
            response = jsonify(errors=[], data=payload)
            response.status_code = 201
            return response
        except Exception as e:
            LOGGER.error("got exception in signup:{0}".format(e.message))
            raise Exception(e.message, 400)
    except Exception as e:
        LOGGER.error("got exception in signup last try block:{0}".format(e.message))
        response = jsonify(errors=e[0], data=[])
        response.status_code = e[1]
        return response

@app.route('/')
def index():
    return make_response(open('static/app/index.html').read())

