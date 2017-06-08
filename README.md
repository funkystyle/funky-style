# FAB-PROMO-CODES-API

## Installation:

    * step 1: install miniconda to use conda package manager:

        * download miniconda:
            wget https://repo.continuum.io/miniconda/Miniconda2-latest-Linux-x86_64.sh
        * install miniconda: bash Miniconda2-latest-Linux-x86_64.sh
        (by default it will install Python 2.7.13, fab api currently supported on python 2.7.13)

    * step 2: setup virtualenv:

        * install virtualenv using conda:
                if we install miniconda it will install at "/home/<user_name>/miniconda2"
                activate root environment to access conda package
                 cd /home/<user_name>/miniconda2
                 source bin/activate
                 Note: now conda package available,
                       we can use to install another environment for fab api rather than default root env.

        * creating fab_env and installing depences:

                conda create --name fab_env -f environment.yml

        * activate virtualenv:

                source fab_name/bin/activate

        * mongodb installation:
            conda install -c anaconda mongodb=3.3.9

## Running:

    * In the configuration folder, we have to edit json files based on environment
    * Edit run.sh file in scripts folder:

            * edit path of virtualenv and project folder

            * give proper env_name=dev|tst|prd|stg

    * Running project:

             run ./run.sh file to start project.

## Api Urls information

    * Test Api URL: ""

    *  /api/1.0/auth/signup:**
        * Desc: creates or registers users
        * Method: POST,
        * Payload:


            ```
            [{
                 "first_name": "first name",
                 "last_name": "last name",
                 "email": "satya@example.com",
                 "mobile_number": "mobile number",
                 "password": "password",
                 "city": "city",
                 "age": 25,
                 "gender": "female",
                 "status": "active",
                 "user_level":["editor"]
            }]
            ```
            Note: user_level should be in ["user", "admin", "editor", "submitter"]
                  gender should be male or female
                  status default active, but if admin creating user after logged in he can
                  assign active, inactive, deleted
                  email id and mobile number should be unique while registration

                  ** admin_creation_token is you pass this field name in payload admin will be created.
                  admin_creation_token value should be flask token(ask developer to get it)


    *  /api/1.0/auth/login:**
        * Desc: login user with email and password.
        * Method: POST,
        * Payload:


            ```
            {
                 "email": "",
                 "password": ""
            }
            ```
           Note: login endpoint will return token that token will be used for all other CRUD operations.

    *  /api/1.0/auth/me:**
        * Desc: Getting current user information.
        * Method: GET,

    *  /api/1.0/auth/logout:**
        * Desc: loggout current loggedin user.
        * Method: GET,

    *  api/1.0/auth/send-forgot-password-link:
        * Desc: sends forgot password link to user email id.
        * Method: POST,
        * Payload:


            ```
               {
                    "email": ""
                }

            ```

    *  /api/1.0/auth/change-password:**
        * Desc: setting new password to user account.
        * Method: POST,
        * Payload:
            ```
                {
                    "user_id": "",
                    "token": "",
                    "new_password": ""
                }
            ```
           Note: token will sent to user email id while doing forgot password operation.

    *  /api/1.0/auth/email-activation:**
        * Desc: activation of user registered email.
        * Method: POST,
        * Payload:
            ```
                {
                    "user_id": "",
                    "token": ""
                }
            ```
           Note: token will sent to user email id while doing registration operation.

    * /api/1.0/persons?where={"field_name":"value"}&?sort=field_name,-field_name:
        *Desc: finding person or filtering person. we can apply any mongo db get query to where statement.
        * Method: GET

    * /api/1.0/delete-documents
        * Desc: delete multiple documents from given collection.
        * Method: POST
        * payload: [{"resource_name": "<name of resources>", "ids":[1,2,3]}]
    * /api/1.0/persons/<id of document>:
        * Desc: updating specific document.
        * Method: PATCH
        * Payload: key value fields of persons collections.

    *  common CRUD operation for all following collections:
        * stores
        * deals
        * categories
        * coupons
        * cms_pages
        * deal_brands
        * deal_categories
        * banner
        * master_seo
        * coupons_comments
        * coupons_reports
        * blog
        ** OPERATIONS:
            * INSERT: /api/1.0/<name of collection from above list>
              Method: post
              payload: json format.
            * UPDATE: /api/1.0/<name of collection>/<id of document>
              Method: PATCH
              payload: json format
            * DELETE: /api/1.0/<name of collection>/<id of document>
              METHOD: DELETE
              payload: json format
            * FETCH: /api/1.0/<name of collection>/?where=<required json query>&<sort-option>&<pagination>&<count of documents>&
                                                          &<projection fields>
              METHOD: GET
        * getting all collect names:
            * FETCH: /api/1.0/get-collections
              METHOD: GET
        * getting all field names of specific collection:
            * FETCH: /api/1.0/get-fields-info
            * METHOD: post
            *payload:{'collection_name': <name of collection>}

    * Comman:
        1. for update or delete documents and fetching documents we need role based permissions
        2. should provide access_token in headers in following format:
            {"authorization":"<login token>"}

    * Deep linking
    --------------
    If you want to get deep link for particular url we have to store all affiliate network details into mongodb in below
    format:

        {
            "affiliate_network": "https://www.swiggy.com/gurgaon", ## format: http(s)://www.{domain name}/{extra url part}
            ## it should be unique
            "start_url": {
                "url": "http://tracking.clickonik.com/aff_c?offer_id=26&aff_id=1428&url=", ## start url is appended to output url
                "encode": False ## do you want to encode start url also then say true or false
            },
            "end_url":{
                "url": "",## end url can be appended to main url
                "encode": False ## do you want to encode url
            },
            "tags":{
             "tags": "", ## query parameters to output url
             "replace": False, ## replace will replace all query parameter , if replace is false query parameter will be appended
            },
            "encode_main_url": True, ## do you want to encode input url
            "replace":[
                {
                    "replace_string":"hyderabad/restaurants?utm_source=affiliate&utm_medium=clickonik",
                    "find_string":"gurgaon", "encode":True
                }
            ] ## replace string will replace specific part with replaceable strings,
            ##with encode parameter we can encode those strings
        }

     ** OPERATIONS:
            * INSERT: /api/1.0/deep_link
              Method: post
              payload: json format.
              above json data
            * UPDATE: /api/1.0/deep_link/<id of document>
              Method: PATCH
              payload: json format
            * DELETE: /api/1.0/deep_link/<id of document>
              METHOD: DELETE
              payload: json format
            * FETCH: /api/1.0/deep_link/?where=<required json query>&<sort-option>&<pagination>&<count of documents>&
                                                          &<projection fields>
              METHOD: GET

            ** /api/1.0/get-output-deep-link-url
               Method: POST,
               Payload: {"url": "<url>"}



## Roles and Responsibilites:

    Roles of Employees:

    Admin: can able to do all operations

    Submitter :
    1. Can able to submit the coupon, Not able to edit coupons, delete coupons. He can view the coupons
    2. Can able to submit the deal, Not able to edit deal, delete deal. He can view the deals
    3. Not able to do create, edit, delete categories. He can view the categories
    4. Not able to do create, edit, delete stores. He can view the stores

    Editor:
    1. Can able to submit the coupon, edit coupons and delete coupons.
    2. Can able to submit the deal, edit deal and delete deal.
    3. Not able to do create, edit, delete categories. He can view the categories
    4. Not able to do create, edit, delete stores. He can view the stores

    Satya, We need one field in while adding categories, Category type-> Generic, Bank, Festival, Wallet, City - To get easy filters from front end.

    Please Let me know your free time, We can discuss about pending tasks in deals.

    table wise permissions
    ----------------------:
    1. persons:
        view: admin only



## Gunicorn: Gunicorn 'Green Unicorn' is a Python WSGI HTTP Server for UNIX.

   * Setup gunicorn with python application:

        gunicorn --bind host_name:port --timeout <count value> <APP_MODULE>:<Python_WSGI_APP> --env env_name=<environment name>

        EX: gunicorn --workers 3 --bind 0:8001 --timeout 1000 runserver:app --env env_name=tst
        Note: we can use --workers or --threads option to serve incoming request by multiple threads or process.

   * writing UpStart Script:

        * create file in /etc/init/name.conf
        * insert folowing lines into name.conf file:

            description "Gunicorn application server running fab project"

            start on runlevel [2345]
            stop on runlevel [!2345]

            respawn
            setuid user
            setgid www-data
            exec gunicorn --bind 0:8001 --workers 3 --timeout 1000 runserver:app --env env_name=tst

   * Starting and Stoping project:

        sudo service fab start
                or
        sudo service fab stop
                or
        sudo service fab restart

Note: if web server not serving static data we dnt need to configure Proxy server.
       otherwise recomanded Proxy is NGINx. If you choose another proxy server you need to make sure that it buffers slow clients
      when you use default Gunicorn workers. Without this buffering Gunicorn will be easily susceptible to
      denial-of-service attacks. You can use Hey to check if your proxy is behaving properly.




Installation of lxml:

sudo apt-get install libxml2-dev libxslt-dev python-dev
pip install lxml
