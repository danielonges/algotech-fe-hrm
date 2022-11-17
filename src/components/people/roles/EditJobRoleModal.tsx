import React from 'react';
import { Input, Modal, Select, Space, Typography } from 'antd';
import { User, JobRole } from 'src/models/types';
import asyncFetchCallback from 'src/services/util/asyncFetchCallback';
import '../../../styles/people/managePeople.scss';
import { updateJobRole } from 'src/services/jobRoleService';
import TimeoutAlert, { AlertType } from 'src/components/common/TimeoutAlert';
import { getUserFullName } from 'src/utils/formatUtils';

const { Text } = Typography;
const { Option } = Select;

type EditPersonModalProps = {
  users: User[];
  title: string;
  open: boolean;
  jobRole: JobRole;
  onClose: () => void;
  setFocusedJobRole: (jobRole: JobRole) => void;
  fetchJobRoles: () => void;
};

const EditJobRoleModal = (props: EditPersonModalProps) => {
  const {
    title,
    open,
    jobRole,
    onClose,
    setFocusedJobRole,
    fetchJobRoles,
    users
  } = props;
  const [alert, setAlert] = React.useState<AlertType | null>(null);
  const [updateJobRoleLoading, setUpdateJobRoleLoading] =
    React.useState<boolean>(false);

  const editNamedField = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFocusedJobRole(
      jobRole && { ...jobRole, [e.target.name]: e.target.value }
    );

  const handleChange = (value: number[]) => {
    setFocusedJobRole(
      jobRole && {
        ...jobRole,
        usersInJobRole: users.filter((user) => value.includes(user.id))
      }
    );
  };

  const handleSaveButtonClick = () => {
    setUpdateJobRoleLoading(true);
    if (jobRole?.jobRole === '') {
      setAlert({
        type: 'warning',
        message: 'Job role name field cannot be empty!'
      });
      return;
    }

    if (jobRole?.description === '') {
      setAlert({
        type: 'warning',
        message: 'Description field cannot be empty!'
      });
      return;
    }

    asyncFetchCallback(
      updateJobRole(jobRole!),
      () => {
        setAlert({
          type: 'success',
          message: 'Changes saved.'
        });
        setTimeout(() => {
          fetchJobRoles();
          onClose();
        }, 500);
      },
      () => {
        setAlert({
          type: 'error',
          message: 'Failed to save changes. Please try again later.'
        });
      },
      { updateLoading: setUpdateJobRoleLoading }
    );
  };
  return (
    <>
      <Modal
        title={title}
        open={open}
        onOk={handleSaveButtonClick}
        onCancel={onClose}
        okText='Save Changes'
        okButtonProps={{
          loading: updateJobRoleLoading,
          disabled: updateJobRoleLoading
        }}
      >
        <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
          <Space direction='vertical' style={{ width: '100%' }}>
            {alert && (
              <div className='account-alert'>
                <TimeoutAlert alert={alert} clearAlert={() => setAlert(null)} />
              </div>
            )}
            <Text>Job Role Name</Text>
            <Input
              name='jobRole'
              size='large'
              value={jobRole?.jobRole}
              onChange={editNamedField}
            />
          </Space>

          <Space direction='vertical' style={{ width: '100%' }}>
            <Text>Description</Text>
            <Input
              name='description'
              size='large'
              value={jobRole?.description}
              onChange={editNamedField}
            />
          </Space>

          <Space direction='vertical' style={{ width: '100%' }}>
            <Text>User(s) Assigned (Optional)</Text>
            <Select
              mode='multiple'
              allowClear
              showArrow
              showSearch
              placeholder='Select Users'
              optionFilterProp='children'
              style={{ width: '100%' }}
              value={jobRole?.usersInJobRole.map((user) => user.id) ?? []}
              onChange={handleChange}
            >
              {users.map((option) => (
                <Option key={option.id} value={option.id}>
                  {getUserFullName(option)}
                </Option>
              ))}
            </Select>
          </Space>
        </Space>
      </Modal>
    </>
  );
};

export default EditJobRoleModal;
