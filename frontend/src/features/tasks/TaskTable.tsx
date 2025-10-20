import { useMemo } from "react";
import {
  Button,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DeleteOutlined,
  EyeOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { Task } from "@/types/task";

dayjs.extend(relativeTime);

type TaskTableProps = {
  tasks: Task[];
  loading?: boolean;
  onRun: (task: Task) => void;
  onView: (task: Task) => void;
  onDelete: (task: Task) => void;
  executingTaskId?: string | null;
};

const { Paragraph, Text } = Typography;

export function TaskTable({
  tasks,
  loading,
  onRun,
  onView,
  onDelete,
  executingTaskId,
}: TaskTableProps) {
  const columns: ColumnsType<Task> = useMemo(
    () => [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (value: string) => (
          <Text strong aria-label={`Task name ${value}`}>
            {value}
          </Text>
        ),
        sorter: (a, b) => a.name.localeCompare(b.name),
        ellipsis: true,
      },
      {
        title: "Owner",
        dataIndex: "owner",
        key: "owner",
        render: (value: string) => (
          <Text aria-label={`Owner ${value}`}>{value}</Text>
        ),
        sorter: (a, b) => a.owner.localeCompare(b.owner),
        responsive: ["md"],
      },
      {
        title: "Command",
        dataIndex: "command",
        key: "command",
        render: (value: string) => (
          <Paragraph
            style={{ marginBottom: 0 }}
            ellipsis={{ rows: 1, tooltip: value }}
            aria-label={`Command ${value}`}
          >
            <code>{value}</code>
          </Paragraph>
        ),
      },
      {
        title: "Last Execution",
        dataIndex: "lastExecution",
        key: "lastExecution",
        render: (execution: Task["lastExecution"]) => {
          if (!execution?.startTime) {
            return <Tag color="default">Never executed</Tag>;
          }

          const start = dayjs(execution.startTime);
          const end = execution.endTime ? dayjs(execution.endTime) : null;
          const duration = end ? end.diff(start, "second", true) : undefined;

          return (
            <Space direction="vertical" size={2} aria-label="Last execution">
              <Tag color="blue">{start.fromNow()}</Tag>
              {duration !== undefined && (
                <Text type="secondary" aria-label={`Duration ${duration}s`}>
                  Duration: {duration.toFixed(1)}s
                </Text>
              )}
            </Space>
          );
        },
        responsive: ["md"],
      },
      {
        title: "Actions",
        key: "actions",
        render: (_value, record) => (
          <Space aria-label={`Actions for ${record.name}`}>
            <Tooltip title="Run command">
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => onRun(record)}
                loading={executingTaskId === record.id}
                aria-label={`Run ${record.name}`}
              />
            </Tooltip>
            <Tooltip title="View details">
              <Button
                icon={<EyeOutlined />}
                onClick={() => onView(record)}
                aria-label={`View ${record.name}`}
              />
            </Tooltip>
            <Tooltip title="Delete task">
              <Popconfirm
                title="Delete task"
                description={`Are you sure you want to delete "${record.name}"?`}
                okText="Yes"
                cancelText="No"
                onConfirm={() => onDelete(record)}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  aria-label={`Delete ${record.name}`}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        ),
      },
    ],
    [executingTaskId, onDelete, onRun, onView],
  );

  return (
    <Table<Task>
      rowKey="id"
      dataSource={tasks}
      columns={columns}
      loading={loading}
      pagination={{ pageSize: 8, showSizeChanger: false }}
      scroll={{ x: true }}
      aria-label="Tasks table"
    />
  );
}
