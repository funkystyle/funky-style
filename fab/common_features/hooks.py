from flask import abort, request
import uuid, os
from werkzeug.security import generate_password_hash, check_password_hash
import base64
import binascii
from datetime import datetime
from bson.objectid import ObjectId
import multiprocessing
from settings import CONFIG_DATA, BASE_DIR, LOGGER
from fab import app

from login_decorators import *
from settings import LOGGER

from fab.siteminder import SiteMinder
from fab.siteminder import generate_sub_xml_file
from fab.siteminder import generate_sitemap_index_file

# stoers
@admin_login_required
def before_create_store(*args, **kwargs):
    LOGGER.info("before created")

@admin_or_editor_or_submitor_login_required
def before_update_store(*args, **kwargs):
    LOGGER.info("before created")

@admin_login_required
def before_returning_persons(*args, **kwargs):
    LOGGER.info("persons api access processing after admin login verification")

@admin_login_required
def before_returning_master_seo(*args, **kwargs):
    LOGGER.info("persons api access processing after admin login verification")

@admin_login_required
def before_create_person(*args, **kwargs):
    LOGGER.info("person creatin permission check done.")

@admin_or_editor_or_submitor_login_required
def before_create_some_collections(*args, **kwargs):
    LOGGER.info("person creatin permission check done.")

@admin_login_required
def before_update_deal_categories(*args, **kwargs):
    LOGGER.info("person creatin permission check done.")


@self_or_admin_login_required
def before_update_person(resource, update, original):
    if 'password' in update and 'password_raw' in  update['password']:
        response = {
            'password': str(generate_password_hash(update['password']['password_raw'])),
            'password_raw': update['password']['password_raw'],
            'last_password_updated_date': datetime.now()
        }
        update.update({"password": response})

@self_or_admin_login_required
def before_returning_person(*args, **kwargs):
    LOGGER.info("single persons access verification is done...")

def update_number_of_clicks(resource, _id):
    number_of_click_required = request.args.get("number_of_clicks", None)
    if number_of_click_required and int(number_of_click_required) == 1:
        LOGGER.info("calculating number of clicks...")
        resource_obj = app.data.driver.db[resource]
        resource_obj.update({'_id': _id}, {'$inc': {'number_of_clicks': 1}})

def before_returning_stores(response):
    update_number_of_clicks('stores', response['_id'])


def before_returning_coupons(response):
    LOGGER.info("coupons")
    update_number_of_clicks('coupons', response['_id'])

def before_returning_deals(response):
    update_number_of_clicks('deals', response['_id'])

def before_returning_deal_brands(response):
    update_number_of_clicks('deals_brands', response['_id'])


def before_returning_deal_categories(response):
    update_number_of_clicks('deals_categories', response['_id'])

def before_returning_categories(response):
    update_number_of_clicks('categories', response['_id'])

@self_or_admin_login_required
def before_delete_persons_item(item):
    LOGGER.info("persons api delete item access processing after admin login verification")

def check_base64_or_not(data):
    image_data = data.split(",")
    LOGGER.error("length of image split"+str(len(image_data)))
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
    if os.path.exists(path):
        full_path = os.path.join(BASE_DIR, path)
        os.remove(full_path)

def process_images(requests):
    for request in  requests:
        for field in CONFIG_DATA['IMAGE_FIELDS']:
            LOGGER.info("image field:{}".format(field))
            if field in request:
                if isinstance(request[field], list):
                    for index, image in enumerate(request[field]):
                        request[field][index] = save_image_from_base64(image)
                else:
                    request[field] = save_image_from_base64(request[field])

def find_netloc(requests):
    for request in requests:
        if 'affiliate_network' not in request:
            abort(403, "no affiliate_network parameter found in post request.")
        if not request['affiliate_network']:
            abort(403, "affiliate_network should not be empty.")
        from urlparse import urlparse
        parsed_uri = urlparse(request['affiliate_network'])
        LOGGER.info('affiliate network:{}'.format(parsed_uri.netloc))
        request['affiliate_network'] = parsed_uri.netloc
        if not request['affiliate_network']:
            abort(403, "affiliate_network is not valid.")
    return requests


@admin_or_editor_or_submitor_login_required
def before_create_deal(resource, request):
    LOGGER.info("before create deal")
# hooks for stores
def before_create(resource, request):
    LOGGER.info("called for create image resource:{}".format(resource))
    if resource == 'persons':
        before_create_person(resource, request)
    elif resource == 'deal_categories' or resource == 'deal_brands'\
            or resource == 'coupon_reports' or resource == 'blog' or resource == 'deep_link':
        before_create_some_collections(resource, request)
    elif resource == 'stores' or resource == 'categories':
        before_create_some_collections(resource, request)
    elif resource == 'deals' or resource == 'coupons':
        before_create_some_collections(resource, request)
    elif resource == 'master_seo' or resource == 'banner' or resource == 'cms_pages':
        before_create_some_collections(resource, request)
    elif resource == 'coupon_comments':
        before_create_some_collections(resource, request)

    if resource == 'deep_link':
        request = find_netloc(request)
    else:
        process_images(request)


@admin_or_editor_login_required
def before_edit_deal(*args, **kwargs):
    LOGGER.info("before edit deal")

def before_update(resource, update, original):
    if resource == 'persons':
        before_update_person(resource, update, original)
    elif resource == 'stores' or resource == 'categories':
        before_update_store(resource, update, original)

    elif resource == 'deals' or resource == 'coupons':
        before_update_store(resource, update, original)

    elif resource == 'master_seo' or resource == 'banner' or resource == 'cms_pages':
        before_update_store(resource, update, original)

    elif resource == 'deal_categories' or resource == 'deal_brands' or resource == 'coupon_reports'\
            or resource == 'blog' or resource == 'deep_link':
        before_update_store(resource, update, original)

    elif resource == 'coupon_comments':
        before_update_store(resource, update, original)

    # getting all image fields of all tables from config file
    for image_field in CONFIG_DATA['IMAGE_FIELDS']:
        # checking image field of conf in update payload
        if image_field in update:
            # if image field of update payload is list
            if isinstance(update[image_field], list):

                # if given payload images empty list remove all previous images
                if not len(update[image_field]):
                    if image_field in original:
                        for index, payload_image in enumerate(original[image_field]):
                            delete_image(payload_image)
                        update[image_field] = []

                # getting index and image data from payload image
                for index, payload_image in enumerate(update[image_field]):
                    # checking payload of given image data is in original
                    if payload_image not in original[image_field]:
                        # not found in database save image
                        update[image_field][index] = save_image_from_base64(payload_image)

            elif not update[image_field]:
                if image_field in original:
                    delete_image(original[image_field])
                    update[image_field] = ""

            elif image_field in update and image_field in original and update[image_field] != original[image_field]:
                # replace if image field string with path after save
                path = save_image_from_base64(update[image_field])
                delete_image(original[image_field])
                update[image_field] = path

        # if image field in original
        if image_field in original:
            # whether image field of original list or not
            if isinstance(original[image_field], list):
                for index, original_image in enumerate(original[image_field]):
                    # if original image not in update payload delete from original data
                    if original_image not in update[image_field]:
                        delete_image(original_image)

@abort_resource_deletion
def before_delete_resource(resource_name, item):
    LOGGER.error("resource:{} deleted".format(resource_name))
    exit()

@admin_or_user_login_required
def before_returning_cms_pages(*args, **kwargs):
    LOGGER.info('before returning cms pages')


def after_deleted_item(resource_name, item):
    for image_field in CONFIG_DATA['IMAGE_FIELDS']:
        if image_field in item:
            # if image field of update payload is list
            if isinstance(item[image_field], list):
                for index, payload_image in enumerate(item[image_field]):
                        delete_image(payload_image)

            elif isinstance(item[image_field], str):
                delete_image(item[image_field])

    # clearn related fields
    if resource_name in CONFIG_DATA['FIELD_CLEAR_COLLECTIONS_AFTER_DELETE'].keys():
        # c_f collection field
        for c_f in CONFIG_DATA['FIELD_CLEAR_COLLECTIONS_AFTER_DELETE'][resource_name]:
            accounts = app.data.driver.db[c_f['collection_name']]
            for delete_id in item[c_f['field_name']]:
                accounts.remove({'_id': ObjectId(str(delete_id))})

def process_index_file(resource_name, updated_date_time):
    if resource_name not in CONFIG_DATA['IGNORE_COLLECTION_NAMES']:
        LOGGER.info("updating siteminder for resource name:{} and item:{}".format(resource_name, updated_date_time))
        date_time = str(updated_date_time).replace(" ", "T")
        sm = SiteMinder(date_time, resource_name)
        if sm.update_index_file():
            LOGGER.info("updated siteminder for resource ")
        else:
            LOGGER.warn("updated siteminder for resource ")
    else:
        LOGGER.warn(" resource name:{} in ignore_collection_names array".format(resource_name))

def process_sub_xml_files(resource_name):
    if resource_name not in CONFIG_DATA['IGNORE_COLLECTION_NAMES']:
        LOGGER.info("started sub xml background job:{}".format(resource_name))
        d = multiprocessing.Process(name='daemon_sync', target=generate_sub_xml_file, args=(resource_name, app,))
        d.daemon = True
        d.start()
        LOGGER.info("finished sub xml background job:{}".format(resource_name))

def deman_index_sitemap_process(resource_name, date_time):
    if resource_name not in CONFIG_DATA['IGNORE_COLLECTION_NAMES']:
        LOGGER.info("started index file process background job:{}".format(resource_name))
        d = multiprocessing.Process(name='daemon_sync', target=process_index_file, args=(resource_name, date_time,))
        d.daemon = True
        d.start()
        LOGGER.info("finished index file process background job:{}".format(resource_name))

def deman_generate_index_sitemap():
    LOGGER.info("started create index background job")
    d = multiprocessing.Process(name='daemon_sync', target=generate_sitemap_index_file)
    d.daemon = True
    d.start()
    d.join()
    LOGGER.info("finished create index background job")

def after_created(resource_name, item):
    deman_generate_index_sitemap()
    deman_index_sitemap_process(resource_name, item[0]['_updated'])
    process_sub_xml_files(resource_name)


def after_updated(resource_name, update, original):
    deman_generate_index_sitemap()
    deman_index_sitemap_process(resource_name, update['_updated'])
    process_sub_xml_files(resource_name)


