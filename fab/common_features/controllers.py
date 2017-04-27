from flask import request
from datetime import  datetime
import os
from werkzeug import secure_filename
from settings import CONFIG_DATA, BASE_DIR
from fab import app

ALLOWED_EXTENSIONS = CONFIG_DATA['ALLOWED_EXTENSIONS']
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS


@app.route('/api/1.0/common/file-upload', methods=['POST'])
def fileupload():
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            dt = str(datetime.datetime.now())
            renamed_filename = dt+'_'+filename
            file.save(os.path.join(BASE_DIR, CONFIG_DATA['UPLOAD_FOLDER'], renamed_filename))
            print os.path.join(BASE_DIR, CONFIG_DATA['UPLOAD_FOLDER'], renamed_filename),'============'
            #print os.path.join(app.config['UPLOAD_FOLDER'], renamed_filename)
        return os.path.join(app.config['UPLOAD_FOLDER'], renamed_filename)