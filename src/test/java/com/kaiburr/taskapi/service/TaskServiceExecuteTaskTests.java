package com.kaiburr.taskapi.service;

import com.kaiburr.taskapi.exception.ResourceNotFoundException;
import com.kaiburr.taskapi.model.Task;
import com.kaiburr.taskapi.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TaskServiceExecuteTaskTests {

    @Mock
    private TaskRepository repository;

    private TaskService taskService;

    @BeforeEach
    void setUp() {
        taskService = new TaskService(repository);
    }

    @Test
    void executeTaskFallsBackToLocalProcessWhenClusterUnavailable() {
        Task task = new Task();
        task.setId("task-1");
        task.setName("Echo");
        task.setOwner("QA");
        task.setCommand("echo task-service");

        when(repository.findById("task-1")).thenReturn(Optional.of(task));
        when(repository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> response = taskService.executeTask("task-1");

        assertThat(response.get("status")).isEqualTo("SUCCESS");
        assertThat(response.get("exitCode")).isEqualTo(0);
        assertThat((String) response.get("output")).contains("task-service");

        ArgumentCaptor<Task> captor = ArgumentCaptor.forClass(Task.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getLastExecution()).isNotNull();
        assertThat(captor.getValue().getLastExecution().getOutput()).contains("task-service");
    }

    @Test
    void executeTaskThrowsWhenCommandMissing() {
        Task task = new Task();
        task.setId("task-2");
        task.setName("Invalid");
        task.setOwner("QA");
        task.setCommand("   ");

        when(repository.findById("task-2")).thenReturn(Optional.of(task));

        assertThrows(IllegalArgumentException.class, () -> taskService.executeTask("task-2"));
    }

    @Test
    void executeTaskThrowsWhenTaskNotFound() {
        when(repository.findById("unknown")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> taskService.executeTask("unknown"));
    }
}
