cd /home/satya/Desktop/fab_promo_codes
source env/bin/activate
cd fab_promo_codes_api
#python server.py
gunicorn --bind 0:8001 --timeout 1000 server:app --env env_name=local
