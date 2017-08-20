from functools import wraps
from flask import request, session,jsonify, abort
from settings import CONFIG_DATA, LOGGER

def check_token(client_token, server_token):
    splitted_token = client_token.split(" ")
    LOGGER.info("splitted_token:{}".format(splitted_token))
    if not len(splitted_token) >= 2:
        LOGGER.info("token length not greater than 2")
        return False
    if server_token != splitted_token[-1]:
        LOGGER.info("server_token:{}, splitted_token:{}".format(server_token, splitted_token[1]))
        return False
    return True

# user logging to application
def user_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.headers.get('Authorization'):
            LOGGER.info('Missing authorization header')
            error = 'Missing authorization header'
            abort(401, error)

        if 'login_token' not in session:
            LOGGER.info('user not logged in.')
            error = 'user not logged in.'
            abort(401, error)

        if check_token(request.headers.get('Authorization'),session['login_token']):
            LOGGER.info('token mis-matched.{0}<-->{1}'.format(request.headers.get('Authorization'), session['login_token']))
            error = 'token mis-matched.'
            abort(401, error)

        if 'user_level' not in session:
            LOGGER.info('user not logged in.')
            error = 'user not logged in.'
            abort(401, error)

        if not session['user_level']:
            LOGGER.info('user roles empty.')
            error = 'user not logged in.'
            abort(401, error)

        if session['user_level'] not in CONFIG_DATA['APPLICATION_ROLES']:
            LOGGER.info('Invalid user role of :{0}.'.format(session['user_id']))
            error = 'Invalid user role.'
            abort(401, error)

        LOGGER.info("user role:{0}, allowed roles:{1}".format(session['user_level'], CONFIG_DATA['APPLICATION_ROLES']))
        return f(*args, **kwargs)
    return decorated_function

# submitter logging to application
def submitter_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        allowed_roles = []
        allowed_roles.extend(CONFIG_DATA['SUBMITTER_ROLES'])
        allowed_roles.extend(CONFIG_DATA['ADMIN_ROLES'])
        if not request.headers.get('Authorization'):
            LOGGER.info('Missing authorization header')
            error = 'Missing authorization header'
            abort(401, error)

        if 'login_token' not in session:
            LOGGER.info('user not logged in.')
            error = 'user not logged in.'
            abort(401, error)

        if check_token(request.headers.get('Authorization'), session['login_token']):
            LOGGER.info('token mis-matched.{0}<-->{1}'.format(request.headers.get('Authorization'), session['login_token']))
            error = 'token mis-matched.'
            abort(401, error)

        if 'user_level' not in session:
            LOGGER.info('user not logged in.')
            error = 'user not logged in.'
            abort(401, error)

        if not session['user_level']:
            LOGGER.info('user roles empty.')
            error = 'user not logged in.'
            abort(401, error)

        if session['user_level'] not in allowed_roles:
            LOGGER.info('Invalid user role of :{0}.'.format(session['user_id']))
            error = 'Invalid user role.'
            abort(401, error)

        LOGGER.info("user role:{0}, allowed roles:{1}".format(session['user_level'], allowed_roles))

        return f(*args, **kwargs)
    return decorated_function

# editor logging to application
def editor_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        allowed_roles = []
        allowed_roles.extend(CONFIG_DATA['EDITOR_ROLES'])
        allowed_roles.extend(CONFIG_DATA['ADMIN_ROLES'])

        if not request.headers.get('Authorization'):
            LOGGER.info('Missing authorization header')
            error = 'Missing authorization header'
            abort(401, error)

        if 'login_token' not in session:
            LOGGER.info('user not logged in.')
            error = 'user not logged in.'
            abort(401, error)

        if check_token(request.headers.get('Authorization'), session['login_token']):
            LOGGER.info('token mis-matched.{0}<-->{1}'.format(request.headers.get('Authorization'), session['login_token']))
            error = 'token mis-matched.'
            abort(401, error)

        if 'user_level' not in session:
            LOGGER.info('user not logged in.')
            error = 'user not logged in.'
            abort(401, error)

        if not session['user_level']:
            LOGGER.info('user roles empty.')
            error = 'user not logged in.'
            abort(401, error)

        if session['user_level'] not in allowed_roles:
            LOGGER.info('Invalid user role of :{0}.'.format(session['user_id']))
            error = 'Invalid user role.'
            abort(401, error)



        LOGGER.info("user role:{0}, allowed roles:{1}".format(session['user_level'], allowed_roles))

        return f(*args, **kwargs)
    return decorated_function

def commmon_decorator_function():
    if not request.headers.get('Authorization'):
        LOGGER.info('Missing authorization header')
        error = 'Missing authorization header'
        abort(401, error)
    if 'login_token' not in session:
        LOGGER.info('user not logged in.')
        error = 'user not logged in.'
        abort(401, error)

    if not check_token(request.headers.get('Authorization'), session['login_token']):
        LOGGER.info('token mis-matched.{0}<-->{1}'.format(request.headers.get('Authorization'), session['login_token']))
        error = 'token mis-matched.'
        abort(401, error)

    if 'user_level' not in session or 'user_id' not in session:
        LOGGER.info('user not logged in.')
        error = 'user not logged in.'
        abort(401, error)

    if not session['user_level']:
        LOGGER.info('user roles empty.')
        error = 'user not logged in.'
        abort(401, error)


# admin logging to application
def admin_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        LOGGER.info("admin login required called......")
        allowed_roles = []
        allowed_roles.extend(CONFIG_DATA['ADMIN_ROLES'])

        commmon_decorator_function()

        if session['user_level'] not in allowed_roles:
             error = 'user role should be:{}'.format(allowed_roles)
             abort(401, error)

        return f(*args, **kwargs)
    return decorated_function

def self_or_admin_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        LOGGER.info("self login required called......")
        allowed_roles = []
        allowed_roles.extend(CONFIG_DATA['ADMIN_ROLES'])

        commmon_decorator_function()

        if session['user_level'] in allowed_roles or (len(args) and str(args[0]['_id']) == session['user_id']):
            return f(*args, **kwargs)
        else:
            error = 'invalid role user'
            abort(401, error)
    return decorated_function

def admin_or_editor_or_submitor_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        LOGGER.info("self login required called......")
        allowed_roles = []
        allowed_roles.extend(CONFIG_DATA['APPLICATION_ROLES'])
        allowed_roles.remove("user")

        commmon_decorator_function()

        if session['user_level'] in allowed_roles:
            return f(*args, **kwargs)
        else:
            error = 'invalid role user'
            abort(401, error)
    return decorated_function

def admin_or_user_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        LOGGER.info("self login required called......")
        allowed_roles = []
        allowed_roles.extend(CONFIG_DATA['APPLICATION_ROLES'])
        allowed_roles.remove("editor")
        allowed_roles.remove("submitter")

        commmon_decorator_function()

        if session['user_level'] in allowed_roles:
            return f(*args, **kwargs)
        else:
            error = 'invalid role user'
            abort(401, error)

    return decorated_function


def admin_or_editor_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        LOGGER.info("self login required called......")
        allowed_roles = []
        allowed_roles.extend(CONFIG_DATA['APPLICATION_ROLES'])
        allowed_roles.remove("user")
        allowed_roles.remove("submitter")

        commmon_decorator_function()

        if session['user_level'] in allowed_roles:
            return f(*args, **kwargs)
        else:
            error = 'invalid role user'
            abort(401, error)
    return decorated_function



def abort_resource_deletion(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        error = 'you should not delete complete collection'
        abort(401, error)
        return f(*args, **kwargs)
    return decorated_function
