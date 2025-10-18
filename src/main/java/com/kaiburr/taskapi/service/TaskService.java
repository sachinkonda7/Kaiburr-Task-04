package com.kaiburr.taskapi.service;

import com.kaiburr.taskapi.exception.ResourceNotFoundException;
import com.kaiburr.taskapi.model.Task;
import com.kaiburr.taskapi.model.TaskExecution;
import com.kaiburr.taskapi.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.time.Instant;
import java.util.List;

@Service
public class TaskService {
    private final TaskRepository repo;

    public TaskService(TaskRepository repo) {
        this.repo = repo;
    }

    // ✅ Get all tasks
    public List<Task> getAll() {
        return repo.findAll();
    }

    // ✅ Get task by ID
    public Task getById(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + id));
    }

    // ✅ Create or update a task
    public Task createOrUpdate(Task task) {
        validateCommand(task.getCommand());
        return repo.save(task);
    }

    // ✅ Delete a task
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Task not found with ID: " + id);
        }
        repo.deleteById(id);
    }

    // ✅ Search tasks by name
    public List<Task> search(String name) {
        return repo.findByNameContainingIgnoreCase(name);
    }

    // ✅ Execute a task command (cross-platform, with debug + safety)
    public TaskExecution execute(String id) throws IOException {
        Task task = getById(id);
        validateCommand(task.getCommand());

        Instant start = Instant.now();
        String output;

        try {
            ProcessBuilder builder;

            // Detect OS and use appropriate shell
            if (System.getProperty("os.name").toLowerCase().contains("win")) {
                builder = new ProcessBuilder("cmd.exe", "/c", task.getCommand());
            } else {
                builder = new ProcessBuilder("bash", "-c", task.getCommand());
            }

            builder.redirectErrorStream(true);
            Process process = builder.start();

            // Read process output
            StringBuilder result = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    result.append(line).append(System.lineSeparator());
                }
            }

            int exitCode = process.waitFor();
            output = result.toString().trim();

            // Print command and output for debugging
            System.out.println("Executed command: " + task.getCommand());
            System.out.println("Command output: " + output);
            System.out.println("Exit code: " + exitCode);

            if (exitCode != 0) {
                throw new IOException("Command failed with exit code " + exitCode);
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Command execution interrupted", e);
        } catch (Exception e) {
            e.printStackTrace(); // log exact cause
            throw new IOException("Error executing command: " + e.getMessage(), e);
        }

        Instant end = Instant.now();

        // ✅ Save the execution record
        TaskExecution exec = new TaskExecution();
        exec.setStartTime(start);
        exec.setEndTime(end);
        exec.setOutput(output.isEmpty() ? "(no output)" : output);

        task.addTaskExecution(exec);
        repo.save(task);

        return exec;
    }

    // ✅ Validate command inputs (prevent unsafe ops)
    private void validateCommand(String cmd) {
        if (cmd == null || cmd.isBlank()) {
            throw new IllegalArgumentException("Command cannot be empty");
        }

        String lower = cmd.toLowerCase();
        if (lower.contains("rm ") ||
            lower.contains("del ") ||
            lower.contains("shutdown") ||
            lower.contains("format") ||
            lower.contains("erase") ||
            lower.contains("poweroff")) {
            throw new IllegalArgumentException("Unsafe command detected!");
        }
    }
}
