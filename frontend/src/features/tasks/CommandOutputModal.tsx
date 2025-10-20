import { Modal, Space, Tag, Typography } from "antd";
import dayjs from "dayjs";
import type { ExecutionResponse } from "@/types/task";

type CommandOutputModalProps = {
  open: boolean;
  result: ExecutionResponse | null;
  onClose: () => void;
};

const { Paragraph, Text } = Typography;

export function CommandOutputModal({
  open,
  result,
  onClose,
}: CommandOutputModalProps) {
  const statusColor = result?.status === "SUCCESS" ? "green" : "volcano";

  return (
    <Modal
      open={open}
      title="Command execution"
      onCancel={onClose}
      onOk={onClose}
      okText="Close"
      cancelButtonProps={{ style: { display: "none" } }}
      width={640}
      centered
    >
      {result ? (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Space align="center">
            <Tag color={statusColor}>{result.status}</Tag>
            <Text type="secondary">Exit code: {result.exitCode}</Text>
          </Space>
          {result.startTime && (
            <Text type="secondary">
              Started: {dayjs(result.startTime).format("YYYY-MM-DD HH:mm:ss")}
            </Text>
          )}
          {result.endTime && (
            <Text type="secondary">
              Finished: {dayjs(result.endTime).format("YYYY-MM-DD HH:mm:ss")}
            </Text>
          )}
          <Paragraph
            aria-label="Command output"
            code
            copyable
            style={{
              maxHeight: 240,
              overflowY: "auto",
              whiteSpace: "pre-wrap",
            }}
          >
            {result.output ?? "No output received."}
          </Paragraph>
        </Space>
      ) : (
        <Text type="secondary">No output available.</Text>
      )}
    </Modal>
  );
}
