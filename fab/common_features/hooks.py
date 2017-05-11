from flask import abort
import uuid, os
import base64
import binascii
from settings import CONFIG_DATA, BASE_DIR, LOGGER
from fab import app

from login_decorators import user_login_required, admin_login_required, abort_resource_deletion
from settings import  LOGGER

@admin_login_required
def before_returning_persons(response):
    LOGGER.info("persons api access processing after admin login verification")

@admin_login_required
def before_delete_persons_item(item):
    LOGGER.info("persons api delete item access processing after admin login verification")

def check_base64_or_not(data):
    image_data = data.split(",")
    if len(image_data) < 2:
        return False
    try:
        base64.decodestring(image_data[1])
        return True
    except binascii.Error as e:
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
        abort(400, "not proper base64 encoded data.")

    copy_image_data = image_base64_data[:]
    image_extension = image_base64_data.split(";")[0].split("/")[-1]
    if image_extension  not in CONFIG_DATA['ALLOWED_EXTENSIONS']:
        abort(400, "image extension:{0} not allowed, should be in:{1}"
              .format(image_extension, CONFIG_DATA['ALLOWED_EXTENSIONS']))
    unique_name = str(uuid.uuid4()).replace("-", "_")
    file_name = unique_name+"."+image_extension
    full_file_name = CONFIG_DATA['UPLOAD_FOLDER']+file_name

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
    full_path = os.path.join(BASE_DIR, path)
    os.remove(full_path)

def process_images(requests):
    for request in  requests:
        for field in CONFIG_DATA['IMAGE_FIELDS']:
            if field in request:
                if isinstance(request[field], list):
                    for index, image in enumerate(request[field]):
                        request[field][index] = save_image_from_base64(image)
                else:
                    request[field] = save_image_from_base64(request[field])



# hooks for stores
def before_create(resource, request):
    process_images(request)

def before_update(resource, update, original):
    for image_field in CONFIG_DATA['IMAGE_FIELDS']:
        if image_field in update:
            if isinstance(update[image_field], list):
                for index, payload_image in enumerate(update[image_field]):
                    if payload_image not in original[image_field]:
                        update[image_field][index] = save_image_from_base64(payload_image)
            elif update[image_field] != original[image_field]:
                path = save_image_from_base64(update[image_field])
                delete_image(original[image_field])
                update[image_field] = path

        if image_field in original:
            if isinstance(original[image_field], list):
                for index, original_image in enumerate(original[image_field]):
                    if original_image not in update[image_field]:
                        delete_image(original_image)
