from flask_mail import Mail, Message
from datetime import  datetime, timedelta
import jwt
from flask import jsonify, request, g, session

from fab import mail
from settings import TOKEN_SECRET, LOGGER

# commonly used code
def create_token(user_id, days=60):
    LOGGER.info("creating token for userid:{0}".format(user_id))
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



def send_admin_emails(**kwargs):
    LOGGER.info("email sending with payload:{0}".format(kwargs))
    msg = Message(kwargs['title'], sender=kwargs['sender'],recipients=kwargs['recipients'])
    with open(kwargs['template'], 'r') as _file:
        html_data = _file.read()
        html_data = html_data.format(email=kwargs['email'],
                                     first_name=kwargs['first_name']
                                     )
        msg.html = html_data

    with mail.record_messages() as outbox:
        mail.send(msg)
        if not len(outbox):
            LOGGER.info("email sent failed with ")
            return False
        else:
            LOGGER.info("email sent ")
            return True

def send_fab_emails(**kwargs):
    LOGGER.info("email sending with payload:{0}".format(kwargs))
    msg = Message(kwargs['title'], sender=kwargs['sender'],recipients=kwargs['recipients'])
    with open(kwargs['template'], 'r') as _file:
        html_data = _file.read()
        if 'user_id' in kwargs:
            html_data = html_data.format(server_url=kwargs['server_url'],
                                         token=kwargs['token'],
                                         user_id=kwargs['user_id'],
                                         email=kwargs['email'],
                                         first_name=kwargs['first_name']
                                         )
        else:
            html_data = html_data.format(server_url=kwargs['server_url'],
                                         token=kwargs['token'],
                                         email=kwargs['email'],
                                         first_name=kwargs['first_name']
                                         )
        msg.html = html_data

    with mail.record_messages() as outbox:
        mail.send(msg)
        if not len(outbox):
            LOGGER.info("email sent failed with token:{0}".format(kwargs['token']))
            return False
        else:
            LOGGER.info("email sent with token:{0}".format(kwargs['token']))
            return True