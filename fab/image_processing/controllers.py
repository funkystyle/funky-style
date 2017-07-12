from flask import request, jsonify
from flask import abort
from urlparse import urlparse
from fab import ReturnException
from fab import app

from settings import CONFIG_DATA, BASE_DIR, LOGGER

import urllib
import uuid, os
import base64
import binascii
from bson.objectid import ObjectId

from urlparse import urlsplit, urlunsplit

def check_base64_or_not(data):
    image_data = data.split(",")
    LOGGER.error("length of image split"+str(len(image_data)))
    if not len(image_data) >= 2:
        return False
    try:
        base64.decodestring(image_data[1])
        return True
    except binascii.Error as e:
        print e,'***********'
        LOGGER.error(str(e))
        return False

def save_image_from_base64(image_base64_data):
    """
    saves base64 image data to specific folder
    :param image_base64_data:
    :return: string path
    """
    # or, more concisely using with statement
    if not check_base64_or_not(image_base64_data):
        print "not proper data"
        abort(400, "not proper base64 encoded data.")

    copy_image_data = image_base64_data[:]
    image_extension = image_base64_data.split(";")[0].split("/")[-1]
    unique_name = str(uuid.uuid4()).replace("-", "_")
    file_name = unique_name+"."+image_extension
    full_file_name = CONFIG_DATA['DESC_IMAGES_FOLDER']+file_name

    import base64
    with open(full_file_name, "wb") as fh:
        fh.write(base64.b64decode(copy_image_data.split(",")[1]))
    return full_file_name

def delete_image(path):
    """
    delete file
    :param path:
    :return:
    """
    if os.path.exists(path):
        full_path = os.path.join(BASE_DIR, path)
        os.remove(full_path)
        return True
    else:
        return False

def save_image(data):
    for item in data:
        url = save_image_from_base64(item['image_data'])
        item['url'] = url
        del item['image_data']
    return data

def delete_image_data_url(data):
    for item in data:
        res = delete_image(item['image_url'])
        if not res:
            item['message']='no image found with given url'
            item['status'] = False
        else:
            item['message'] = 'image deleted successfully.'
            item['status'] = True
    print '-------------'
    return data


def update_image(data):
    for item in data:
        res = delete_image(item['image_url'])
        url = save_image_from_base64(item['image_data'])
        item['image_url'] = url
        del item['image_data']
        item['_updated'] = True
    return data




@app.route('/api/1.0/save-images', methods=['POST'])
def save_images():
    try:
        print 'ddddddddddddddd'
        if not isinstance(request.json, list):
            raise ReturnException(message="data not found in payload", status_code=400)
        data = request.json
        res = save_image(data)
        response = jsonify(error='', data= data)
        response.status_code = 200
        return response

    except Exception as e:
        print e, '=============='
        LOGGER.error(str(e))
        abort(401, str(e))


@app.route('/api/1.0/delete-images', methods=['POST'])
def delete_images():
    try:
        if not isinstance(request.json, list):
            raise ReturnException(message="data not found in payload", status_code=400)
        data = request.json
        res = delete_image_data_url(data)
        response = jsonify(error='', data=data)
        response.status_code = 200
        return response

    except Exception as e:
        print e, '**********'
        LOGGER.error(str(e))
        abort(401, str(e))

@app.route('/api/1.0/update-images', methods=['POST'])
def update_images():
    try:
        if not isinstance(request.json, list):
            raise ReturnException(message="data not found in payload", status_code=400)
        data = request.json
        res = update_image(data)
        response = jsonify(error='', data={"res": data})
        response.status_code = 200
        return response

    except Exception as e:
        print e, '**********'
        LOGGER.error(str(e))
        abort(401, str(e))
