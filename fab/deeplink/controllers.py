from flask import request, jsonify
from flask import abort
from urlparse import urlparse
from fab import ReturnException
from fab import app
from settings import LOGGER

import urllib
from urlparse import urlsplit, urlunsplit


def find_db_affiliate_network(url):
    accounts = app.data.driver.db['deep_link']
    deep_links = accounts.find()
    default_deep_link = ""
    for deep_link in deep_links:
        if deep_link['affiliate_network'] in url:
            return deep_link
        if deep_link['is_default']:
            default_deep_link = deep_link
    if not default_deep_link:
        raise Exception("no affiliated_network found")
    return default_deep_link



class DeepLink(object):
    """
    1. getting net loc string to get affilated network from database
    2. finding affiliated network: if database affiliated_network in net loc
    3. append or replace tags into url

    """



    def __init__(self, input_url, url_config):
        # main input url
        self.input_url = str(input_url)
        # middle part of url
        self.url_netloc = self.get_url_net_loc()
        # database source
        self.affiliate_network, self.url_config = url_config['affiliate_network'], url_config
        self.start_url = ""
        self.end_url = ""
        # find affiliate_network to get from database
        #self.find_affiliate_network()


    def get_url_net_loc(self):
        return urlsplit(self.input_url).netloc


    def add_or_replace_tags(self):
        split_url = urlsplit(self.input_url)

        # replace: True need to replace url tags with database tags
        if 'replace' in self.url_config['tags'] and 'tags' in self.url_config['tags'] and \
                self.url_config['tags']['replace'] and self.url_config['tags']['tags']:

            if self.url_config['tags']['tags'] not in self.input_url:

                self.input_url = urlunsplit((split_url.scheme,
                                             split_url.netloc,
                                             split_url.path,
                                             self.url_config['tags']['tags'],
                                             split_url.fragment))

        # replace: False need to append database tags with existed url tags
        elif 'replace' in self.url_config['tags'] and \
                not self.url_config['tags']['replace'] and \
                        'tags' in self.url_config['tags'] and  \
                self.url_config['tags']['tags']:
            if self.url_config['tags']['tags'] not in self.input_url:
                # check database tags has question mark\
                if split_url.query == '?' or not split_url.query:
                    q = split_url.query+self.url_config['tags']['tags']
                else:
                    q = split_url.query+"&"+self.url_config['tags']['tags']
                self.input_url = urlunsplit((split_url.scheme,
                                             split_url.netloc,
                                             split_url.path,
                                             q,
                                             split_url.fragment))
        else:
            print 'nothing to do..'

    def process_start_url(self):
        if 'url' in self.url_config['start_url'] and self.url_config['start_url']['url']:
            LOGGER.info("start url in process start url:{}".format(self.input_url))
            if self.url_config['start_url']['url'] not in self.input_url:
                if 'encode' in self.url_config['start_url'] and self.url_config['start_url']['encode']:
                    self.start_url = urllib.quote(self.url_config['start_url']['url'], safe='')
                else:
                    self.start_url = self.url_config['start_url']['url']
            else:
                self.start_url = ""
        LOGGER.info("processed start url:{}".format(self.start_url))

    def process_end_url(self):
        if 'url' in self.url_config['end_url'] and self.url_config['end_url']['url']:
            if self.url_config['end_url']['url'] not in self.input_url:
                if 'encode' in self.url_config['end_url'] and self.url_config['end_url']['encode']:
                    self.end_url = urllib.quote(self.url_config['end_url']['url'], safe='')
                else:
                    self.end_url = self.url_config['end_url']['url']
            else:
                self.end_url = ""

        LOGGER.info("processed end url:{}".format(self.end_url))


    def process_main_url_encode(self):
        if self.url_config['encode_main_url']:
            if "%" not in self.input_url:
                self.input_url = urllib.quote(self.input_url, safe='')
        LOGGER.info("processed main url encode:{}".format(self.input_url))

    def assign_output_url(self):
        self.output_url = self.input_url

        if 'url' in  self.url_config['start_url'] and self.url_config['start_url']['url']:
            if self.url_config['start_url']['url'] not in self.output_url:
                self.output_url = self.start_url+self.output_url

        if 'url' in self.url_config['end_url'] and self.url_config['end_url']['url']:
            if self.url_config['end_url']['url'] not in self.output_url:
                self.output_url = self.output_url+self.end_url

    def replace_strings(self):
        for item in self.url_config['replace']:

            if item['encode']:
                item['replace_string'] = urllib.quote(item['replace_string'], safe='')
            if item['replace_string'] not in self.output_url:
                self.output_url = self.output_url.replace(item['find_string'], item['replace_string'])




    def process_output_url(self):
        self.add_or_replace_tags()
        self.process_main_url_encode()
        self.process_start_url()
        self.process_end_url()
        self.assign_output_url()
        self.replace_strings()


if __name__ == '__main__':

    dp = DeepLink("https://www.snapdeal.com/products/jewelry-coins-bars?sort=plrty")
    dp.process_output_url()
    print dp.output_url


    dp = DeepLink("https://www.ajio.com/s/big-deal-indeed")
    dp.process_output_url()
    print dp.output_url

    dp = DeepLink("https://www.swiggy.com/gurgaon")
    dp.process_output_url()
    print dp.output_url


    dp = DeepLink("https://www.foodpanda.in/restaurant/cn6lw/yo-china")
    dp.process_output_url()
    print dp.output_url

    dp = DeepLink("http://www.moglix.com/office-supplies/office-machines/214190000")
    dp.process_output_url()
    print dp.output_url


    dp = DeepLink("http://www.maxfashion.in/c/maxmen-tops-polos?q=badge.title%3A30%25%20OFF")
    dp.process_output_url()
    print dp.output_url


    dp = DeepLink("https://www.zomato.com/mumbai")
    dp.process_output_url()
    print dp.output_url

    dp = DeepLink("https://in.bookmyshow.com/hyderabad")
    dp.process_output_url()
    print dp.output_url




@app.route('/api/1.0/get-output-deep-link-url', methods=['POST'])
def get_output_deeplink_url():
    try:
        if 'url' not in request.json:
            raise ReturnException(message="url not found in payload", status_code=400)
        LOGGER.info("payload url is:{0}".format(request.json['url']))
        if not request.json['url']:
            raise ReturnException(message="url shold not be empty", status_code=400)
            LOGGER.error("url shold not be empty")

        # read affliated network from url and get all details from databse
        from urlparse import urlparse
        parsed_uri = urlparse(request.json['url'])
        if not parsed_uri.netloc:
            raise ReturnException(message="url not valid", status_code=400)
            LOGGER.error("url not valid")
        item = find_db_affiliate_network(request.json['url'])
        LOGGER.info("deep link database configuration data:{}".format(item))
        dp = DeepLink(request.json['url'], item)
        dp.process_output_url()
        response = jsonify(error='', data={"output_url": dp.output_url})
        response.status_code = 200
        return response

    except Exception as e:
        LOGGER.error(str(e))
        abort(401, str(e))


