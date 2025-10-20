import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Flex,
  Input,
  Space,
  Typography,
  message,
  notification,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { taskService, toApiError } from "@/services/taskService";
import type { ApiErrorInfo } from "@/services/taskService";
import type {
  ExecutionResponse,
  Task,
  TaskPayload,
} from "@/types/task";
import { TaskTable } from "./TaskTable";
import { TaskFormModal } from "./TaskFormModal";
import { TaskDetailsDrawer } from "./TaskDetailsDrawer";
import { CommandOutputModal } from "./CommandOutputModal";

const { Title, Text } = Typography;
const { Search } = Input;

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<ApiErrorInfo | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [executingTaskId, setExecutingTaskId] = useState<string | null>(null);
  const [executionResult, setExecutionResult] =
    useState<ExecutionResponse | null>(null);
  const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);

  const fetchTasks = useCallback(
    async (term?: string) => {
      setLoading(true);
      try {
        const trimmed = term?.trim();
        const data =
          trimmed && trimmed.length > 0
            ? await taskService.search(trimmed)
            : await taskService.list();
        setTasks(data);
        setCreateError(null);
      } catch (error) {
        const apiError = toApiError(error);
        message.error(apiError.message);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    },
    [setTasks],
  );

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (selectedTask) {
      const latest = tasks.find((task) => task.id === selectedTask.id);
      if (latest && latest !== selectedTask) {
        setSelectedTask(latest);
      }
    }
  }, [tasks, selectedTask]);

  const handleSearch = useCallback(
    async (value: string) => {
      setSearchValue(value);
      await fetchTasks(value);
    },
    [fetchTasks],
  );

  const handleClearSearch = useCallback(async () => {
    setSearchValue("");
    await fetchTasks();
  }, [fetchTasks]);

  const handleCreate = useCallback(
    async (payload: TaskPayload) => {
      setCreateLoading(true);
      setCreateError(null);
      try {
        const created = await taskService.create(payload);
        setTasks((current) => [created, ...current]);
        setIsCreateOpen(false);
        message.success(`Task "${created.name}" created successfully.`);
      } catch (error) {
        const apiError = toApiError(error);
        setCreateError(apiError);
        message.error(apiError.message);
      } finally {
        setCreateLoading(false);
      }
    },
    [],
  );

  const handleDelete = useCallback(async (task: Task) => {
    try {
      await taskService.remove(task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
      message.success(`Task "${task.name}" removed.`);
    } catch (error) {
      const apiError = toApiError(error);
      message.error(apiError.message);
    }
  }, []);

  const handleRunTask = useCallback(async (task: Task) => {
    setExecutingTaskId(task.id);
    try {
      const result = await taskService.execute(task.id);
      setExecutionResult(result);
      setIsOutputModalOpen(true);

      notification.success({
        message: `Command ${result.status.toLowerCase()}`,
        description: `Exit code ${result.exitCode}.`,
        placement: "bottomRight",
      });

      const updated = await taskService.get(task.id);
      setTasks((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      const apiError = toApiError(error);
      message.error(apiError.message);
    } finally {
      setExecutingTaskId(null);
    }
  }, []);

  const handleViewDetails = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  }, []);

  const filteredTasks = useMemo(() => tasks, [tasks]);

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card
        bordered={false}
        styles={{ body: { padding: 24 } }}
        aria-label="Task management panel"
      >
        <Flex
          justify="space-between"
          align="center"
          gap="middle"
          wrap="wrap"
          style={{ marginBottom: 16 }}
        >
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>
              Task dashboard
            </Title>
            <Text type="secondary">
              Create, search, execute, and manage automation tasks.
            </Text>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                void fetchTasks(searchValue);
              }}
              aria-label="Refresh task list"
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsCreateOpen(true);
                setCreateError(null);
              }}
              aria-label="Create a new task"
            >
              New Task
            </Button>
          </Space>
        </Flex>

        <Search
          placeholder="Search tasks by name"
          allowClear
          enterButton={<SearchOutlined />}
          value={searchValue}
          onChange={(event) => {
            const value = event.target.value;
            setSearchValue(value);
            if (value.length === 0) {
              void handleClearSearch();
            }
          }}
          onSearch={(value) => {
            if (value.length === 0) {
              void handleClearSearch();
            } else {
              void handleSearch(value);
            }
          }}
          aria-label="Search tasks"
        />
      </Card>

      {initialized && filteredTasks.length === 0 ? (
        <Card bordered={false}>
          <Empty
            description={
              <Space direction="vertical" size={4}>
                <Text strong>No tasks found</Text>
                <Text type="secondary">
                  Create a task to get started or adjust your search query.
                </Text>
              </Space>
            }
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateOpen(true)}
            >
              Create your first task
            </Button>
          </Empty>
        </Card>
      ) : (
        <Card bordered={false}>
          <TaskTable
            tasks={filteredTasks}
            loading={loading}
            onRun={handleRunTask}
            onView={handleViewDetails}
            onDelete={handleDelete}
            executingTaskId={executingTaskId}
          />
        </Card>
      )}

      <TaskFormModal
        open={isCreateOpen}
        loading={createLoading}
        onSubmit={(values) => {
          void handleCreate(values);
        }}
        onCancel={() => {
          setIsCreateOpen(false);
          setCreateError(null);
        }}
        apiError={createError}
      />

      <TaskDetailsDrawer
        task={selectedTask}
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      <CommandOutputModal
        open={isOutputModalOpen}
        result={executionResult}
        onClose={() => setIsOutputModalOpen(false)}
      />
    </Space>
  );
}
