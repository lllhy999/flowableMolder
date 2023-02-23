import type { ProColumns,ActionType } from '@ant-design/pro-components';
import { EditableProTable, ProCard, ProFormField, ProFormRadio } from '@ant-design/pro-components';
import React, {useContext, useState} from 'react';
import {v4 as uuid} from "uuid";
import "./Penal.less"
import PropertiesPenalContext from "../propertiesPenalContext"

type DataSourceType = {
  id: React.Key;
  target?: string;
  source?: string;
  children?: DataSourceType[];
};

const defaultData: DataSourceType[] = [

];

const OutputPropsPenal = () => {
  const {prefix,modeler,moddle,modeling,businessObject,bpmnEle,bpmnFactory,commandStack} = useContext(PropertiesPenalContext)
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<DataSourceType[]>([]);
  const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>('bottom');

  const columns: ProColumns<DataSourceType>[] = [
    {
      title: '变量名称',
      dataIndex: 'target',
      tooltip: '变量名称',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules:  [{ required: true, message: '此项为必填项' }] ,
        };
      },
    },
    {
      title: '变量值',
      dataIndex: 'source',
      formItemProps: (form, { rowIndex }) => {
        return {
          rules:  [{ required: true, message: '此项为必填项' }] ,
        };
      },
    },
    {
      title: '操作',
      valueType: 'option',
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            let dataSource1 = dataSource.filter((item) => item.id !== record.id)
            /*dataSource1 = dataSource1.map((item,index)=>{return {
              id: index+1,
              target: item.target,
              source: item.source
            }})*/
            setDataSource(dataSource1);
          }}
        >
          删除
        </a>,
      ],
    },
  ];
  const saveOutputVariable = (data:DataSourceType)=>{
    console.log(data)
  }
  return (
    <>
      <EditableProTable<DataSourceType>
        bordered={true}
        style={{minHeight:"20px",}}
        rowKey="id"
        maxLength={5}
        scroll={{
          x: 0,
        }}
        recordCreatorProps={
          position !== 'hidden'
            ? {
              position: position as 'top',
              record: () => {
                const uid = uuid().slice(0,7)
                return { id: uid,target: "OutputVariable_"+ uid}
              },
            }
            : false
        }
        loading={false}

        columns={columns}
        request={async () => ({
          data: defaultData,
          total: 3,
          success: true,
        })}
        value={dataSource}
        onChange={setDataSource}
        editable={{
          type: 'multiple',
          editableKeys,
          onSave: async (rowKey, data, row) => {
            //console.log("Save....")
            //console.log(rowKey, data, row);
            saveOutputVariable(data)
          },
          onChange: setEditableRowKeys,
        }}
      />
    </>
  );
};
export default OutputPropsPenal

