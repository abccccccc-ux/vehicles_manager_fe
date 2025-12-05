import React from "react";
import { Card, Typography, Space, Button, Tooltip } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import WorkingHoursViolationTable from "./WorkingHoursViolationTable";
import { fetchWorkingHoursViolations } from "../../store/workingHoursViolationSlice";
import MainLayout from "../../layouts/MainLayout";

const { Title, Text } = Typography;

const WorkingHoursViolations = () => {
  const dispatch = useDispatch();

  const handleRefresh = () => {
    // Manual refresh
    dispatch(
      fetchWorkingHoursViolations({
        page: 1,
        limit: 10,
      })
    );
  };

  return (
    <MainLayout>
      <div style={{ padding: '8px 0' }}>
        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <Space direction="vertical" size={0}>
              <Title level={3} style={{ margin: 0 }}>
                Vi phạm giờ làm việc
              </Title>
              <Text type="secondary">
                Quản lý và theo dõi các vi phạm liên quan đến giờ làm việc
              </Text>
            </Space>

            <Space>
              <Tooltip title="Làm mới dữ liệu">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  type="default"
                >
                  Làm mới
                </Button>
              </Tooltip>
            </Space>
          </div>

          <WorkingHoursViolationTable />
        </Card>
      </div>
    </MainLayout>
  );
};

export default WorkingHoursViolations;
