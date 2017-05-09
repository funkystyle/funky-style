from cerberus import Validator
from settings import LOGGER, SCHEMAS
import re


class FabDataValidator(Validator):
    '''
        adding custom data type handling that is objectid
    '''
    def __init__(self, *args, **kwargs):
        super(FabDataValidator, self).__init__(*args, **kwargs)

    def _validate_type_objectid(self, value, field):
        """ Enables validation for `objectid` schema attribute.
        :param value: field value.
        """
        if value and not re.match('[a-f0-9]{24}', value):
            self._error(field, "Must be in mongodb objectId format")

def convert_object_dates_to_string(item, lst_keys):
    for k in lst_keys:
        try:
            item[k] = str(item[k])
        except KeyError:
            pass
    for v in item.values():
        if isinstance(v, dict):
            convert_object_dates_to_string(v, lst_keys)
    return item

def delete_some_keys_from_dict(item, delete_keys):
    for k in delete_keys:
        try:
            del item[k]
        except KeyError:
            pass
    for v in item.values():
        if isinstance(v, dict):
            convert_object_dates_to_string(v, delete_keys)
    return item

class Validations(object):

    def __init__(self, schema_name):
        '''
        initialization of schema name
        :param schema_name:
        '''
        self.schema = SCHEMAS[schema_name]
        LOGGER.info("initated schema is:{0}".format(schema_name))
        self.ignore_keys = ["default", "unique", "data_relation"]
        self.schema = self.delete_keys_from_dict(self.schema, self.ignore_keys)
        self.schema_name = schema_name
        LOGGER.info("validating schema:{0}".format(self.schema))
        self.v = FabDataValidator(self.schema)


    def delete_keys_from_dict(self, dict_del, lst_keys):
        '''
        some keys which are defined in eve schema can not handled or defined in cerberus
        we have to remove them while schema validation, EX: DEFAULT
        :param dict_del: payload dictionary
        :param lst_keys: keys which is removed from dictionary.
        :return:
        '''
        for k in lst_keys:
            try:
                del dict_del[k]
            except KeyError:
                pass
        for v in dict_del.values():
            if isinstance(v, dict):
                self.delete_keys_from_dict(v, lst_keys)
        return dict_del

    def validate_schema(self, item, ignore_keys=[]):
        '''
        check given payload with defined schema

        :param
         item: input http payload , ignore keys are not handled by cerberus,
        we should remove them to check data schema
         ignore_keys: keys to delete from payload to validate payload with schema
        :return:
        '''
        LOGGER.info("------------->ignoring keys are:{0}".format(ignore_keys))
        self.v.validate(item)
        LOGGER.info("{0} schema validation errors:{1}".format(self.schema_name, self.v.errors))
        return self.v.errors
