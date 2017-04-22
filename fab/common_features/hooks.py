from flask import abort
from flask import session
import json

from login_decorators import user_login_required, admin_login_required, abort_resource_deletion
from settings import  LOGGER

@admin_login_required
def before_returning_persons(response):
    LOGGER.info("persons api access processing after admin login verification")

@admin_login_required
def before_delete_persons_item(item):
    LOGGER.info("persons api delete item access processing after admin login verification")