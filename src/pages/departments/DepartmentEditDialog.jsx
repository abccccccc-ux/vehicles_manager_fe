import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Switch, Spin, message, Empty } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import userApi from '../../api/userApi';
import { fetchDepartmentById, updateDepartment, fetchDepartments } from '../../store/departmentSlice';

const DepartmentEditDialog = ({ visible, departmentId, onClose }) => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const { currentDepartment, currentDepartmentLoading, loading } = useSelector((state) => state.departments);
    const [managers, setManagers] = useState([]);
    const [loadingManagers, setLoadingManagers] = useState(false);

    useEffect(() => {
        if (visible && departmentId) {
            dispatch(fetchDepartmentById(departmentId));
            loadManagers();
        }
    }, [visible, departmentId, dispatch]);

    useEffect(() => {
        if (currentDepartment) {
            form.setFieldsValue({
                name: currentDepartment.name,
                code: currentDepartment.code,
                description: currentDepartment.description || '',
                manager: currentDepartment.manager?._id || null,
                isActive: currentDepartment.isActive,
            });
        }
    }, [currentDepartment, form]);

    const loadManagers = async () => {
        try {
            setLoadingManagers(true);
            const { data } = await userApi.getUsers({ isActive: true, limit: 1000, role: 'admin' });
            setManagers(data.data || []);
        } catch (err) {
            message.error('Lỗi tải danh sách trưởng đơn vị');
            setManagers([]);
        } finally {
            setLoadingManagers(false);
        }
    };

    const handleSubmit = async (values) => {
        try {
            const payload = {
                name: values.name,
                description: values.description || '',
                manager: values.manager || null,
                isActive: values.isActive,
            };

            await dispatch(updateDepartment({ departmentId, departmentData: payload })).unwrap();

            message.success('Cập nhật thành công');
            onClose();
            dispatch(fetchDepartments({ page: 1, limit: 10 }));
        } catch (err) {
            const errMsg = err?.message || (typeof err === 'string' ? err : err?.message) || 'Cập nhật thất bại';
            // message.error(errMsg);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title="Chỉnh sửa Đơn vị"
            open={visible}
            onCancel={handleCancel}
            onOk={() => form.submit()}
            confirmLoading={loading || currentDepartmentLoading}
            width={600}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit} autoComplete="off">
                <Form.Item
                    label="Tên Đơn vị"
                    name="name"
                    rules={[{ required: true, message: 'Vui lòng nhập tên Đơn vị' }, { min: 2, message: 'Tên Đơn vị phải ít nhất 2 ký tự' }]}
                >
                    <Input placeholder="Ví dụ: Hệ học viên 5" />
                </Form.Item>

                <Form.Item label="Mã Đơn vị" name="code">
                    <Input placeholder="Ví dụ: H5" disabled />
                </Form.Item>

                <Form.Item label="Mô tả" name="description">
                    <Input.TextArea placeholder="Nhập mô tả Đơn vị" rows={3} />
                </Form.Item>

                <Form.Item label="Trưởng Đơn vị" name="manager">
                    <Select
                        placeholder="Chọn trưởng Đơn vị (không bắt buộc)"
                        allowClear
                        loading={loadingManagers}
                        notFoundContent={
                            loadingManagers ? <Spin size="small" /> : managers.length === 0 ? <Empty description="Không có người dùng" /> : null
                        }
                        options={managers.map((user) => ({ label: `${user.name} (${user.username})`, value: user._id }))}
                    />
                </Form.Item>

                <Form.Item label="Trạng thái" name="isActive" valuePropName="checked">
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DepartmentEditDialog;