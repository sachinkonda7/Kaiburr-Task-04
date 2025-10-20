package com.kaiburr.taskapi.service;

import com.kaiburr.taskapi.exception.ResourceNotFoundException;
import com.kaiburr.taskapi.model.Task;
import com.kaiburr.taskapi.model.TaskExecution;
import com.kaiburr.taskapi.repository.TaskRepository;
import io.kubernetes.client.openapi.ApiClient;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.models.V1Container;
import io.kubernetes.client.openapi.models.V1ObjectMeta;
import io.kubernetes.client.openapi.models.V1Pod;
import io.kubernetes.client.openapi.models.V1PodSpec;
import io.kubernetes.client.util.Config;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private static final Logger LOGGER = LoggerFactory.getLogger(TaskService.class);

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    public List<Task> getAll() {
        return repository.findAll();
    }

    public Task getById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task with id '%s' not found".formatted(id)));
    }

    public Task create(Task task) {
        task.setId(null); // Allow MongoDB to create a fresh identifier
        return repository.save(task);
    }

    public Task update(String id, Task update) {
        Task existing = getById(id);
        existing.setName(update.getName());
        existing.setOwner(update.getOwner());
        existing.setCommand(update.getCommand());
        return repository.save(existing);
    }

    public List<Task> searchByName(String name) {
        if (name == null || name.isBlank()) {
            return getAll();
        }
        return repository.findByNameContainingIgnoreCase(name);
    }

    // 🔥 Modified method: Executes the command by creating a BusyBox pod in Kubernetes
    public Map<String, Object> executeTask(String id) {
        Task task = getById(id);
        if (task.getCommand() == null || task.getCommand().isBlank()) {
            throw new IllegalArgumentException("No command configured for task '%s'".formatted(id));
        }

        TaskExecution execution = new TaskExecution();
        execution.setStartTime(Instant.now());

        String output = "";
        int exitCode = 0;
        boolean executedInCluster = false;

        ApiClient client = tryCreateKubernetesClient();
        if (client != null) {
            try {
                io.kubernetes.client.openapi.Configuration.setDefaultApiClient(client);
                CoreV1Api api = new CoreV1Api(client);

                String podName = "task-executor-" + System.currentTimeMillis();
                String namespace = "default";

                V1Pod pod = new V1Pod()
                        .apiVersion("v1")
                        .kind("Pod")
                        .metadata(new V1ObjectMeta().name(podName))
                        .spec(new V1PodSpec()
                                .containers(List.of(
                                        new V1Container()
                                                .name("executor")
                                                .image("busybox")
                                                .command(List.of("sh", "-c", task.getCommand()))
                                ))
                                .restartPolicy("Never")
                        );

                api.createNamespacedPod(namespace, pod, null, null, null, namespace);
                output = "Pod '" + podName + "' created to execute: " + task.getCommand();
                executedInCluster = true;
            } catch (Exception ex) {
                LOGGER.warn("Kubernetes execution failed, attempting local execution instead: {}", ex.getMessage());
            }
        }

        if (!executedInCluster) {
            try {
                Process process = buildProcess(task.getCommand()).start();
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                    output = reader.lines().collect(Collectors.joining(System.lineSeparator()));
                }
                exitCode = process.waitFor();
                if (exitCode != 0 && (output == null || output.isBlank())) {
                    output = "Command exited with code %d".formatted(exitCode);
                }
            } catch (IOException ex) {
                exitCode = -1;
                output = "Failed to execute command locally: " + ex.getMessage();
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
                exitCode = -1;
                output = "Command execution interrupted: " + ex.getMessage();
            }
        }

        execution.setEndTime(Instant.now());
        execution.setOutput(output);
        task.setLastExecution(execution);
        repository.save(task);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("taskId", task.getId());
        response.put("status", exitCode == 0 ? "SUCCESS" : "FAILED");
        response.put("exitCode", exitCode);
        response.put("output", output);
        response.put("startTime", execution.getStartTime());
        response.put("endTime", execution.getEndTime());
        return response;
    }

    public void delete(String id) {
        Task task = getById(id);
        repository.delete(task);
    }

    // ⚙️ (No longer used for local exec, but kept for reference)
    private ProcessBuilder buildProcess(String command) {
        String os = System.getProperty("os.name").toLowerCase(Locale.ENGLISH);
        if (os.contains("win")) {
            return new ProcessBuilder("cmd.exe", "/c", command).redirectErrorStream(true);
        }
        return new ProcessBuilder("bash", "-lc", command).redirectErrorStream(true);
    }

    private ApiClient tryCreateKubernetesClient() {
        try {
            return Config.fromCluster();
        } catch (IOException clusterException) {
            try {
                return Config.defaultClient();
            } catch (Exception defaultClientException) {
                LOGGER.debug("Failed to load default Kubernetes client: {}", defaultClientException.getMessage());
                return null;
            }
        } catch (Exception ex) {
            LOGGER.debug("In-cluster Kubernetes configuration unavailable: {}", ex.getMessage());
            return null;
        }
    }
}
