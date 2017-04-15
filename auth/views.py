from binascii import unhexlify, hexlify
from simplecrypt import encrypt, decrypt
from constants import PASSWORD_CRYPTION_TOKEN
import logging

LOGGER = logging.getLogger(__name__)
"""from datetime import datetime, timedelta
from jwt, json
from settings import TOKEN_SECRET
from functools import wraps
from flask import request, jsonify


class ApiAuthentication(object):
    '''
    performs login registration email activation etc.
    '''
    def __init__(self, app, schema_name):
        self.schema = app.data.driver.db[schema_name]

    def user_registration(self, data):
        '''
        handling user registration
        :param data:
        :return:
        '''

        user_email = self.schema.find_one({'email': data['email']})
        if not user_email:
            dt = datetime.now()
            # data = requests.get('http://weber.ooo/api/similarwords?querystring='+' '.join(request.json['interests']))
            user = {
                'email': request.json['email'],
                'username': request.json['username'],
                'name': {
                    'first': request.json['firstname'],
                    'last': request.json['lastname']
                },
                'password': {
                    'password': generate_password_hash(request.json['password']),
                    'password_test': request.json['password'],
                    'password_updated': str(datetime.now())
                },
                'email_confirmed': False,
                'picture': {
                    'large': "static/app/images/w-logo.jpg",
                    'medium': "static/app/images/w-logo.jpg",
                    'thumbnail': "static/app/images/w-logo.jpg"
                },
                'phone': "",
                'study': {
                    'intermediate': "",
                    'graduate': ""
                },
                'random_string': id_generator(),
                'accept_notifications': [],
                'born': "",
                'questions': [],
                'gender': request.json['gender'],
                'lastmessageseen': dt.strftime('%Y-%m-%dT%H:%M:%SZ'),
                'location': {
                    'city': "",
                    'state': "",
                    'street': ""
                },
                'friends': [],
                'matchnotifications': [],
                'notifications': [],
                'interests': get_interested_ids(request.json['interests']),
                'conversations': []
            }
            accounts.insert(user)
            user_id = str(user['_id'])
            user_random_string = str(user['random_string'])
            msg = Message('Confirm your Weber account',
                          sender='Team@theweber.in',
                          recipients=[request.json['email']]

                          )
            msg.html = '<div style="min-height:100px;border:1px solid #dcdcdc;">' \
                       '<h5>Thanks for registering with us, To complete your Weber registration, Follow this link:</h5>' \
                       '<div style="padding:20px 5PASSWORD_CRYPTION_TOKENpx">' \
                       '<a href="http://www.weber.ooo/#/confirm_account/users/' + user_id + '/confirm/' + user_random_string + '">Click Here</a></div></div>'
            mail.send(msg)

        else:
            response = jsonify(error='You are already registered with this email, Please try forgot password ')
            response.status_code = 401
            return response
        return 'hai'

        @app.route('/auth/login', methods=['POST'])
        def login():
            accounts = app.data.driver.db['people']
            user = accounts.find_one({'email': request.json['email']})
            if not user:
                response = jsonify(error='Your email does not exist')
                response.status_code = 401
                return response
            if not user['email_confirmed'] == True:
                response = jsonify(error='Email is not confirmed')
                response.status_code = 401
                return response
            if not user or not check_password_hash(user['password']['password'], request.json['password']):
                response = jsonify(error='Wrong Email or Password')
                response.status_code = 401
                return response
            token = create_token(user)
            print '========================================================'
            print jwt.decode(token, TOKEN_SECRET)
            accounts.update({'email': request.json['email']},{"$set":{'token':token}})
            return jsonify(token=token)
"""
class EncrptDecrpt:
    '''
    encrption and decrption of passwords based on secret key
    '''
    def encryption(self, password):
        '''
        encryption of plain password into hash password
        :param passoword:
        :return:
        '''
        LOGGER.info("encryption raw password{0}".format(password))
        enc_password = encrypt(PASSWORD_CRYPTION_TOKEN, password)
        hexlify_password = hexlify(enc_password)
        return hexlify_password

    def decryption(self, encrpted_password):
        '''
        decrption of hash password into plain password
        :param password:
        :return:
        '''
        unhexlify_password = unhexlify(str(encrpted_password))
        raw_password = decrypt(str(PASSWORD_CRYPTION_TOKEN), unhexlify_password)
        LOGGER.info("decrypted raw password:{0}".format(raw_password))
        return raw_password

