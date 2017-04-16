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
            {
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
            }
            ```
            Note: user_level should be in ["user", "admin", "editor", "submitter"]
                  gender should be male or female
                  status default active, but if admin creating user after logged in he can
                  assign active, inactive, deleted
                  email id and mobile number should be unique while registration


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

## Gunicorn: Gunicorn 'Green Unicorn' is a Python WSGI HTTP Server for UNIX.

   * Setup gunicorn with python application:

        gunicorn --bind host_name:port --timeout <count value> <APP_MODULE>:<Python_WSGI_APP> --env env_name=<environment name>

        EX: gunicorn --workers 3 --bind 0:8001 --timeout 1000 runserver:app --env env_name=tst
        Note: we can use --workers or --threads option to serve incoming request by multiple threads or process.

   * writing UpStart Script:

        * create file in /etc/init/ccl.conf
        * insert folowing lines into ccl.conf file:

            description "Gunicorn application server running ccl project"

            start on runlevel [2345]
            stop on runlevel [!2345]

            respawn
            setuid user
            setgid www-data

            chdir /local/mnt/projects/ccl
            source ccl-commandline-api-env/bin/activate
            cd ccl-commandline-api
            exec gunicorn --bind 0:8001 --workers 3 --timeout 1000 runserver:app --env env_name=tst

   * Starting and Stoping project:

        sudo service ccl start
                or
        sudo service ccl stop
                or
        sudo service ccl restart

Note: if web server not serving static data we dnt need to configure Proxy server.
       otherwise recomanded Proxy is NGINx. If you choose another proxy server you need to make sure that it buffers slow clients
      when you use default Gunicorn workers. Without this buffering Gunicorn will be easily susceptible to
      denial-of-service attacks. You can use Hey to check if your proxy is behaving properly.





