import type { ProColumns,ActionType } from '@ant-design/pro-components';
import { EditableProTable, ProCard, ProFormField, ProFormRadio } from '@ant-design/pro-components';
import React, {useContext, useEffect, useState} from 'react';
import {v4 as uuid} from "uuid";
import "./Penal.less"
import PropertiesPenalContext from "../propertiesPenalContext"
import {getMessage, getMessageEventDefinition, getSignal, getSignalEventDefinition} from "./utils/EventDefinitionUtil"
import {findRootElementById, findRootElementsByType, getRoot} from "@/pages/bpmn/designer/penal/utils/ElementUtil";
import {Col, Row, Select} from "antd";
import {getBusinessObject} from "bpmn-js/lib/util/ModelUtil";

type DataSourceType = {
  id: React.Key;
  signalId?: string;
  signalName?: string;
  children?: DataSourceType[];
};

const defaultData: DataSourceType[] = [

];

const Signal = () => {
  const {prefix,modeler,moddle,modeling,businessObject,bpmnEle,bpmnFactory,commandStack} = useContext(PropertiesPenalContext)
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<DataSourceType[]>([]);
  const [signalId,setSignalId] = useState("")
  const [refSignalId,setRefSignalId] = useState<string|undefined>("")
  const [position, setPosition] = useState<'top' | 'bottom' | 'hidden'>('bottom');
  let [isEditing, setIsEditing] = useState(false)

  useEffect(()=>{
    const signalEventDefinition = getSignalEventDefinition(bpmnEle)
    let signalRef =   signalEventDefinition?.get('messageRef')
    setRefSignalId(signalRef?.id)
    console.log("signalRef",signalRef)
    // const root = getRoot(messageEventDefinition)
    const signals = findRootElementsByType(getBusinessObject(bpmnEle), 'bpmn:Signal')
    const dataSource = signals.map((item)=>{
      return {
        id:item.id,
        signalId:item.id,
        signalName:item.name
      }
    })
    setDataSource(dataSource)
    console.log("signals",signals)
  },[businessObject])
  const columns: ProColumns<DataSourceType>[] = [
    {
      title: '信号ID',
      dataIndex: 'signalId',
      tooltip: '信号ID',
      editable: false,
      formItemProps: (form, { rowIndex }) => {
        return {
          rules:  [{ required: true, message: '此项为必填项' }] ,
        };
      },
    },
    {
      title: '信号名称',
      dataIndex: 'signalName',
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
            const signalEventDefinition = getSignalEventDefinition(bpmnEle)
            let signalRef =   signalEventDefinition.get('signalRef')
            console.log("signalRef",signalRef)
            const root = getRoot(signalEventDefinition)
            const signals = findRootElementsByType(getBusinessObject(bpmnEle), 'bpmn:Signal')
            const signalDefinition = moddle?.create("bpmn:Signal", {})
            console.log("root.get('rootElements')",root.get('rootElements'))
            console.log("without(root.get('rootElements')",root.get('rootElements').filter((item) => item.id !== record.signalId))
            console.log("signalDefinition",signalDefinition)
            modeling.updateModdleProperties(bpmnEle,
              root,
              {
                rootElements: [...root.get('rootElements').filter((item) => item.id !== record.signalId)]
              })
            console.log("signals:",signals)
            if(signalRef.id === record.signalId){
              modeling.updateModdleProperties(bpmnEle,
                signalEventDefinition,
                {
                  signalRef:null
                });
              setRefSignalId("")
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
    const signalEventDefinition = getSignalEventDefinition(bpmnEle)
    console.log("signalEventDefinition",signalEventDefinition,isEditing)
    const root = getRoot(signalEventDefinition)
    //const messageRef =   messageEventDefinition.get('messageRef')
    if(isEditing===false) {
      const signalRef = bpmnFactory.create('bpmn:Signal',
        {id: data.signalId, name: data.signalId})
      signalRef.$parent = bpmnEle
      modeling.updateModdleProperties(bpmnEle,
        signalEventDefinition,
        {
          signalRef
        });
      const signalDefinition = moddle?.create("bpmn:Signal", {id: data.signalId, name: data.signalName})
      modeling.updateModdleProperties(bpmnEle,
        root,
        {
          rootElements: [...root.get('rootElements'), signalDefinition]
        })
      setRefSignalId(data.signalId)
      console.log("signalEventDefinition", signalEventDefinition)
      console.log("root", root)
      console.log(data)
    }else{
      const signalRef = findRootElementById(signalEventDefinition,'bpmn:Signal',
        data.signalId)||{}
      const signal = getSignal(bpmnEle)
      //console.log("data.signalId",data.signalId)
      //console.log("signal",signal)
      //console.log("signalRef",signalRef)
      setRefSignalId(signalRef.id)
      modeling.updateModdleProperties(
        bpmnEle,
        signalRef,
        {name:data.signalName}
      )

      signalRef.$parent = bpmnEle
      console.log("signalRef",signalRef)
      modeling.updateModdleProperties(bpmnEle,
        signalEventDefinition,
        {
          signalRef
        });
    }
  }
  const handleSignalChange = (value: { value: string; label: React.ReactNode }) => {
    setSignalId(value.value)
    const signalEventDefinition = getSignalEventDefinition(bpmnEle)
    //const signalRef = bpmnFactory.create('bpmn:Signal',
    //  {id:value.value,name:value.value})
    const signalRef = findRootElementById(signalEventDefinition,'bpmn:Signal',
      value.value)||{}
    signalRef.$parent = bpmnEle
    modeling.updateModdleProperties(bpmnEle,
      signalEventDefinition,
      {
        signalRef
      });
    setRefSignalId(signalRef.id)
    console.log(value); // { value: "lucy", key: "lucy", label: "Lucy (101)" }
  }
  const { Option } = Select;
  return (
    <>
      <Row style={{marginTop:"10px"}} justify="end" align="middle">
        <Col span={6}><span>信号引用</span></Col>
        <Col span={18}>
          <Select
            labelInValue
            value={{ value: refSignalId }}
            style={{ width: '100%' }}
            onChange={handleSignalChange}
          >
            {
              dataSource.map((item)=>{
                return <Option value={item.signalId}>{item.signalId}</Option>
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
                return { id: uid,signalId: "Signal_"+ uid}
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
            //console.log(rowKey, data, row);
            processMessage(data)
          },
          onChange: setEditableRowKeys,
        }}
      />
    </>
  );
};
export default Signal

