# GitHub Actions CI/CD Setup Guide

This document explains the GitHub Actions workflows and how to configure them.

## Workflows Created

### 1. **CI - Build & Test** (`ci.yml`)
**Triggers:** Push to `main` or Pull Requests
- ✅ Builds and tests backend (Node.js)
- ✅ Builds and tests frontend (React)
- ✅ Runs Dockerfile security scans with Trivy
- 📊 Uploads artifacts and security reports

### 2. **Docker - Build & Push to Hub** (`docker-build-push.yml`)
**Triggers:** After CI passes OR direct push to `main`
- 🐳 Builds backend Docker image
- 🐳 Builds frontend Docker image
- 📤 Pushes to Docker Hub automatically
- 🏷️ Tags with git SHA, branch, and `latest`
- 📝 Updates Docker Hub repository descriptions

### 3. **Deploy - AWS EKS** (`deploy-aws.yml`)
**Triggers:** After Docker push OR manual
- ☁️ Connects to AWS EKS cluster
- 🔄 Updates Kubernetes deployments
- ✅ Verifies rollout status
- 🏥 Runs health checks

### 4. **Deploy - Azure** (`deploy-azure.yml`)
**Triggers:** After Docker push OR manual
- ☁️ Connects to Azure subscription
- 🚀 Deploys to App Service
- ✅ Verifies deployment
- 🏥 Runs health checks

### 5. **Manual Deploy** (`manual-deploy.yml`)
**Triggers:** Manual dispatch from GitHub UI (Actions tab)
- 🎮 Choose environment (staging/production)
- 🎯 Choose deployment target (AWS, Azure, Docker Hub)
- 👤 Logged by who triggered it

---

## Setup Instructions

### Step 1: Add GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

#### Required for all workflows:
```
DOCKERHUB_USERNAME = yaswanth2408
DOCKERHUB_TOKEN = <your Docker Hub personal access token>
DOCKER_EMAIL = <your email>
```

#### Optional for AWS EKS deployment:
```
AWS_ACCESS_KEY_ID = <your AWS access key>
AWS_SECRET_ACCESS_KEY = <your AWS secret key>
AWS_REGION = us-east-1
EKS_CLUSTER_NAME = recipica-cluster
```

#### Optional for Azure deployment:
```
AZURE_CREDENTIALS = <JSON from az ad sp create-for-rbac>
AZURE_RESOURCE_GROUP = recipica-rg
AZURE_BACKEND_APP_NAME = recipica-api
AZURE_FRONTEND_APP_NAME = recipica-web
```

### Step 2: Create Docker Hub Personal Access Token

1. Go to https://hub.docker.com/settings/security
2. Click "New Access Token"
3. Name it `github-actions`
4. Copy the token and add to GitHub Secrets as `DOCKERHUB_TOKEN`

### Step 3: Setup AWS Credentials (if deploying to AWS)

```bash
# Create IAM user for GitHub Actions
aws iam create-user --user-name github-actions

# Attach EKS access policy
aws iam attach-user-policy \
  --user-name github-actions \
  --policy-arn arn:aws:iam::aws:policy/AmazonEKSClusterPolicy

# Create access keys
aws iam create-access-key --user-name github-actions
```

### Step 4: Setup Azure Credentials (if deploying to Azure)

```bash
az ad sp create-for-rbac \
  --name github-actions \
  --role contributor \
  --scopes /subscriptions/<SUBSCRIPTION_ID>
```

Then base64 encode the JSON output and add as `AZURE_CREDENTIALS` secret.

### Step 5: Create Kubernetes Manifests (if using AWS EKS)

Create `k8s/backend-deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: recipica-backend
  namespace: recipica
spec:
  replicas: 2
  selector:
    matchLabels:
      app: recipica-backend
  template:
    metadata:
      labels:
        app: recipica-backend
    spec:
      imagePullSecrets:
      - name: docker-registry-secret
      containers:
      - name: recipica-backend
        image: yaswanth2408/recipica-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: production
        livenessProbe:
          httpGet:
            path: /api/health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
```

Create `k8s/frontend-deployment.yaml`:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: recipica-frontend
  namespace: recipica
spec:
  replicas: 2
  selector:
    matchLabels:
      app: recipica-frontend
  template:
    metadata:
      labels:
        app: recipica-frontend
    spec:
      imagePullSecrets:
      - name: docker-registry-secret
      containers:
      - name: recipica-frontend
        image: yaswanth2408/recipica-frontend:latest
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10
```

---

## How the Pipeline Works

```
1. Push to main branch
   ↓
2. CI workflow runs (build & test)
   ↓
3. Docker workflow builds images
   ↓
4. Images pushed to Docker Hub
   ↓
5. Deployment workflow triggers (AWS or Azure)
   ↓
6. Services deployed and verified
```

---

## Monitoring & Debugging

### View workflow status:
- Go to **Actions** tab in your GitHub repo
- Click on the workflow run to see detailed logs

### Common issues:

#### Docker push fails:
- Check `DOCKERHUB_TOKEN` is valid
- Ensure `DOCKERHUB_USERNAME` matches your Docker Hub username

#### AWS deployment fails:
- Verify EKS cluster exists and is reachable
- Check AWS credentials have proper permissions
- Ensure `kubeconfig` is accessible

#### Azure deployment fails:
- Check `AZURE_CREDENTIALS` JSON format
- Verify App Service names exist
- Check resource group name is correct

---

## Next Steps

1. ✅ Add secrets to GitHub
2. ✅ Create Kubernetes manifests (if using AWS)
3. ✅ Push this to GitHub
4. ✅ Watch the pipeline run in Actions tab
5. ✅ Verify images appear in Docker Hub

---

## Tips for Production

- Consider adding approval gates before deployment
- Use semantic versioning for Docker tags
- Set up notifications for failed deployments
- Monitor deployment health with CloudWatch/Azure Monitor
- Use separate environments (dev, staging, production) with different secrets
