import os
from datetime import datetime
from lxml import etree
from settings import SERVER_URL, API_VERSION, URL_PREFIX, PROTOCAL, \
    PORT, SCHEMAS, IGNORE_COLLECTION_NAMES, BASE_DIR, INDEX_XML_TEMPLATE, SUB_FILE_TEMPLATE, LOOK_UP_FIELDS, PRIORITY

class SiteMinder(object):

    def __init__(self, date_time, resource_name):
        self.resource_name = resource_name
        self.replaced_resource = resource_name.replace("_", "-")
        self.date_time = "{}+5.30".format(date_time)

        self.base_url = "{protocal}://{server_name}/{api_prefix}/{api_version}".format(
            protocal = PROTOCAL,
            server_name = SERVER_URL,
            api_prefix = URL_PREFIX,
            api_version = API_VERSION
        )
        self.index_file = "static/sitemap_xml_files/sitemap_index.xml"

    def parser(self, file_path):
        self.file_path = file_path
        self.file_name = file_path.split("/")[-1]
        self.tree = etree.parse(file_path)
        self.root = self.tree.getroot()

    def update_index_file(self):
        self.parser(self.index_file)
        # update index file
        for child in self.root:
            print(child.getchildren()[0].text, "{base_url}/sitemap-{resource_name}".format(
                    base_url=self.base_url,
                    resource_name=self.resource_name
            ))
            if child.getchildren()[0].text == "{base_url}/sitemap-{resource_name}".format(
                    base_url=self.base_url,
                    resource_name=self.resource_name
            ):
                child.getchildren()[1].text = self.date_time
                print("file path::::", self.file_path)
                self.tree.write(self.file_path)
                return True
        return False

def write_to_file(out_file, data):
    with open(out_file, 'w') as _file:
        _file.write(data)

def generate_sitemap_index_file():
    schema_names = SCHEMAS.keys()[:]
    for ignore_schema_name in IGNORE_COLLECTION_NAMES:
        if ignore_schema_name in SCHEMAS.keys():
            schema_names.remove(ignore_schema_name)
    file_path = BASE_DIR+"/"+INDEX_XML_TEMPLATE
    with open(file_path) as _file:
        template = _file.read()

    element = ""
    for schema_name in schema_names:
        base_url = "{protocal}://{server_name}/{api_prefix}/{api_version}".format(
            protocal=PROTOCAL,
            server_name=SERVER_URL,
            api_prefix=URL_PREFIX,
            api_version=API_VERSION
        )
        loc = "{base_url}/sitemap-{resource_name}".format(
            base_url=base_url,
            resource_name=schema_name.replace("_", "-")
        )
        lastmod = "{}+5.30".format(datetime.now().strftime('%Y-%m-%dT%H-%M-%S'))
        element += "<sitemap>" \
                  "<loc>{}</loc>" \
                  "<lastmod>{}</lastmod>\
                  </sitemap>".format(loc, lastmod)
    template = template.format(data=element)
    out_file = os.path.join(BASE_DIR, 'static', 'sitemap_xml_files', 'sitemap_index.xml')
    write_to_file(out_file, template)

def generate_sub_xml_file(resource_name, app):
    accounts = app.data.driver.db[resource_name]
    data = accounts.find({},{'_updated': 1, LOOK_UP_FIELDS[resource_name]:1})
    file_path = BASE_DIR + "/" + SUB_FILE_TEMPLATE
    with open(file_path) as _file:
        template = _file.read()
    element = ""
    for item in data:
        _updated = str(item['_updated']).replace(" ", "T")
        _updated = _updated.split("+")[0]+"+5.30"
        base_url = "{protocal}://{server_name}/{api_prefix}/{api_version}".format(
            protocal=PROTOCAL,
            server_name=SERVER_URL,
            api_prefix=URL_PREFIX,
            api_version=API_VERSION
        )
        loc = "{base_url}/{resource_name}/{field_string}".format(
            base_url=base_url,
            resource_name=resource_name,
            field_string=str(item[LOOK_UP_FIELDS[resource_name]])
        )
        lastmod = _updated
        changefreq = PRIORITY[resource_name]['changefreq']
        priority = PRIORITY[resource_name]['priority']
        element += "<url>" \
                   "<loc>{}</loc>" \
                   "<lastmod>{}</lastmod>"\
                   "<changefreq>{}</changefreq>"\
                   "<priority>{}</priority>\
                   </url>".format(loc, lastmod, changefreq, priority)
    template = template.format(data=element)
    out_file = os.path.join(BASE_DIR, 'static', 'sitemap_xml_files', 'sitemap_{}.xml'.format(resource_name))
    write_to_file(out_file, template)






