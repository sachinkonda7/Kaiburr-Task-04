package com.kaiburr.taskapi.controller;

import com.kaiburr.taskapi.model.Task;
import com.kaiburr.taskapi.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://127.0.0.1:3000"
        },
        maxAge = 3600
)
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<Task> getAll() {
        return taskService.getAll();
    }

    @GetMapping("/{id}")
    public Task getOne(@PathVariable String id) {
        return taskService.getById(id);
    }

    @GetMapping("/search")
    public List<Task> search(@RequestParam(name = "name", required = false) String name) {
        return taskService.searchByName(name);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Task create(@Valid @RequestBody TaskPayload payload) {
        return taskService.create(toTask(payload));
    }

    @PutMapping("/{id}")
    public Task update(@PathVariable String id, @Valid @RequestBody TaskPayload payload) {
        return taskService.update(id, toTask(payload));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        taskService.delete(id);
    }

    @PutMapping("/{id}/execute")
    public Map<String, Object> execute(@PathVariable String id) {
        return taskService.executeTask(id);
    }

    private Task toTask(TaskPayload payload) {
        Task task = new Task();
        task.setName(payload.name());
        task.setOwner(payload.owner());
        task.setCommand(payload.command());
        return task;
    }
}
