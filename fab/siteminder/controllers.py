from flask import make_response

from fab import app

from settings import LOGGER



@app.route('/api/1.0/sitemap-index')
def sitemap_index():
    return make_response(open('static/sitemap_xml_files/sitemap_main_index.xml').read())

@app.route('/api/1.0/sitemap-stores')
def sitemap_stores():
    return make_response(open('static/sitemap_xml_files/sitemap_stores.xml').read())

@app.route('/api/1.0/sitemap-categories')
def sitemap_categories():
    return make_response(open('static/sitemap_xml_files/sitemap_categories.xml').read())

@app.route('/api/1.0/sitemap-deals')
def sitemap_deals():
    return make_response(open('static/sitemap_xml_files/sitemap_deals.xml').read())

@app.route('/api/1.0/sitemap-cms-pages')
def sitemap_cms_pages():
    return make_response(open('static/sitemap_xml_files/sitemap_cms_pages.xml').read())

@app.route('/api/1.0/sitemap-deal-categories')
def sitemap_deal_categories():
    return make_response(open('static/sitemap_xml_files/sitemap_deal_categories.xml').read())

@app.route('/api/1.0/sitemap-deal-brands')
def sitemap_deal_brands():
    return make_response(open('static/sitemap_xml_files/sitemap_deal_brands.xml').read())

@app.route('/api/1.0/sitemap-blog')
def sitemap_blog():
    return make_response(open('static/sitemap_xml_files/sitemap_blog.xml').read())
