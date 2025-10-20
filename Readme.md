#  Kaiburr Task 2 – Kubernetes Deployment

##  Overview
This repository demonstrates the Kubernetes deployment of the **Task API** (from Task 1) using **Spring Boot** and **MongoDB**.  
It includes Dockerization, Kubernetes manifests, persistent storage, and command execution inside Kubernetes pods.

---

##  Architecture
```
+--------------------------+
|      Spring Boot App     |  <-- NodePort Service (port 30080)
|  (task-api Deployment)   |
+-----------+--------------+
            |
            v
+--------------------------+
|       MongoDB Pod        |  <-- ClusterIP Service (port 27017)
|  (Persistent Volume PVC) |
+--------------------------+
```

---

##  Technologies Used
| Component | Tool |
|------------|------|
| Backend | Spring Boot 3.3.0 |
| Database | MongoDB |
| Containerization | Docker |
| Orchestration | Kubernetes (Minikube) |
| Registry | Docker Hub |
| Language | Java 17 |
| K8s Client | io.kubernetes:client-java |

---

##  Setup Steps

### 1️ Build & Push Docker Image
```bash
docker build -t kaiburr-task-api:v5 .
docker tag kaiburr-task-api:v5 sachinkonda/kaiburr-task-api:v5
docker push sachinkonda/kaiburr-task-api:v5
```

---

### 2️ Deploy MongoDB with Helm
```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install mongo bitnami/mongodb   --set auth.rootPassword=rootpwd,auth.username=root,auth.password=rootpwd,auth.database=tasksdb   --set persistence.enabled=true   --set persistence.size=1Gi
```

---

### 3️ Apply App Manifests

**deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: task-api
  labels:
    app: task-api
spec:
  replicas: 1
  selector:
    matchLabels:
      app: task-api
  template:
    metadata:
      labels:
        app: task-api
    spec:
      containers:
        - name: task-api
          image: sachinkonda/kaiburr-task-api:v5
          ports:
            - containerPort: 8081
          env:
            - name: SPRING_DATA_MONGODB_URI
              value: "mongodb://root:rootpwd@mongo-mongodb.default.svc.cluster.local:27017/tasksdb?authSource=admin"
```

**service.yaml**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: task-api-service
spec:
  type: NodePort
  selector:
    app: task-api
  ports:
    - protocol: TCP
      port: 8081
      targetPort: 8081
      nodePort: 30080
```

Apply:
```bash
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

---

### 4️ Verify Deployments
```bash
kubectl get pods
kubectl get svc
```

 **Screenshot #1 – Pods list**  
![Pods Screenshot](images/pods.png)

 **Screenshot #2 – Services list**  
![Services Screenshot](images/svc.png)

---

### 5️ Access the Application
```bash
minikube service task-api-service --url
```
Example URL:  
`http://192.168.49.2:30080/api/tasks`

 **Screenshot #3 – API in browser**  
![API Screenshot](images/api.png)

---

##  API Testing (Postman)

### ➤ Create a Task
**POST** `http://192.168.49.2:30080/api/tasks`
```json
{
  "name": "Print Hello",
  "owner": "Sachin Konda",
  "command": "echo Hello master!"
}
```

 **Screenshot #4 – Postman create**  
![Postman Create](images/postman-create.png)

---

### ➤ Execute Task in Kubernetes
**PUT**  
`http://192.168.49.2:30080/api/tasks/<id>/execute`

 Example Response:
```json
{
  "taskId": "671aebd82392a5421d97f113",
  "status": "SUCCESS",
  "exitCode": 0,
  "output": "Hello master!",
  "startTime": "2025-10-19T10:25:43.521Z",
  "endTime": "2025-10-19T10:25:44.002Z"
}
```

 **Screenshot #5 – Postman execute**  
![Postman Execute](images/postman-execute.png)

---

##  MongoDB Verification
Connect with **MongoDB Compass**:
```
mongodb://root:rootpwd@localhost:27017/tasksdb?authSource=admin
```

 **Screenshot #6 – MongoDB collection**  
![Mongo Screenshot](images/mongo.png)

---

##  Persistent Volume Check
```bash
kubectl delete pod -l app=mongo-mongodb
kubectl get pods
```

 **Screenshot #7 – Data persisted after pod recreate**  
![PV Screenshot](images/pv.png)


---

###  Screenshot Folder Structure
```
.
├── deployment.yaml
├── service.yaml
├── Dockerfile
├── README.md
└── images/
    ├── pods.png
    ├── services.png
    ├── postman-create.png
    ├── postman-execute.png
    ├── mongo.png
    ├── pv.png

    
```