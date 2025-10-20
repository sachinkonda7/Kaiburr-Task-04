package com.kaiburr.taskapi.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tasks")
public class Task {

    @Id
    private String id;
    private String name;
    private String owner;
    private String command;
    private TaskExecution lastExecution;

    public String getId() { return id; }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() { return name; }

    public void setName(String name) {
        this.name = name;
    }

    public String getOwner() { return owner; }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public String getCommand() { return command; }

    public void setCommand(String command) {
        this.command = command;
    }

    public TaskExecution getLastExecution() { return lastExecution; }

    public void setLastExecution(TaskExecution lastExecution) {
        this.lastExecution = lastExecution;
    }
}
