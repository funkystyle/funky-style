from flask import request, jsonify
from flask import abort
from urlparse import urlparse
from fab import ReturnException
from fab import app
from settings import LOGGER

def add_tags():
    pass

def replace_strings():
    pass

def append_starturl():
    pass

def append_end_url():
    pass

@app.route('/api/1.0/get-output-deep-link-url', methods=['POST'])
def get_output_deeplink_url():
    try:
        if 'url' not in request.json:
            raise ReturnException(message="url not found in payload", status_code=400)
        LOGGER.info("payload url is:{0}".format(request.json['url']))
        if not request.json['url']:
            raise ReturnException(message="url shold not be empty", status_code=400)
            LOGGER.error("url shold not be empty")

        # read affliated network from url and get all details from databse
        parsed_url = urlparse(str(request.json['url']))
        LOGGER.info("parsed url net loc:{}".format(parsed_url.netloc))
        accounts = app.data.driver.db['deep_link']
        deep_links = accounts.find({})
        for deep_link in deep_links:
            if deep_link['affiliate_network'] in parsed_url.netloc:
                print 'yeeeesss'
        response = jsonify(error='', data={"output_url": ""})
        response.status_code = 200
        return response

    except Exception as e:
        LOGGER.error(str(e))
        abort(401, str(e))
