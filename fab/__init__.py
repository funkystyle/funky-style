# initalizing Eve and Flas app
from eve import Eve
from eve.io.media import MediaStorage
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

class MediaClass(MediaStorage):
    def __init__(self, app=None):
        """
        :param app: the flask application (eve itself). This can be used by
        the class to access, amongst other things, the app.config object to
        retrieve class-specific settings.
        """
        self.app = app

    def post(self, content, filename=None, content_type=None, resource=None):
        raise NotImplementedError

    def get(self, id_or_filename, resource=None):
        """ Opens the file given by name or unique id. Note that although the
        returned file is guaranteed to be a File object, it might actually be
        some subclass. Returns None if no file was found.
        """
        raise NotImplementedError

    def put(self, content, filename=None, content_type=None, resource=None):
        """ Saves a new file using the storage system, preferably with the name
        specified. If there already exists a file with this name name, the
        storage system may modify the filename as necessary to get a unique
        name. Depending on the storage system, a unique id or the actual name
        of the stored file will be returned. The content type argument is used
        to appropriately identify the file when it is retrieved.
        .. versionchanged:: 0.5
           Allow filename to be optional (#414).
        """
        raise NotImplementedError

    def delete(self, id_or_filename, resource=None):
        """ Deletes the file referenced by name or unique id. If deletion is
        not supported on the target storage system this will raise
        NotImplementedError instead
        """
        raise NotImplementedError

    def exists(self, id_or_filename, resource=None):
        """ Returns True if a file referenced by the given name or unique id
        already exists in the storage system, or False if the name is available
        for a new file.
        """
        raise NotImplementedError


app = Eve(__name__, media=MediaClass)
app._static_folder = os.path.abspath("static/")
#UPLOAD_FOLDER = 'static/images'
#app.config['UPLOAD_FOLDER']= UPLOAD_FOLDER
app.config.update(
	DEBUG=True,
    #EMAIL SETTINGS
	MAIL_SERVER=MAIL_SERVER,
	MAIL_PORT=MAIL_PORT,
	MAIL_USE_SSL=MAIL_USE_SSL,
	MAIL_USERNAME = MAIL_USERNAME,
	MAIL_PASSWORD = encrypt_decrypt.decryption(MAIL_PASSWORD),
    SECRET_KEY = TOKEN_SECRET
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

# stores schema request accessablity and processing some fields
app.on_insert += before_create
app.on_update += before_update

app.on_deleted_item += after_deleted_item

from data_validations import *
from auth import *
from users import *
