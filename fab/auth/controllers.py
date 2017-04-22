from datetime import  datetime
import jwt, uuid
from flask import jsonify, request,make_response, g, session, abort
from werkzeug.security import generate_password_hash, check_password_hash

from bson.objectid import ObjectId
from fab import ReturnException, app, convert_object_dates_to_string, delete_some_keys_from_dict, Validations
from fab import send_fab_emails,parse_token

from settings import LOGGER, CONFIG_DATA, HOST, PORT

@app.route('/api/1.0/auth/send-forgot-password-link', methods=['POST'])
def forgotpassword():
    try:
        if 'email' not in request.json:
            raise ReturnException(message="email not found in payload", status_code=400)
        LOGGER.info("payload email is:{0}".format(request.json['email']))
        accounts = app.data.driver.db['persons']
        user = accounts.find_one({'email': request.json['email']})
        if not user:
            raise ReturnException(message="email not found in database.", status_code=400,payload=request.json)
        LOGGER.info("found user for forgot password:{0}".format(user))
        token = str(uuid.uuid4())
        if user['tokens']['forgot_password']:
            token = str(user['tokens']['forgot_password'])
        LOGGER.info("updating forgot password token:{0} for user id:{1}".format(token, user['_id']))
        accounts.update({'_id': ObjectId(str(user['_id']))}, {'$set': {'tokens.forgot_password': token}})
        # forgot password email code.
        if send_fab_emails(title=CONFIG_DATA['FORGOT_PASSWORD_TITLE'],
                   recipients=[request.json['email']],
                   sender=CONFIG_DATA['FAB_SUPPORT_TEAM'],
                   user_id=str(user['_id']),
                   token=token,
                   server_url=HOST + ':' + str(PORT),
                   template=CONFIG_DATA['FORGOT_PASSWORD_EMAIL_TEMPLATE']):
            response = jsonify(error='', data={"token": token, "user_id": str(user['_id'])})
            response.status_code = 200
            return response
        else:
            accounts.update({'_id': ObjectId(str(user['_id']))}, {'$set': {'tokens.forgot_password': ""}})
            abort(500, "failed to send forgot password email, please try again...")

    except Exception as e:
        LOGGER.error(str(e))
        abort(401, str(e))

@app.route('/api/1.0/auth/email-activation', methods=['POST'])
def email_activation():
    if 'user_id' not in request.json:
        message = "user_id not found in payload"
        abort(400, message)
    if 'token' not in request.json:
        message = "token not found in payload"
        abort(400, message)
    LOGGER.info("payload is:{0}".format(request.json))
    accounts = app.data.driver.db['persons']
    user = accounts.find_one(
        {'_id': ObjectId(str(request.json['user_id'])), "tokens.registration": request.json['token']})
    if not user:
        message = "invalid token or user_id."
        abort(400, message)
    LOGGER.info("found user for forgot password:{0}".format(user))
    if user['email_confirmed']:
        message = "email already confirmed."
        abort(400, message)
    accounts.update({'_id': ObjectId(str(request.json['user_id']))}, {"$set": {'tokens.registration': "", "email_confirmed": True}})
    message = "email has been confirmed."
    abort(400, message)


@app.route('/api/1.0/auth/logout', methods=['GET'])
def logout():
    try:
        accounts = app.data.driver.db['persons']
        accounts.update({'_id': ObjectId(str(session['user_id']))},{"$set": {'tokens.login': ""}})
        session.clear()
        response = jsonify(error='', data="successfully logged out.")
        response.status_code = 200
        return response
    except Exception as e:
        LOGGER.error(str(e))
        message = str(e)
        abort(401, message)

@app.route('/api/1.0/auth/change-password', methods=['POST'])
def change_password():
    try:
        if 'user_id' not in request.json:
            message = "user_id not found in payload"
            abort(400, message)

        if 'token' not in request.json:
            message="token not found in payload"
            abort(400, message)

        if 'new_password' not in request.json:
            message="new_password not found in payload"
            abort(400, message)

        LOGGER.info("payload is:{0}".format(request.json))
        accounts = app.data.driver.db['persons']
        user = accounts.find_one({'_id': ObjectId(str(request.json['user_id'])), "tokens.forgot_password": request.json['token']})
        if not user:
            message="invalid token or user_id."
            abort(400, message)

        LOGGER.info("found user for forgot password:{0}".format(user))
        payload = {
            'password':{
                'password': str(generate_password_hash(request.json['new_password'])),
                'password_raw': str(request.json['new_password']),
                'last_password_updated_date': datetime.now()
            }
        }
        accounts.update({'_id': ObjectId(str(user['_id']))}, {'$set': {'tokens.forgot_password': ""}})
        accounts.update({'_id': ObjectId(str(user['_id']))}, {'$set': payload})
        response = jsonify(error='', data={"new_password": request.json['new_password'], "message": "password has been changed."})
        response.status_code = 200
        return response
    except Exception as e:
        LOGGER.error(str(e))
        message = str(e)
        abort(401, message)


@app.route('/api/1.0/auth/me', methods=['GET'])
def me():
    LOGGER.info("called api/1.0/auth/me endpoint ...")
    if 'user_id' in session:
        accounts = app.data.driver.db['persons']
        user = accounts.find_one({'_id': ObjectId(session['user_id'])})
        if not user:
           error = 'logged user not found in database please contact :{0}'.format(CONFIG_DATA['FAB_SUPPORT_TEAM'])
           abort(401, error)
        LOGGER.info("user:{0}".format(user))
        json_user = convert_object_dates_to_string(user, ['_id', 'created_date', 'modified_date',
                                                          'last_modified_by',''])
        del_some_keys = delete_some_keys_from_dict(json_user, ['password'])

        response = jsonify(error='', data = del_some_keys)
        response.status_code = 200
        return response
    message = "user not logged in."
    abort(401, message)

@app.route('/api/1.0/auth/login', methods=['POST'])
def login():

    accounts = app.data.driver.db['persons']
    user = accounts.find_one({'email': request.json['email']})
    if not user:
        message = 'Your email does not exist'
        abort(401, message)
    if not user['email_confirmed']:
        message='Email is not confirmed'
        abort(401, message)

    if 'user_id' in session:
        message='User already logged in.'
        abort(401, message)

    if not user or not check_password_hash(user['password']['password'], request.json['password']):
        message='Wrong Email or Password'
        abort(401, message)

    token = str(uuid.uuid4())
    user['login_token'] = token
    del user['tokens']
    del user['password']
    accounts.update({'email': request.json['email']}, {"$set": {'tokens.login': token}})

    json_user = convert_object_dates_to_string(user, ['_id', 'created_date', 'modified_date',
                                                      'last_modified_by',''])

    session['user_id'] = json_user['_id']
    session['user_level'] = json_user['user_level']
    session['login_token'] = user['login_token']

    response = jsonify(data=json_user, errors = [])
    response.status_code = 200
    return response


# registration
@app.route('/api/1.0/auth/signup', methods=['POST'])
def signup():
    items = request.json
    if not isinstance(items, list):
        abort(400, 'payload should be list')
    for payload in items:
        LOGGER.info("signup payload request:{0}".format(payload))
        if 'password' not in payload:
            message = '{0} field not found in input payload'.format('password', payload)
            abort(400, message)

        payload['password'] = {
                'password':str(generate_password_hash(payload['password'])),
                'password_raw':str(payload['password']),
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
        payload['status'] = 'active'
        # check logged user can assign role or not otherwise default role will be 'user'
        can_assign = False
        if 'user_level' in payload and 'user_level' in session:
            for user_level in session['user_level']:
                if user_level in CONFIG_DATA['CREATE_USER_ROLES']:
                    can_assign = True
        if not can_assign:
            payload['user_level'] = ["user"]

        # initiated persons collections to create new user

        validation = Validations('persons')
        violations = validation.validate_schema(payload, ['default', 'unique'])
        if violations:
            abort(400, str(violations))
        accounts = app.data.driver.db['persons']
        user = accounts.find_one({'email': payload['email']})
        if user:
            abort(400, "email:{0} already exists.".format(user['email']))
        user = accounts.find_one({'mobile_number': payload['mobile_number']})
        if user:
            abort(400, "mobile_number:{0} already exists.".format(user['mobile_number']))
        try:
            user_id = str(accounts.insert(payload))
            LOGGER.info("user successfully created:{0}".format(user_id))
            registration_token = str(uuid.uuid4())
            LOGGER.info("updating registration token:{0} for user id:{1}".format(registration_token, user_id))
            accounts.update({'_id': ObjectId(user_id)}, {'$set': {'tokens.registration': registration_token}})
            # registration email code.

            if send_fab_emails(title=CONFIG_DATA['REGISTRATION_TITLE'],
                       recipients = [payload['email']],
                       sender=CONFIG_DATA['FAB_SUPPORT_TEAM'],
                       user_id=user_id,
                       token=registration_token,
                       server_url=HOST+':'+str(PORT),
                       template=CONFIG_DATA['REGISTRATION_EMAIL_TEMPLATE']):
                payload['mail_sent'] = True
                payload['main_sent_error'] = ''
            else:
                accounts.remove({'_id': ObjectId(user_id)})
                payload['mail_sent'] = False
                payload['main_sent_error'] = "failed to send registration email, please try again..."
            payload['_id'] = user_id
            payload['is_created'] = True
            payload['error'] = ''
        except Exception as e:
            LOGGER.error("got exception in signup:{0}".format(e))
            payload['is_created'] = False
            payload['error'] = str(e)
    response = jsonify(errors=[], data=items)
    response.status_code = 201
    return response

@app.route('/')
def index():
    LOGGER.info("called index point")
    return make_response(open('static/app/index.html').read())

