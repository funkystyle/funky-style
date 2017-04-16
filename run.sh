cd /home/ubuntu
source miniconda2/bin/activate
cd fab
gunicorn --bind 0:8000 --timeout 1000 server:app --env env_name=tst
