import {useEffect, useState, useRef, useContext,} from 'react'
import {FormInstance, message, Card, Modal as AntdModal, Table, Button, Collapse, Form, Input,Switch,Select,Row,Col} from 'antd'
import {useModel,useRequest} from "@umijs/max";

import {httpUrl} from '../../../services/ant-design-pro/globalParams'
import styles from  './ProcessPenal.less'
import { InfoCircleFilled,MessageFilled,NotificationFilled,PlusCircleFilled,SettingOutlined,LeftOutlined, PlusCircleOutlined,
        AppstoreOutlined,TableOutlined, DiffOutlined,LinkOutlined,DeploymentUnitOutlined} from '@ant-design/icons';
import debounce from "lodash.debounce"
import BpmnModeler from "bpmn-js/lib/Modeler";
import React from "react";
import BaseInfo from "./penal/BaseInfo"
import Message from "./penal/Message"
import Signal from "./penal/Signal"
import FlowConditional from "./penal/FlowConditional"
import ElementForm from "./penal/ElementForm"
import Other from "./penal/Other"
import Properties from "./penal/Properties"
import MultiInstance from "./penal/MultiInstance"
import UserTaskListener from "./penal/UserTaskListeners"
import ElementListener from "./penal/ElementListeners"
import Task from "./penal/Task"
import OutputPropsPenal from "./penal/OutputPropsPenal"
import {v4 as uuid} from "uuid"
import {getMessageEventDefinition, isMessageSupported, isSignalSupported} from "./penal/utils/EventDefinitionUtil"
import {getRoot} from "./penal/utils/ElementUtil"
import PropertiesPenalContext from "./propertiesPenalContext"
import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';

interface addStruct  {
  no: string,
  id: string,
  name: string,
}
const ProcessPanel = () => {
  const {prefix,modeler,moddle,modeling,businessObject,bpmnEle} = useContext(PropertiesPenalContext)
  const {initialState} = useModel('@@initialState')

  //消息信号
  const [messageDataSource,setMessageDataSource] = useState<addStruct[]>([])
  const [signalDataSource,setSignalDataSource] = useState<addStruct[]>([])
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [conditionFormVisible, setConditionFormVisible] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [messageVisible, setMessageVisible] = useState(false)
  const [signalVisible, setSignalVisible] = useState(false)
  const [taskVisible, setTaskVisible] = useState(false)
  const [multiInstanceVisible, setMultiInstanceVisible] = useState(false)
  const [taskListenerVisible, setTaskListenerVisible] = useState(false)
  const [elementListenerVisible, setElementListenerVisible] = useState(true)
  const [outputPropsVisible, setOutpurPropsVisible] = useState(false)
  const [extensionPropertiesVisible, setExtensionPropertiesVisible] = useState(true)
  const [addTitle, setAddTitle] = useState("")
  //条件流转
  const [useConditionalPath, setUseConditionalPath] = useState(false)

  const phone = initialState?.currentUser?.phone
  const token = initialState?.currentUser?.token
  const [form] = Form.useForm()
  const [addForm] = Form.useForm()
  //const ref = React.createRef()
  const request = useRequest(
    (values: any) => {
      message.loading({
        content: "Processing ",
        key: "process",
        duration: 0
      })
      const {uri, method, ...formValues} = values
      //console.log('useRequest: ', values)
      return {
        url: `${httpUrl}${uri}`,
        method: method,
        //body: JSON.stringify(formValues)
        data: {
          ...formValues,
          phone,
          token
        }
      }
    },
    {
      manual: true,
      onSuccess: (data:any) => {
        message.success({
          content: data.msg,
          key: 'process'
        })
        //hideModal(true)
      },
      onError: (() => {
        message.success({
          content: "操作数据失败",
          key: 'process'
        })
      }),
      formatResult: (res:any) => {
        return res
      }
    })

  useEffect(()=>{
    console.log("+++++++++ supported: ",isMessageSupported(bpmnEle))
    console.log(" elementBusinessObject root: ",getRoot(businessObject))
    console.log("uuid: ","OutputVariable-"+uuid().slice(0,8))
    console.log("inside processPenal bpmnModeler: ",modeler)
    const elementBaseInfo = bpmnEle?.businessObject
      //elementBusinessObject!=null?JSON.parse(JSON.stringify(elementBusinessObject)):null;
    //console.log("elementBaseInfo: "+elementBaseInfo?.id+":"+(elementBaseInfo?.name||"kong"))
    form.setFieldsValue({ID:elementBaseInfo?.id,name:elementBaseInfo?.name||""})
    let elementType = elementBaseInfo?.$type?.split(":")[1] || "";
    //console.log("elementBaseInfo?.type: ",elementBaseInfo?.$type)
    let conditionFormVisible = !!(
      elementType === "SequenceFlow" &&
      bpmnEle.source &&
      bpmnEle.source.type.indexOf("StartEvent") === -1
    )
   // console.log("elementType:  ",elementBaseInfo?.type)
    setConditionFormVisible(conditionFormVisible)
    let formVisible = elementType === "UserTask" || elementType === "StartEvent"
    setFormVisible(formVisible)
    //let outputPropsVisible = elementType === "UserTask" || elementType === "StartEvent"
    //setOutpurPropsVisible(outputPropsVisible)
    //let messageAndSignalVisible =  elementType === "Process1"
    if (isMessageSupported(bpmnEle)) {
      console.log(getBusinessObject(bpmnEle))
      setMessageVisible(true)
    }else{
      setMessageVisible(false)
    }
    if (isSignalSupported(bpmnEle)) {
      console.log(getBusinessObject(bpmnEle))
      setSignalVisible(true)
    }else{
      setSignalVisible(false)
    }
    console.log("bpmnEle",bpmnEle)
    console.log("isMessageSupported(bpmnEle)",isMessageSupported(bpmnEle))
    console.log("getMessageEventDefinition",getMessageEventDefinition(bpmnEle))
    if(isSignalSupported(bpmnEle)){
      setSignalVisible(true)
    }
    let taskVisible = (elementType.indexOf('Task') !== -1)
    setTaskVisible(taskVisible)
    let multiInstanceVisible = (elementType.indexOf('Task') !== -1)
    setMultiInstanceVisible(multiInstanceVisible)
    let taskListenerVisible = (elementType === 'UserTask')
    setTaskListenerVisible(taskListenerVisible)
  },[businessObject])
  const onChange = (event:Event) => {
    //console.log(event)
  }
  const createElement = (event:Event|undefined, Task:String) => {
    console.log("event:", event);
    console.log("Task:", Task);
  }

  const genHeader = (content:string) => {
   if(content === "常规"){
      return <span><InfoCircleFilled
        onClick={event => {
          // If you don't want click extra trigger collapse, you can prevent this:
          event.stopPropagation();
        }}
      /><span style={{marginLeft:10,fontSize:16,fontWeight:600}}>常规</span></span>
    }
    if(content === "消息"){
      return <span><MessageFilled
        onClick={event => {
          // If you don't want click extra trigger collapse, you can prevent this:
          event.stopPropagation();
        }}
      /><span style={{marginLeft:10,fontSize:16,fontWeight:600}}>消息</span></span>
    }
    if(content === "信号"){
      return <span><MessageFilled
        onClick={event => {
          // If you don't want click extra trigger collapse, you can prevent this:
          event.stopPropagation();
        }}
      /><span style={{marginLeft:10,fontSize:16,fontWeight:600}}>信号</span></span>
    }
    if(content === "流转条件"){
      return <span><NotificationFilled
        onClick={event => {
          // If you don't want click extra trigger collapse, you can prevent this:
          event.stopPropagation();
        }}
      /><span style={{marginLeft:10,fontSize:16,fontWeight:600}}>流转条件</span></span>
    }
    if(content === "表单"){
      return <span><TableOutlined
        onClick={event => {
          // If you don't want click extra trigger collapse, you can prevent this:
          event.stopPropagation();
        }}
      /><span style={{marginLeft:10,fontSize:16,fontWeight:600}}>表单</span></span>
    }
    if(content === "任务"){
      return <span><InfoCircleFilled
        onClick={event => {
          // If you don't want click extra trigger collapse, you can prevent this:
          event.stopPropagation();
        }}
      /><span style={{marginLeft:10,fontSize:16,fontWeight:600}}>任务</span></span>
    }
    if(content === "多实例"){
      return <span><DiffOutlined
        onClick={event => {
          // If you don't want click extra trigger collapse, you can prevent this:
          event.stopPropagation();
        }}
      /><span style={{marginLeft:10,fontSize:16,fontWeight:600}}>多实例</span></span>
    }
    if(content === "任务监听器"){
      return <span><DeploymentUnitOutlined
        onClick={event => {
          // If you don't want click extra trigger collapse, you can prevent this:
          event.stopPropagation();
        }}
      /><span style={{marginLeft:10,fontSize:16,fontWeight:600}}>任务监听器</span></span>
    }
    if(content === "执行监听器"){
      return <span><DeploymentUnitOutlined
        onClick={event => {
          // If you don't want click extra trigger collapse, you can prevent this:
          event.stopPropagation();
        }}
      /><span style={{marginLeft:10,fontSize:16,fontWeight:600}}>执行监听器</span></span>
    }
    if(content === "扩展属性"){
      return <span><PlusCircleFilled
        onClick={event => {
          // If you don't want click extra trigger collapse, you can prevent this:
          event.stopPropagation();
        }}
      /><span style={{marginLeft:10,fontSize:16,fontWeight:600}}>扩展属性</span></span>
    }
    if(content === "文档"){
      return <span><LinkOutlined
        onClick={event => {
          // If you don't want click extra trigger collapse, you can prevent this:
          event.stopPropagation();
        }}
      /><span style={{marginLeft:10,fontSize:16,fontWeight:600}}>文档</span></span>
    }
    if(content === "输出变量"){
      return <span><LinkOutlined
        onClick={event => {
          // If you don't want click extra trigger collapse, you can prevent this:
          event.stopPropagation();
        }}
      /><span style={{marginLeft:10,fontSize:16,fontWeight:600}}>输出变量</span></span>
    }
    /*if(content === "占位"){
      return <span><PlusCircleFilled
        onClick={event => {
          // If you don't want click extra trigger collapse, you can prevent this:
          event.stopPropagation();
        }}
      /><span style={{marginLeft:10,fontSize:16,fontWeight:600}}>占位</span></span>
    }*/
    return null;
  };

  const  addProcessModal = ()=> {
    if(addTitle==="消息"){
      const obj:addStruct = {
        no: ''+messageDataSource.length +1,
        id: addForm.getFieldValue('id'),
        name:addForm.getFieldValue('name'),
      }
      setMessageDataSource([...messageDataSource,obj])
    }else{
      const obj:addStruct = {
        no: ''+(messageDataSource.length +1),
        id: addForm.getFieldValue('id'),
        name:addForm.getFieldValue('name'),
      }
      setSignalDataSource([...signalDataSource,obj])
    }
  }

  const { Panel } = Collapse;
  const { Option } = Select;
  return (
    <div  className={styles.ProcessPanelContainer}>
      <Collapse expandIconPosition={"end"} defaultActiveKey={['1']} onChange={onChange}>
        <Panel header={genHeader("常规")} key="1">
          <BaseInfo />
        </Panel>
        {messageVisible?
          <Panel header={genHeader("消息")} key="2">
            <Message />
          </Panel>:null
        }
        {signalVisible?
        <Panel header={genHeader("信号")} key="3">
          <Signal />
        </Panel>:null
        }
        {conditionFormVisible?
          <Panel header={genHeader("流转条件")} key="4">
            <FlowConditional />
          </Panel>:null
        }
        {formVisible?
          <Panel header={genHeader("表单")} key="5">
            <ElementForm />
          </Panel>:null
        }
        {taskVisible ?
          <Panel header={genHeader("任务")} key="6">
            <Task />
          </Panel> : null
        }
        {multiInstanceVisible?
          <Panel header={genHeader("多实例")} key="7">
            <MultiInstance />
          </Panel>:null
        }
        {elementListenerVisible?
        <Panel header={genHeader("执行监听器")} key="8">
          <ElementListener />
        </Panel>:null}
        {taskListenerVisible?
          <Panel header={genHeader("任务监听器")} key="9">
            <UserTaskListener />
          </Panel>:null
        }
        {extensionPropertiesVisible?
          <Panel header={genHeader("扩展属性")} key="10">
            <Properties />
          </Panel>:null
        }
        <Panel header={genHeader("文档")} key="11">
          <Other />
        </Panel>
        {outputPropsVisible?
        <Panel header={genHeader("输出变量")} key="12">
          <OutputPropsPenal />
        </Panel>:null}
        {/*<Panel header={genHeader("占位")} key="9">
          <Other elementBusinessObject={elementBusinessObject} bpmnModeler={bpmnModeler} bpmnElement={bpmnElement}/>
        </Panel>*/}
      </Collapse>
      <AntdModal
        title={addTitle==="消息"?"创建消息":"创建信号"}
        visible={addModalVisible}
        onOk={()=>{
          addProcessModal()
          setAddModalVisible(false)
        }}
        onCancel={()=>{
          // hideModal()
          setAddModalVisible(false)
        }}
        maskClosable={false}
        forceRender
      >
        <Form
          form={addForm}
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={()=>{}}
          onFinishFailed={()=>{}}
          autoComplete="off"
        >
          <Form.Item
            label={addTitle==="消息"?"消息ID":"信号ID"}
            name="id"
          >
            <Input  onChange={(event)=>{}} />
          </Form.Item>

          <Form.Item
            label={addTitle==="消息"?"消息名称":"信号名称"}
            name="name"
          >
            <Input  onChange={(event)=>{}}/>
          </Form.Item>
        </Form>
      </AntdModal>
    </div>
  )
}

export default ProcessPanel
