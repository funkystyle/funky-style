from functools import wraps
from flask import request, session,jsonify, abort
from settings import CONFIG_DATA, LOGGER


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

        if request.headers.get('Authorization') != session['login_token']:
            LOGGER.info('token mis-matched.{0}<-->{1}'.format(request.headers.get('Authorization'), session['login_token']))
            error = 'token mis-matched.'
            abort(401, error)

        if 'user_level' not in session:
            LOGGER.info('user not logged in.')
            error = 'user not logged in.'
            abort(401, error)

        if not len(session['user_level']):
            LOGGER.info('user roles empty.')
            error = 'user not logged in.'
            abort(401, error)

        if any(True for role in session['user_level'] if role not in CONFIG_DATA['APPLICATION_ROLES']):
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

        if request.headers.get('Authorization') != session['login_token']:
            LOGGER.info('token mis-matched.{0}<-->{1}'.format(request.headers.get('Authorization'), session['login_token']))
            error = 'token mis-matched.'
            abort(401, error)

        if 'user_level' not in session:
            LOGGER.info('user not logged in.')
            error = 'user not logged in.'
            abort(401, error)

        if not len(session['user_level']):
            LOGGER.info('user roles empty.')
            error = 'user not logged in.'
            abort(401, error)

        if any(True for role in session['user_level'] if role not in allowed_roles):
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

        if request.headers.get('Authorization') != session['login_token']:
            LOGGER.info('token mis-matched.{0}<-->{1}'.format(request.headers.get('Authorization'), session['login_token']))
            error = 'token mis-matched.'
            abort(401, error)

        if 'user_level' not in session:
            LOGGER.info('user not logged in.')
            error = 'user not logged in.'
            abort(401, error)

        if not len(session['user_level']):
            LOGGER.info('user roles empty.')
            error = 'user not logged in.'
            abort(401, error)

        if any(True for role in session['user_level'] if role not in allowed_roles):
            LOGGER.info('Invalid user role of :{0}.'.format(session['user_id']))
            error = 'Invalid user role.'
            abort(401, error)

        LOGGER.info("user role:{0}, allowed roles:{1}".format(session['user_level'], allowed_roles))

        return f(*args, **kwargs)
    return decorated_function

# admin logging to application
def admin_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        allowed_roles = []
        allowed_roles.extend(CONFIG_DATA['ADMIN_ROLES'])

        if not request.headers.get('Authorization'):
            LOGGER.info('Missing authorization header')
            error = 'Missing authorization header'
            abort(401, error)

        if 'login_token' not in session:
            LOGGER.info('user not logged in.')
            error = 'user not logged in.'
            abort(401, error)

        if request.headers.get('Authorization') != session['login_token']:
            LOGGER.info('token mis-matched.{0}<-->{1}'.format(request.headers.get('Authorization'), session['login_token']))
            error = 'token mis-matched.'
            abort(401, error)

        if 'user_level' not in session:
            LOGGER.info('user not logged in.')
            error = 'user not logged in.'
            abort(401, error)

        if not len(session['user_level']):
            LOGGER.info('user roles empty.')
            error = 'user not logged in.'
            abort(401, error)
        LOGGER.info("user_level:{0} allowed levels:{1}".format(session['user_level'], allowed_roles))
        if any(True for role in session['user_level'] if role not in allowed_roles):
            LOGGER.info('Invalid user role of :{0}.'.format(session['user_id']))
            error = 'Invalid user role.'
            abort(401, error)

        LOGGER.info("user role:{0}, allowed roles:{1}".format(session['user_level'], allowed_roles))

        return f(*args, **kwargs)
    return decorated_function
