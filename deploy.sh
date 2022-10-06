docker build -t shayim/multi-client -t shayim/multi-client:$SHA -f ./client/Dockerfile ./client 
docker build -t shayim/multi-server -t shayim/multi-server:$SHA -f ./server/Dockerfile ./server 
docker build -t shayim/multi-worker -t shayim/multi-worker:$SHA -f ./worker/Dockerfile ./worker 

docker push shayim/multi-client
docker push shayim/multi-server
docker push shayim/multi-worker

docker push shayim/multi-client:$SHA
docker push shayim/multi-server:$SHA
docker push shayim/multi-worker:$SHA

# kubectl apply -f k8s

# kubectl set image deployments/client-deployment client=shayim/multi-client:$SHA
# kubectl set image deployments/server-deployment api=shayim/multi-server:$SHA
# kubectl set image deployments/worker-deployment worker=shayim/multi-worker:$SHA