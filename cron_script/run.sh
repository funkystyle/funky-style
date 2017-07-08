ps -ef | grep gunicorn | exec awk '{print "kill -9 " $2}' | sh -x
cd /home/ubuntu/fab
git add .
git commit -m 'committed before pull'
git pull origin fab-1.0

nohup ./run.sh &

sudo service nginx restart
