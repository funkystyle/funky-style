from cerberus import Validator
from constants import SCHEMAS
import logging, re


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
        print field, value, '================'
        if value and not re.match('[a-f0-9]{24}', value):
            self._error(field, "Must be in mongodb objectId format")

class Validations(object):

    def __init__(self, schema_name):
        '''
        initialization of schema name
        :param schema_name:
        '''
        self.schema = SCHEMAS[schema_name]
        self.logger = logging.getLogger(__name__)
        self.logger.info("initated schema is:{0}".format(schema_name))
        self.ignore_keys = ["default", "unique"]
        self.schema = self.delete_keys_from_dict(self.schema, self.ignore_keys)
        self.schema_name = schema_name
        self.logger.info("validating schema:{0}".format(self.schema))
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
        self.logger.info("ignoring keys are:{0}".format(ignore_keys))
        self.v.validate(item)
        self.logger.info("{0} schema validation errors:{1}".format(self.schema_name, self.v.errors))
        return self.v.errors


if __name__ == '__main__':
    validations = Validations("persons")
    schema = {
         "first_name": "first name",
         "last_name": "last name",
         "email": "satya@example.com",
         "mobile_number": "mobile number",
         "password": "passowrd",
         "city": "coity",
         "age": 1,
         "status": "active",
         "user_level":["editor"]
    }
    validations.validate_schema(schema, ['default'])
