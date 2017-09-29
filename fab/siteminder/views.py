import os
from datetime import datetime
from lxml import etree
from settings import SERVER_URL, \
    SCHEMAS, IGNORE_COLLECTION_NAMES, BASE_DIR, INDEX_XML_TEMPLATE, \
    SUB_FILE_TEMPLATE, LOOK_UP_FIELDS, PRIORITY,XML_FILES_FOLDER, EXTRA_URLS


class SiteMinder(object):

    def __init__(self, date_time, resource_name):
        self.resource_name = resource_name
        self.replaced_resource = resource_name.replace("-", "_")
        self.date_time = "{}+5.30".format(date_time)

        self.base_url = "{server_name}/{xml_file_path}".format(
            server_name=SERVER_URL,
            xml_file_path=XML_FILES_FOLDER

        )
        self.index_file = "sitemap_xml_files/sitemap_index.xml"

    def parser(self, file_path):
        self.file_path = file_path
        self.file_name = file_path.split("/")[-1]
        self.tree = etree.parse(file_path)
        self.root = self.tree.getroot()

    def update_index_file(self):
        self.parser(self.index_file)
        # update index file
        for child in self.root:

            if child.getchildren()[0].text == "{server_url}/".format(
                    server_url=SERVER_URL,
                    resource_name=self.resource_name
            ):
                child.getchildren()[1].text = self.date_time

            if self.resource_name in EXTRA_URLS.keys():
                if child.getchildren()[0].text == "{server_url}/{resource_name}/".format(
                        server_url=SERVER_URL,
                        resource_name=self.resource_name
                ):
                    child.getchildren()[1].text = self.date_time

            if child.getchildren()[0].text == "{server_url}/sitemap_{resource_name}.xml".format(
                    server_url=SERVER_URL,
                    resource_name=self.replaced_resource
            ):
                child.getchildren()[1].text = self.date_time
                self.tree.write(self.file_path)
        return False

def write_to_file(out_file, data):
    with open(out_file, 'w') as _file:
        _file.write(data)

def generate_sitemap_index_file():
    schema_names = SCHEMAS.keys()[:]
    for ignore_schema_name in IGNORE_COLLECTION_NAMES:
        if ignore_schema_name in SCHEMAS.keys():
            schema_names.remove(ignore_schema_name)
    schema_names.remove("deal_categories_collection")
    schema_names.remove("user_favourites")
    schema_names.append("deal_categories")
    file_path = BASE_DIR+"/"+INDEX_XML_TEMPLATE
    with open(file_path) as _file:
        template = _file.read()

    element = ""
    for schema_name in schema_names:
        base_url = "{server_name}/{xml_file_path}".format(
            server_name=SERVER_URL,
            xml_file_path=XML_FILES_FOLDER


        )
        loc = "{server_url}/sitemap_{resource_name}.xml".format(
            server_url=SERVER_URL,
            resource_name=schema_name.replace("-", "_")
        )
        lastmod = "{}+5.30".format(datetime.now().strftime('%Y-%m-%dT%H-%M-%S'))
        element += "<sitemap>" \
                  "<loc>{}</loc>" \
                  "<lastmod>{}</lastmod>\
                  </sitemap>".format(loc, lastmod)

    element += "<sitemap>" \
               "<loc>{}/</loc>" \
               "<lastmod>{}</lastmod>\
               </sitemap>".format(SERVER_URL, lastmod)

    for key in EXTRA_URLS.keys():
        if key:
            element += "<sitemap>" \
                       "<loc>{server_url}/{resource_name}/</loc>" \
                       "<lastmod>{last_modified}</lastmod>\
                       </sitemap>".format(server_url=SERVER_URL,
                                          resource_name=key,
                                          last_modified=lastmod)

    template = template.format(data=element)

    out_file = os.path.join(BASE_DIR, 'sitemap_xml_files', 'sitemap_index.xml')
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
        base_url = "{server_name}".format(
            server_name=SERVER_URL
        )

        if PRIORITY[resource_name]['prefix']:
            loc = "{base_url}/{prefix_collcection}/{field_string}/".format(
                base_url=base_url,
                prefix_collcection=PRIORITY[resource_name]['prefix'],
                field_string=str(item[LOOK_UP_FIELDS[resource_name]])
            )
        else:
            loc = "{base_url}/{field_string}/".format(
                base_url=base_url,
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
    out_file = os.path.join(BASE_DIR, 'sitemap_xml_files', 'sitemap_{}.xml'.format(resource_name.replace("-","_")))
    write_to_file(out_file, template)






