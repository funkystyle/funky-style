from flask import make_response, Response

from fab import app

@app.route('/sitemap_index.xml')
def sitemap_index():
    return Response(open('sitemap_xml_files/sitemap_index.xml').read(), mimetype='text/xml')

@app.route('/sitemap_stores.xml')
def sitemap_stores():
    return Response(open('sitemap_xml_files/sitemap_stores.xml').read(), mimetype='text/xml')


@app.route('/sitemap_categories.xml')
def sitemap_categories():
    return Response(open('sitemap_xml_files/sitemap_categories.xml').read(), mimetype='text/xml')

@app.route('/sitemap_deals.xml')
def sitemap_deals():
    return Response(open('sitemap_xml_files/sitemap_deals.xml').read(), mimetype='text/xml')


@app.route('/sitemap_cms_pages.xml')
def sitemap_cms_pages():
    return Response(open('sitemap_xml_files/sitemap_cms_pages.xml').read(), mimetype='text/xml')


@app.route('/sitemap_deal_categories.xml')
def sitemap_deal_categories():
    return Response(open('sitemap_xml_files/sitemap_deal_categories.xml').read(), mimetype='text/xml')


@app.route('/sitemap_deal_brands.xml')
def sitemap_deal_brands():
    return Response(open('sitemap_xml_files/sitemap_deal_brands.xml').read(), mimetype='text/xml')


@app.route('/sitemap_blog.xml')
def sitemap_blog():
    return Response(open('sitemap_xml_files/sitemap_blog.xml').read(), mimetype='text/xml')

