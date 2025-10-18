package com.kaiburr.taskapi.model;

import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Document(collection = "tasks")
public class Task {
    @Id
    private String id;

    @NotBlank
    private String name;

    @NotBlank
    private String owner;

    @NotBlank
    private String command;

    private List<TaskExecution> taskExecutions = new ArrayList<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getCommand() {
        return command;
    }

    public void setCommand(String command) {
        this.command = command;
    }

    public List<TaskExecution> getTaskExecutions() {
        return Collections.unmodifiableList(taskExecutions);
    }

    public void setTaskExecutions(List<TaskExecution> taskExecutions) {
        if (taskExecutions == null) {
            this.taskExecutions = new ArrayList<>();
        } else {
            this.taskExecutions = new ArrayList<>(taskExecutions);
        }
    }

    public void addTaskExecution(TaskExecution execution) {
        if (execution != null) {
            taskExecutions.add(execution);
        }
    }
}
