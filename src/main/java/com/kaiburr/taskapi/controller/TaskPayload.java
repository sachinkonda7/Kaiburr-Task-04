package com.kaiburr.taskapi.controller;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload for create and update task operations.
 */
public record TaskPayload(
        @NotBlank(message = "Task name is required")
        String name,

        @NotBlank(message = "Owner is required")
        String owner,

        @NotBlank(message = "Command is required")
        String command
) {
}
