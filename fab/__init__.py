# initalizing Eve and Flas app
from eve import Eve
from flask import jsonify
from flask_mail import Mail


from binascii import unhexlify, hexlify
from simplecrypt import encrypt, decrypt
from settings import *
import logging

LOGGER = logging.getLogger(__name__)
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

encrypt_decrypt = EncrptDecrpt()
app = Eve(static_url_path='/static')

app.config.update(
	DEBUG=DEBUG,
    #EMAIL SETTINGS
	MAIL_SERVER=MAIL_SERVER,
	MAIL_PORT=MAIL_PORT,
	MAIL_USE_SSL=MAIL_USE_SSL,
	MAIL_USERNAME = MAIL_USERNAME,
	MAIL_PASSWORD = encrypt_decrypt.decryption(MAIL_PASSWORD),
    SECRET_KEY = TOKEN_SECRET
)

mail=Mail(app)



class ReturnException(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv

@app.errorhandler(ReturnException)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

from data_validations import *
from auth.views import *
from auth.controllers import *