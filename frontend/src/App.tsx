import { Layout, Typography } from "antd";
import { TaskManager } from "@/features/tasks/TaskManager";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

function App() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        role="banner"
        style={{
          background: "linear-gradient(90deg, #0a143d 0%, #1f4fd1 100%)",
          paddingInline: 32,
        }}
      >
        <Title level={2} style={{ color: "#ffffff", margin: 0 }}>
          Kaiburr Task Console
        </Title>
        <Text style={{ color: "rgba(255,255,255,0.75)" }}>
          React 19 + Ant Design interface for managing automation tasks.
        </Text>
      </Header>

      <Content role="main" style={{ padding: "32px 48px" }}>
        <TaskManager />
      </Content>

    </Layout>
  );
}

export default App;
