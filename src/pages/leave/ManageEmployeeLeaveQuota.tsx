import React, { useState, useEffect, useContext } from 'react';
import '../../styles/pages/leaveQuota.scss';
import {
  Button,
  Divider,
  Form,
  Input,
  Popconfirm,
  Space,
  Table,
  Typography
} from 'antd';
import {
  CloseOutlined,
  EditOutlined,
  SaveOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { EmployeeLeaveQuota, LeaveQuota } from 'src/models/types';
import asyncFetchCallback from 'src/services/util/asyncFetchCallback';
import TimeoutAlert, { AlertType } from 'src/components/common/TimeoutAlert';
import LeaveQuotaEditableCell from 'src/components/leave/LeaveQuotaEditableCell';
import breadcrumbContext from 'src/context/breadcrumbs/breadcrumbContext';
import { EMPLOYEE_LEAVE_QUOTA_URL } from 'src/components/routes/routes';
import { getUserFullName } from 'src/utils/formatUtils';
import {
  getAllEmployeeLeaveQuota,
  getAllLeaveQuota,
  editEmployeeLeaveQuota
} from 'src/services/leaveService';
import authContext from 'src/context/auth/authContext';

const ManageEmployeeLeaveQuota = () => {
  const [form] = Form.useForm();
  const { user } = React.useContext(authContext);
  const { updateBreadcrumbItems } = useContext(breadcrumbContext);
  const [leaveQuotas, setLeaveQuotas] = useState<EmployeeLeaveQuota[]>([]);
  const [tiers, setTiers] = useState<LeaveQuota[]>([]);
  const [editingKey, setEditingKey] = useState<number>(-1);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchField, setSearchField] = React.useState<string>('');
  const [alert, setAlert] = React.useState<AlertType | null>(null);

  const tiersObj: { [key: string]: any } = tiers.reduce((object, item) => {
    object[item.tier] = {
      ...item,
      annualQuota: item.annual,
      childcareQuota: item.childcare,
      compassionateQuota: item.compassionate,
      parentalQuota: item.parental,
      sickQuota: item.sick,
      unpaidQuota: item.unpaid
    };
    return object;
  }, {} as { [key: string]: any });

  const filteredLeaveQuotas = React.useMemo(() => {
    const finalLeaveQuotas = leaveQuotas.filter((leaveQuota) => {
      const { employee, tier } = leaveQuota;
      const fullName = getUserFullName(employee);
      const searchFieldLower = searchField.toLowerCase();
      return (
        tier.toLowerCase().includes(searchFieldLower) ||
        fullName.toLowerCase().includes(searchFieldLower)
      );
    });
    return finalLeaveQuotas;
  }, [leaveQuotas, searchField]);

  const isEditing = (record: EmployeeLeaveQuota) =>
    record.employee.id === editingKey;

  useEffect(() => {
    updateBreadcrumbItems([
      {
        label: 'Employee Leave Quota',
        to: EMPLOYEE_LEAVE_QUOTA_URL
      }
    ]);
  }, [updateBreadcrumbItems]);

  useEffect(() => {
    setLoading(true);
    asyncFetchCallback(
      getAllEmployeeLeaveQuota(),
      (res) => {
        const filteredData = res.filter(
          (leaveQuota) => leaveQuota.employee.id !== user?.id
        );
        const mappedData = filteredData.map((item) => ({
          ...item,
          tier: item.employee.tier
        }));
        const sortedData = mappedData.sort((a, b) =>
          a.tier.localeCompare(b.tier)
        );
        setLeaveQuotas(sortedData);
      },
      () => void 0,
      { updateLoading: setLoading }
    );
  }, []);

  useEffect(() => {
    setLoading(true);
    asyncFetchCallback(
      getAllLeaveQuota(),
      (res) => {
        setTiers(res);
      },
      () => void 0,
      { updateLoading: setLoading }
    );
  }, []);

  const getBalanceProp = (name: string, record: EmployeeLeaveQuota) => {
    switch (name) {
      case 'annualQuota':
        return record.annualBalance;
      case 'childcareQuota':
        return record.childcareBalance;
      case 'compassionateQuota':
        return record.compassionateBalance;
      case 'parentalQuota':
        return record.parentalBalance;
      case 'sickQuota':
        return record.sickBalance;
      case 'unpaidQuota':
        return record.unpaidBalance;
    }
  };

  const edit = (record: EmployeeLeaveQuota) => {
    form.setFieldsValue({
      ...record
    });
    setEditingKey(record.employee.id);
  };

  const cancel = () => {
    setEditingKey(-1);
  };

  const incrementLeaveBalance = (
    currentBalance: number,
    newQuota: number,
    oldQuota: number
  ) => {
    if (currentBalance >= newQuota) {
      return newQuota;
    }
    if (newQuota >= oldQuota) {
      return currentBalance + newQuota - oldQuota;
    } else {
      return Math.min(currentBalance, newQuota);
    }
  };

  const save = async (employeeId: number) => {
    try {
      setLoading(true);
      const row = (await form.validateFields()) as EmployeeLeaveQuota;
      const newLeaveQuotas = [...(leaveQuotas as EmployeeLeaveQuota[])];
      const index = newLeaveQuotas.findIndex(
        (item) => employeeId === item.employee.id
      );
      const item = {
        ...newLeaveQuotas[index],
        annualBalance: incrementLeaveBalance(
          newLeaveQuotas[index].annualBalance,
          row.annualQuota,
          leaveQuotas[index].annualQuota
        ),
        childcareBalance: incrementLeaveBalance(
          newLeaveQuotas[index].childcareBalance,
          row.childcareQuota,
          leaveQuotas[index].childcareQuota
        ),
        compassionateBalance: incrementLeaveBalance(
          newLeaveQuotas[index].compassionateBalance,
          row.compassionateQuota,
          leaveQuotas[index].compassionateQuota
        ),
        parentalBalance: incrementLeaveBalance(
          newLeaveQuotas[index].parentalBalance,
          row.parentalQuota,
          leaveQuotas[index].parentalQuota
        ),
        sickBalance: incrementLeaveBalance(
          newLeaveQuotas[index].sickBalance,
          row.sickQuota,
          leaveQuotas[index].sickQuota
        ),
        unpaidBalance: incrementLeaveBalance(
          newLeaveQuotas[index].unpaidBalance,
          row.unpaidQuota,
          leaveQuotas[index].unpaidQuota
        )
      };
      newLeaveQuotas.splice(index, 1, {
        ...item,
        ...row
      });
      const sortedData = newLeaveQuotas.sort((a, b) =>
        a.tier.localeCompare(b.tier)
      );
      setLeaveQuotas(sortedData);
      setEditingKey(-1);
      const reqBody = {
        employeeId: item.employee.id,
        annualQuota: row.annualQuota,
        childcareQuota: row.childcareQuota,
        parentalQuota: row.parentalQuota,
        compassionateQuota: row.compassionateQuota,
        sickQuota: row.sickQuota,
        unpaidQuota: row.unpaidQuota,
        tier: row.tier
      };
      await asyncFetchCallback(
        editEmployeeLeaveQuota(reqBody),
        (res) => {
          setAlert({
            type: 'success',
            message: 'Employee leave quota edited successfully!'
          });
          setLoading(false);
        },
        (err) => {
          setAlert({
            type: 'error',
            message:
              'Employee leave quota was not created successfully, please try again!'
          });
          setLoading(false);
        }
      );
    } catch (err) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const onInputChange = (value: string, name: string) => {
    if (name === 'tier') {
      form.setFieldsValue({
        ...tiersObj[value]
      });
    }
  };

  const columns = [
    {
      title: 'Employee Name',
      name: 'employeeName',
      render: (record: EmployeeLeaveQuota) => getUserFullName(record.employee)
    },
    {
      title: 'Tier',
      name: 'tier',
      dataIndex: 'tier',
      editable: true
    },
    {
      title: 'Annual Leave',
      name: 'annualQuota',
      render: (record: EmployeeLeaveQuota) => (
        <div>
          {record.annualBalance} / {record.annualQuota}
        </div>
      ),
      editable: true
    },
    {
      title: 'Childcare Leave',
      name: 'childcareQuota',
      render: (record: EmployeeLeaveQuota) => (
        <div>
          {record.childcareBalance} / {record.childcareQuota}
        </div>
      ),
      editable: true
    },
    {
      title: 'Compassionate Leave',
      name: 'compassionateQuota',
      render: (record: EmployeeLeaveQuota) => (
        <div>
          {record.compassionateBalance} / {record.compassionateQuota}
        </div>
      ),
      editable: true
    },
    {
      title: 'Parental Leave',
      name: 'parentalQuota',
      render: (record: EmployeeLeaveQuota) => (
        <div>
          {record.parentalBalance} / {record.parentalQuota}
        </div>
      ),
      editable: true
    },
    {
      title: 'Sick Leave',
      name: 'sickQuota',
      render: (record: EmployeeLeaveQuota) => (
        <div>
          {record.sickBalance} / {record.sickQuota}
        </div>
      ),
      editable: true
    },
    {
      title: 'Unpaid Leave',
      name: 'unpaidQuota',
      render: (record: EmployeeLeaveQuota) => (
        <div>
          {record.unpaidBalance} / {record.unpaidQuota}
        </div>
      ),
      editable: true
    },
    {
      title: 'Operation',
      name: 'operation',
      dataIndex: 'operation',
      render: (_: any, record: EmployeeLeaveQuota) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button
              type='primary'
              icon={<SaveOutlined />}
              onClick={() => save(editingKey)}
            />
            <Divider type='vertical' />
            <Popconfirm
              title='Are you sure you want to cancel?'
              cancelText='No'
              okText='Yes'
              onConfirm={cancel}
            >
              <Button icon={<CloseOutlined />} onClick={() => {}} />
            </Popconfirm>
          </span>
        ) : (
          <span>
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => edit(record)}
            />
          </span>
        );
      }
    }
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: EmployeeLeaveQuota) => ({
        editing: isEditing(record),
        name: col.name,
        isManageEmployeeLeaveQuota: true,
        balance: getBalanceProp(col.name, record),
        title: col.title,
        inputType: col.name === 'tier' ? 'select' : 'number',
        handleInputChange: onInputChange,
        selectedTier: record.employee.tier,
        tiers: tiers
      })
    };
  });

  return (
    <Form form={form} component={false}>
      <Typography.Title level={2}>
        Manage Individual Employee Leave Quota
      </Typography.Title>
      <Space direction='vertical' style={{ width: '100%' }} size='middle'>
        <Space direction='vertical' style={{ width: '100%' }}>
          <Typography.Text>Search</Typography.Text>
          <Input
            style={{ width: '22em' }}
            name='title'
            size='large'
            placeholder='Search Employee Name, Tier'
            prefix={<SearchOutlined />}
            onChange={(e) => setSearchField(e.target.value)}
          />
        </Space>
        {alert && (
          <div style={{ width: 'max-content' }}>
            <TimeoutAlert alert={alert} clearAlert={() => setAlert(null)} />
          </div>
        )}
        <Table
          components={{
            body: {
              cell: LeaveQuotaEditableCell
            }
          }}
          bordered
          dataSource={filteredLeaveQuotas}
          columns={mergedColumns}
          rowClassName='editable-row'
          pagination={{
            onChange: cancel,
            pageSize: 10
          }}
          loading={loading}
        />
      </Space>
    </Form>
  );
};

export default ManageEmployeeLeaveQuota;
