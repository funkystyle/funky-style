from datetime import  datetime
import jwt, uuid
from flask import jsonify, request,make_response, g, session, abort
from werkzeug.security import generate_password_hash, check_password_hash

from bson.objectid import ObjectId
from fab import ReturnException, app, convert_object_dates_to_string, delete_some_keys_from_dict, Validations
from fab import send_fab_emails,parse_token, send_admin_emails

from settings import LOGGER, CONFIG_DATA, HOST, PORT,DOMAIN, SCHEMAS, SERVER_URL, PASSWORD_CRYPTION_TOKEN

@app.route('/api/1.0/get-fields-info', methods=['POST'])
def get_fields_info():
    if 'collection_name' not in request.json:
        raise ReturnException(message="collection name not found in payload", status_code=400)
    if request.json['collection_name'] not in DOMAIN:
        raise ReturnException(message="collection name:{0} not found in databse"
                              .format(request.json['collection_name']), status_code=400)
    response = jsonify(error='', data={"fields_info": SCHEMAS[request.json['collection_name']]})
    response.status_code = 200
    return response

@app.route('/api/1.0/get-collections', methods=['GET'])
def get_collections():
    response = jsonify(error='', data={"collections": DOMAIN.keys()})
    response.status_code = 200
    return response

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
                   email=user['email'],
                   first_name= user['first_name'],
                   token=token,
                   server_url=SERVER_URL,
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
        if 'user_id' not in session:
            abort(400, "user not logged in.")
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
        q = {'_id': ObjectId(str(request.json['user_id']))}
        if not 'user_id' in session:
            q["tokens.forgot_password"] = request.json['token']
        elif session['user_id'] != str(request.json['user_id']):
            message = "something went wrong, please login and logout"
            abort(400, message)
        LOGGER.info("find query:{}".format(q))
        user = accounts.find_one(q)
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
        del_some_keys = delete_some_keys_from_dict(json_user, ['password','fav_stores', 'fav_coupons'])

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
    if 'fav_stores' in json_user:
        del json_user['fav_stores']
    if 'fav_coupons' in json_user:
        del json_user['fav_coupons']

    session['user_id'] = json_user['_id']
    session['user_level'] = json_user['user_level']
    session['login_token'] = user['login_token']

    print session, '*********************'

    response = jsonify(data=json_user, errors = [])
    response.status_code = 200
    return response



@app.route('/favicon.ico')
def favicon():
    LOGGER.info("called: favicon.ico")
    return make_response(open('static/app/customer-panel/index.html').read())

@app.route('/<path:dummy>')
def fallback(dummy):
    LOGGER.info("called dummy end point:{}".format(dummy))
    return make_response(open('static/app/customer-panel/index.html').read())

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
        if 'admin_creation_token' in payload:
            admin_creation_token = payload['admin_creation_token']
            del payload['admin_creation_token']
        else:
            admin_creation_token = None

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

        if admin_creation_token and admin_creation_token == PASSWORD_CRYPTION_TOKEN:
            payload['email_confirmed']=True

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
            payload['user_level'] = "user"

        if admin_creation_token and admin_creation_token == PASSWORD_CRYPTION_TOKEN:
            payload['user_level'] = "admin"


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

            if admin_creation_token and admin_creation_token == PASSWORD_CRYPTION_TOKEN:
                    if send_admin_emails(title=CONFIG_DATA['ADMIN_CREATION_TITLE'],
                                       recipients=[payload['email']],
                                       sender=CONFIG_DATA['FAB_SUPPORT_TEAM'],
                                       user_id=user_id,
                                       email=payload['email'],
                                       first_name=payload['first_name'],
                                       template=CONFIG_DATA['ADMIN_CREATION_EMAIL_TEMPLATE']):
                        payload['mail_sent'] = True
                        payload['main_sent_error'] = ''
                        payload['is_created'] = True
                        payload['_id'] = str(user_id)
                    else:
                        accounts.remove({'_id': ObjectId(user_id)})
                        payload['mail_sent'] = False
                        payload['is_created'] = False
                        payload['main_sent_error'] = "failed to send registration email, please try again..."
            else:
                registration_token = str(uuid.uuid4())
                LOGGER.info("updating registration token:{0} for user id:{1}".format(registration_token, user_id))
                accounts.update({'_id': ObjectId(user_id)}, {'$set': {'tokens.registration': registration_token}})
                # registration email code.
                if send_fab_emails(title=CONFIG_DATA['REGISTRATION_TITLE'],
                           recipients = [payload['email']],
                           sender=CONFIG_DATA['FAB_SUPPORT_TEAM'],
                           user_id=user_id,
                            email=payload['email'],
                            first_name=payload['first_name'],
                           token=registration_token,
                           server_url=SERVER_URL,
                           template=CONFIG_DATA['REGISTRATION_EMAIL_TEMPLATE']):
                    payload['mail_sent'] = True
                    payload['main_sent_error'] = ''
                    payload['is_created'] = True
                    payload['_id'] = str(user_id)
                else:
                    accounts.remove({'_id': ObjectId(user_id)})
                    payload['mail_sent'] = False
                    payload['is_created'] = False
                    payload['main_sent_error'] = "failed to send registration email, please try again..."
            payload['error'] = ''
        except Exception as e:
            LOGGER.error("got exception in signup:{0}".format(e))
            payload['is_created'] = False
            payload['error'] = str(e)
    response = jsonify(errors=[], data=items)
    response.status_code = 201
    return response

@app.route('/admin/')
def admin_index():
    LOGGER.info("called ADMIN panel index point")
    return make_response(open('static/app/admin-panel/index.html').read())

@app.route('/')
def index():
    LOGGER.info("called index point")
    return make_response(open('static/app/customer-panel/index.html').read())


