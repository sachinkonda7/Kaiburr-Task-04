# Task 4 - CI/CD Pipeline (GitHub Actions)

This repository implements **Task 4** of the Kaiburr assessment: delivering a continuous integration and delivery workflow for the sample application created in Tasks 1 and 3. The pipeline is built with **GitHub Actions** and fulfills the requirement to perform both a code build and a Docker image build on every change.

## Pipeline Overview
- **Workflow file**: `.github/workflows/ci.yml`
- **Triggers**: `push` and `pull_request` events targeting the `main` branch.
- **Runtime**: `ubuntu-latest` GitHub-hosted runner.
- **Services**: Ephemeral MongoDB 7 container used by the backend tests.
- **Outputs**: Verified backend JAR, production-ready frontend build artifacts, and a Docker image tagged with the current commit SHA.

## Job Breakdown
The single job named `build` executes the following steps in order:

1. **Checkout**
   - Uses `actions/checkout@v4` to fetch the repository.

2. **Set up Java**
   - Configures Temurin JDK 17 via `actions/setup-java@v4`.
   - Enables Maven dependency caching for faster runs.

3. **Backend Build**
   - Runs `mvn -B clean package` to compile the Spring Boot service, execute unit tests, and assemble the JAR.

4. **Set up Node.js**
   - Installs Node.js 22 with `actions/setup-node@v4`.
   - Caches npm dependencies using `frontend/package-lock.json`.

5. **Frontend Build**
   - `npm ci` installs dependencies in the `frontend` directory.
   - `npm run lint` enforces TypeScript and React lint rules.
   - `npm run build` creates an optimized Vite production bundle.

6. **Docker Image**
   - Executes `docker build -t taskapi:${{ github.sha }} .` to create a container image that packages the freshly built backend artifacts.

MongoDB is declared in the `services` block to supply the backend with a live database during the Maven test phase. Health checks ensure the database is available before tests run.

## Environment Variables and Secrets
- `SPRING_DATA_MONGODB_URI` is defined at the workflow level so the backend connects to the in-runner MongoDB instance.
- No external secrets are required for this pipeline. If you push images to a registry, add credentials through the repository's GitHub Actions secrets and extend the workflow accordingly.

## Running the Pipeline Locally
You can mirror the GitHub Actions run on your workstation using [`act`](https://github.com/nektos/act):

```powershell
act -j build
```

Requirements:
- Docker installed and running.
- The default `act` image provides Node.js and Java; when prompted, select the medium or large image to include Docker-in-Docker support.

## Customization Tips
- **Branch strategy**: Adjust the `on:` block if you need the workflow on additional branches or tags.
- **Test matrix**: Add a strategy matrix to run against multiple Java or Node.js versions.
- **Artifact publishing**: Append `actions/upload-artifact` steps to persist the Maven JAR or Vite build output.
- **Container registry**: Append a push step (for example, `docker/login-action` and `docker/build-push-action`) to publish images to Docker Hub, ECR, or GHCR.

## Troubleshooting
- **MongoDB health check fails**: Increase retries or verify that your tests close connections. The current configuration performs five health probes at ten-second intervals.
- **Docker build errors**: Confirm the backend build produced `target/taskapi.jar` and that the Dockerfile's exposed port matches the application port (`8081` for this project).
- **npm cache misses**: Double-check `frontend/package-lock.json` is committed; the cache key relies on this file.
- **Workflow permissions**: Ensure your repository allows GitHub Actions to run (`Settings > Actions > General > Allow all actions and reusable workflows`).

## Pipeline Evidence
- Workflow summary view  
  ![GitHub Actions workflow summary](.github/workflows/ci-cd-images/Screenshot%202025-10-20%20230656.png)
- Job details with individual steps  
  ![GitHub Actions job details](.github/workflows/ci-cd-images/Screenshot%202025-10-20%20230705.png)
