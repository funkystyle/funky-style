# initalizing Eve and Flas app
from eve import Eve
from flask import jsonify
from flask_mail import Mail
from flask_cors import CORS
from binascii import unhexlify, hexlify
from simplecrypt import encrypt, decrypt
from settings import *

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
        LOGGER.info("decrypting password...")
        unhexlify_password = unhexlify(str(encrpted_password))
        raw_password = decrypt(str(PASSWORD_CRYPTION_TOKEN), unhexlify_password)
        return raw_password

encrypt_decrypt = EncrptDecrpt()

app = Eve(__name__)
app._static_folder = os.path.abspath("static/")
app.config.update(
	DEBUG=False,
    #EMAIL SETTINGS
	MAIL_SERVER=MAIL_SERVER,
	MAIL_PORT=MAIL_PORT,
	MAIL_USE_SSL=MAIL_USE_SSL,
	MAIL_USERNAME = MAIL_USERNAME,
	MAIL_PASSWORD = encrypt_decrypt.decryption(MAIL_PASSWORD),
    SECRET_KEY = TOKEN_SECRET,
)


mail=Mail(app)
CORS(app)

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


from common_features import *

# persons schema can be assessable and editable by admin only
app.on_fetched_resource_persons += before_returning_persons
app.on_fetched_item_persons += before_returning_persons
app.on_update_resource_persons += before_returning_persons
app.on_update_item_persons += before_returning_persons
app.on_delete_item_persons += before_delete_persons_item

from data_validations import *
from auth import *
from  users import *
