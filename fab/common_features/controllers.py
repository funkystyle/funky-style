from flask import request, jsonify
from datetime import  datetime
import os
from werkzeug import secure_filename
from settings import CONFIG_DATA, BASE_DIR
from fab import app

ALLOWED_EXTENSIONS = CONFIG_DATA['ALLOWED_EXTENSIONS']
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

def return_required_dict(json_dict, fields):
    response = {}
    for field in fields:
        if field['label'] in json_dict:
            response[field['name']] = json_dict[field['label']]
        else:
            response[field['name']] = ""
    return response

@app.route('/api/1.0/search', methods=['GET'])
def search():
    if request.method == 'GET':
        query = request.args.get("q", None)
        if query:
            result = []
            # getting stores
            store_obj = app.data.driver.db['stores']
            coupons_obj = app.data.driver.db['coupons']
            categories_obj = app.data.driver.db['categories']
            deals_object = app.data.driver.db['deals']
            deals_brands_object = app.data.driver.db['deal_brands']


            query = {"name": {"$regex": ".*{}.*".format(query), "$options": "i"}}
            print "Query", query
            stores = store_obj.find(query)
            categories = categories_obj.find(query)
            deals = deals_object.find(query)
            deal_brands = deals_brands_object.find(query)

            store_fields = [
                {'name': 'name', 'label': 'name'},
                {'name': 'url', 'label': 'url'},
                {'name': 'image', 'label': 'image'},
            ]
            coupon_fields = [
                {'name': 'name', 'label': 'title'},
                {'name': 'url', 'label': 'destination_url'},
                {'name': 'image', 'label': 'image'},
            ]
            print "Stores", stores
            for store in stores:
                print store, "==========="
                result.append(return_required_dict(store, store_fields))
                print result
                if 'related_coupons' in store:
                    print('loading coupons of store:{}'.format(store['name']))
                    query = { "_id" : { "$in" : store['related_coupons']}}
                    coupons = coupons_obj.find(query)
                    for coupon in coupons:
                        coupons_output = {}
                        if 'image' in store:
                            coupons_output['image'] = store['image']
                        else:
                            coupons_output['image'] = ""
                        if 'url' in store:
                            coupons_output['url'] = store['url']
                        else:
                            coupons_output['url'] = ""

                        if 'title' in coupon:
                            coupons_output['name'] = coupon['title']
                        else:
                            coupons_output['name'] = ""

                        result.apend(coupons_output)

            for category in categories:
                result.append(return_required_dict(category, store_fields))
                if 'related_coupons' in category:
                    print('loading coupons of store:{}'.format(category['name']))
                    query = {"_id": {"$in": category['related_coupons']}}
                    coupons = coupons_obj.find(query)
                    for coupon in coupons:
                        coupons_output = {}
                        if 'image' in store:
                            coupons_output['image'] = store['image']
                        else:
                            coupons_output['image'] = ""
                        if 'url' in store:
                            coupons_output['url'] = store['url']
                        else:
                            coupons_output['url'] = ""

                        if 'title' in coupon:
                            coupons_output['name'] = coupon['title']
                        else:
                            coupons_output['name'] = ""

                        result.apend(coupons_output)

            for deal in deals:
                if 'images' in deal:
                    if len(deal['images']):
                        deal['image'] = deal['images'][0]
                    else:
                        deal['image'] = ""
                result.append(return_required_dict(deal, store_fields))

            for deal_brand in deal_brands:
                result.append(return_required_dict(deal_brand, store_fields))

            response = jsonify(error='', data = result)
            response.status_code = 200
            return response




@app.route('/api/1.0/common/file-upload', methods=['POST'])
def fileupload():
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            dt = str(datetime.datetime.now())
            renamed_filename = dt+'_'+filename
            file.save(os.path.join(BASE_DIR, CONFIG_DATA['UPLOAD_FOLDER'], renamed_filename))
            print os.path.join(BASE_DIR, CONFIG_DATA['UPLOAD_FOLDER'], renamed_filename),'============'
            #print os.path.join(app.config['UPLOAD_FOLDER'], renamed_filename)
        return os.path.join(app.config['UPLOAD_FOLDER'], renamed_filename)