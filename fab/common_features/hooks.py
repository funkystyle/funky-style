from flask import abort
from flask import session

from login_decorators import user_login_required, admin_login_required

@admin_login_required
def before_returning_persons(response):
    print 'use can proceed'