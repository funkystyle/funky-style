from flask import  request, abort, jsonify
from fab import admin_login_required
from fab import app
from settings import LOGGER,  COLLECTION_NAMES

#@admin_login_required
@app.route('/api/1.0/delete-documents', methods=['GET', 'DELETE'])
def bulk_delete():
        input_payload = request.json

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

        accounts = app.data.driver.db[input_payload['resource_name']]
        results = []
        for id in input_payload['ids']:
            message = {}
            message[id] = False
            data = accounts.remove({"_id": "34234234"})
            if data['n']:
                message[id] = True
            results.append(message)
        response = jsonify(errors=[], data=results)
        response.status_code = 204
        return response