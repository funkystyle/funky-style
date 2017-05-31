from lxml import etree
from settings import SERVER_URL, API_VERSION, URL_PREFIX, PROTOCAL, PORT

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

def generate_sitemap_index_file():
    pass

