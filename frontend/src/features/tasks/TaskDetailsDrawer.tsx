import { Drawer, Descriptions, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import type { Task } from "@/types/task";

type TaskDetailsDrawerProps = {
  task: Task | null;
  open: boolean;
  onClose: () => void;
};

const { Paragraph, Text } = Typography;

export function TaskDetailsDrawer({
  task,
  open,
  onClose,
}: TaskDetailsDrawerProps) {
  const execution = task?.lastExecution;
  const executionContent = execution ? (
    <Space direction="vertical" size="small">
      {execution.startTime && (
        <Text aria-label="Execution started at">
          Started: {dayjs(execution.startTime).format("YYYY-MM-DD HH:mm:ss")}
        </Text>
      )}
      {execution.endTime && (
        <Text aria-label="Execution finished at">
          Finished: {dayjs(execution.endTime).format("YYYY-MM-DD HH:mm:ss")}
        </Text>
      )}
      {execution.output && (
        <Paragraph
          code
          aria-label="Execution output"
          style={{ maxHeight: 160, overflowY: "auto" }}
          copyable
        >
          {execution.output}
        </Paragraph>
      )}
    </Space>
  ) : (
    <Tag color="default">Never executed</Tag>
  );

  return (
    <Drawer
      title={task ? `Task: ${task.name}` : "Task details"}
      placement="right"
      size="large"
      width={520}
      onClose={onClose}
      open={open}
      destroyOnClose
    >
      {task ? (
        <Descriptions
          bordered
          column={1}
          size="small"
          labelStyle={{ width: 140 }}
        >
          <Descriptions.Item label="Name">
            <Text strong>{task.name}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Owner">
            <Text>{task.owner}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Command">
            <Paragraph code copyable style={{ whiteSpace: "pre-wrap" }}>
              {task.command}
            </Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="Last execution">
            {executionContent}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <Text type="secondary">Select a task to view its details.</Text>
      )}
    </Drawer>
  );
}
