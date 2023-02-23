import type { ProColumns,ActionType } from '@ant-design/pro-components';
import { EditableProTable, ProCard, ProFormField, ProFormRadio } from '@ant-design/pro-components';
import React, {useContext, useEffect, useState} from 'react';
import {v4 as uuid} from "uuid";
import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil'
import "./Penal.less"
import PropertiesPenalContext from "../propertiesPenalContext"
import {getMessage, getMessageEventDefinition} from "./utils/EventDefinitionUtil"
import {findRootElementById, findRootElementsByType, getRoot} from "@/pages/bpmn/designer/penal/utils/ElementUtil";
import {Col, Row, Select} from "antd";
import {values, without} from 'min-dash'

type DataSourceType = {
  id: React.Key;
  messageId?: string;
  messageName?: string;
  children?: DataSourceType[];
};

const defaultData: DataSourceType[] = [

];

const Message = () => {
  const {prefix,modeler,moddle,modeling,businessObject,bpmnEle,bpmnFactory,commandStack} = useContext(PropertiesPenalContext)
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<DataSourceType[]>([]);
  const [messageId,setMessageId] = useState("")
  const [refMessageId,setRefMessageId] = useState<string|undefined>("")
  const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>('bottom');
  let [isEditing, setIsEditing] = useState(false)

  useEffect(()=>{
    const messageEventDefinition = getMessageEventDefinition(bpmnEle)
    let messageRef =   messageEventDefinition?.get('messageRef')
    setRefMessageId(messageRef?.id)
    console.log("messageRef",messageRef)
    // const root = getRoot(messageEventDefinition)
    const messages = findRootElementsByType(getBusinessObject(bpmnEle), 'bpmn:Message')
    const dataSource1 = messages.map((item)=>{
      return {
        id:item.id,
        messageId:item.id,
        messageName:item.name
      }
    })
    setDataSource(dataSource1)
    console.log("messages",dataSource1)
    console.log("businessObject?.id: ",businessObject?.id)
  },[businessObject?.id])

  const columns: ProColumns<DataSourceType>[] = [
    {
      title: '消息ID',
      dataIndex: 'messageId',
      tooltip: '消息ID',
      editable:false,
      formItemProps: (form, { rowIndex }) => {
        return {
          rules:  [{ required: true, message: '此项为必填项' }] ,
        };
      },
    },
    {
      title: '消息名称',
      dataIndex: 'messageName',
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
            console.log("action",action)
            setIsEditing(true)
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            let dataSource1 = dataSource.filter((item) => item.id !== record.id)
            setIsEditing(false)
            /*dataSource1 = dataSource1.map((item,index)=>{return {
              id: index+1,
              target: item.target,
              source: item.source
            }})*/
            const messageEventDefinition = getMessageEventDefinition(bpmnEle)
            let messageRef =   messageEventDefinition.get('messageRef')
            console.log("messageRef",messageRef)
            const root = getRoot(messageEventDefinition)
            const messages = findRootElementsByType(getBusinessObject(bpmnEle), 'bpmn:Message')
            const messageDefinition = moddle?.create("bpmn:Message", {})
            console.log("root.get('rootElements')",root.get('rootElements'))
            console.log("without(root.get('rootElements')",root.get('rootElements').filter((item) => item.id !== record.messageId))
            console.log("messageDefinition",messageDefinition)
            modeling.updateModdleProperties(bpmnEle,
              root,
              {
                rootElements: [...root.get('rootElements').filter((item) => item.id !== record.messageId)]
              })
            console.log("messages:",messages)
            if(messageRef?.id === record?.messageId){
              modeling.updateModdleProperties(bpmnEle,
                messageEventDefinition,
                {
                  messageRef:null
                });
              setRefMessageId("")
            }
            setDataSource(dataSource1);
          }}
        >
          删除
        </a>,
      ],
    },
  ];
  const processMessage = (data:DataSourceType)=>{
    const messageEventDefinition = getMessageEventDefinition(bpmnEle)
    const root = getRoot(messageEventDefinition)
    //const messageRef =   messageEventDefinition.get('messageRef')
    if(isEditing===false) {
      const messageRef = bpmnFactory.create('bpmn:Message',
        {id: data.messageId, name: data.messageId})
      messageRef.$parent = bpmnEle
      modeling.updateModdleProperties(bpmnEle,
        messageEventDefinition,
        {
          messageRef
        });
      const messageDefinition = moddle?.create("bpmn:Message", {id: data.messageId, name: data.messageName})
      modeling.updateModdleProperties(bpmnEle,
        root,
        {
          rootElements: [...root.get('rootElements'), messageDefinition]
        })
      setRefMessageId(data.messageId)
      console.log("messageEventDefinition", messageEventDefinition)
      console.log("root", root)
      console.log(data)
    }else{
      const messageEventDefinition = getMessageEventDefinition(bpmnEle);
      const messageRef = findRootElementById(messageEventDefinition,'bpmn:Message',
        data.messageId)||{}
      const message = getMessage(bpmnEle)
      console.log("message",message)
      console.log("messageRef",messageRef)
      console.log("messageEventDefinition",messageEventDefinition)
      setRefMessageId(messageRef.id)
      modeling.updateModdleProperties(
        bpmnEle,
        messageRef,
        {name:data.messageName}
        )

      messageRef.$parent = bpmnEle
      console.log("messageRef",messageRef)
      modeling.updateModdleProperties(bpmnEle,
        messageEventDefinition,
        {
          messageRef
        });
    }
  }
  const handleMessageChange = (value: { value: string; label: React.ReactNode }) => {
    setMessageId(value.value)
    const messageEventDefinition = getMessageEventDefinition(bpmnEle)
    //const messageRef = bpmnFactory.create('bpmn:Message',
    //  {id:value.value,name:value.value})
    const messageRef = findRootElementById(messageEventDefinition,'bpmn:Message',
      value.value)||{}
    messageRef.$parent = bpmnEle
    modeling.updateModdleProperties(bpmnEle,
      messageEventDefinition,
      {
        messageRef
      });
    setRefMessageId(messageRef.id)
    console.log(value); // { value: "lucy", key: "lucy", label: "Lucy (101)" }
  }
  const { Option } = Select;
  return (
    <>
      <Row style={{marginTop:"10px"}} justify="end" align="middle">
        <Col span={6}><span>消息引用</span></Col>
        <Col span={18}>
          <Select
            labelInValue
            value={{ value: refMessageId }}
            style={{ width: '100%' }}
            onChange={handleMessageChange}
          >
            {
              dataSource.map((item)=>{
                return <Option value={item.messageId}>{item.messageId}</Option>
              })
            }
          </Select>
        </Col>
      </Row>
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
                return { id: uid,messageId: "Message_"+ uid}
              },
            }
            : false
        }
        loading={false}

        columns={columns}
        value={dataSource}
        onChange={setDataSource}
        editable={{
          type: 'multiple',
          editableKeys,
          onSave: async (rowKey, data, row) => {
            //console.log("Save....")
            //console.log(rowKey, data, row);
            processMessage(data)
            setIsEditing(false)
          },
          onCancel: async (rowKey, data, row) => {
            setIsEditing(false)
            console.log("Cancel....")
            //console.log(rowKey, data, row);
          },
          onChange: setEditableRowKeys,
        }}
      />
    </>
  );
};
export default Message

