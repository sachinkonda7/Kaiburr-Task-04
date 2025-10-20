import { useEffect } from "react";
import { Form, Input, Modal } from "antd";
import type { TaskPayload } from "@/types/task";
import type { ApiErrorInfo } from "@/services/taskService";

type TaskFormModalProps = {
  open: boolean;
  loading?: boolean;
  onSubmit: (values: TaskPayload) => Promise<void> | void;
  onCancel: () => void;
  initialValues?: TaskPayload | null;
  apiError?: ApiErrorInfo | null;
};

const { TextArea } = Input;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

export function TaskFormModal({
  open,
  loading,
  onSubmit,
  onCancel,
  initialValues,
  apiError,
}: TaskFormModalProps) {
  const [form] = Form.useForm<TaskPayload>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues ?? { name: "", owner: "", command: "" });
    } else {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  useEffect(() => {
    if (apiError?.fieldErrors) {
      const fieldEntries = Object.entries(apiError.fieldErrors).map(
        ([fieldName, error]) => ({
          name: [fieldName] as [keyof TaskPayload],
          errors: [error],
        }),
      );
      form.setFields(fieldEntries);
    }
  }, [apiError, form]);

  const handleFinish = (values: TaskPayload) => {
    onSubmit(values);
  };

  return (
    <Modal
      title="Create Task"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Create"
      okButtonProps={{ loading }}
      destroyOnClose
      maskClosable={false}
      centered
    >
      <Form
        {...layout}
        form={form}
        name="taskForm"
        layout="horizontal"
        autoComplete="off"
        onFinish={handleFinish}
        requiredMark="optional"
      >
        <Form.Item<TaskPayload>
          label="Task Name"
          name="name"
          rules={[
            { required: true, message: "Please provide a name for the task" },
            { min: 3, message: "Name should be at least 3 characters long" },
          ]}
        >
          <Input placeholder="Example: Backup database" autoFocus />
        </Form.Item>

        <Form.Item<TaskPayload>
          label="Owner"
          name="owner"
          rules={[
            { required: true, message: "Please specify the owner" },
            { min: 2, message: "Owner name should be at least 2 characters" },
          ]}
        >
          <Input placeholder="Example: DevOps team" />
        </Form.Item>

        <Form.Item<TaskPayload>
          label="Command"
          name="command"
          rules={[
            { required: true, message: "Please enter a command" },
            { min: 3, message: "Command looks too short" },
          ]}
        >
          <TextArea
            placeholder="Example: kubectl get pods -A"
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
