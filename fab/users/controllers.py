from flask import  request, abort, jsonify
from bson.objectid import ObjectId
from fab import admin_login_required
from fab import app
from settings import LOGGER,  COLLECTION_NAMES

#@admin_login_required
@app.route('/api/1.0/delete-documents', methods=['GET', 'DELETE', 'POST'])
def bulk_delete():
    results = []
    for input_payload in request.json:
        if 'resource_name' not in input_payload:
            LOGGER.error("resource name not found in input payload")
            abort(400, "resource name  not found in input payload")
        if 'ids' not in input_payload:
            LOGGER.error("ids not found in input payload ")
            abort(400, "ids not found in input payload ")

        if not isinstance(input_payload['ids'], list):
            abort("ids field should be array")

        if input_payload['resource_name'] not in COLLECTION_NAMES:
            abort(400, 'RESOURCE NAME SHOULD BE IN:{0}'.format(COLLECTION_NAMES))
        message = {}
        LOGGER.info("resource name:{}".format(input_payload['resource_name']))
        accounts = app.data.driver.db[input_payload['resource_name']]
        message['resource_name'] = input_payload['resource_name']
        for id in input_payload['ids']:
            message[id] = False
            LOGGER.info(id)
            find_account = accounts.find_one({"_id": ObjectId(id)})
            if not find_account:
                message[id] = False
                message['message'] = "{} not found".format(id)
            else:
                data = accounts.remove({"_id": ObjectId(id)})
                if data['n']:
                    message[id] = True
                    message['message'] = "successfully deleted."
        results.append(message)
    response = jsonify(errors=[], data=results)
    response.status_code = 200
    return response