import {useEffect, useState, useRef, useContext,} from 'react'
import {FormInstance, message, Card, Modal as AntdModal, Table, Button, Collapse, Form, Input,Switch,Select,Row,Col} from 'antd'
import {useModel,useRequest} from "@umijs/max";
import { InfoCircleFilled,MessageFilled,NotificationFilled,PlusCircleFilled,SettingOutlined,LeftOutlined, PlusCircleOutlined,
  AppstoreOutlined} from '@ant-design/icons';
import debounce from "lodash.debounce"
import BpmnModeler from "bpmn-js/lib/Modeler";
import React from "react";
import { createListenerObject, updateElementExtensions } from "./utils/utils";
import { initListenerType, initListenerForm, listenerType as ListenerTypeEnum, fieldType } from "./utils/utilSelf"
import PropertiesPenalContext from "../propertiesPenalContext"

interface addStruct  {
  no: string,
  eventType: string,
  listenerType: string,
  scriptModel: string,
  scriptType: string,
  scriptContent: string,
  javaClass: string,
  expression: string,
  proxyExpression: string,
}
interface propertyStruct  {
  propertyNo: string,
  propertyName: string,
  propertyType: string,
  value: string,
}
interface field {
  name: string,
  fieldType: string,
  string: string,
  expression: string
}
interface propertyForm {
  event: string,
  listenerType: string,
  id: string,
  expression: string,
  delegateExpression: string,
  class: string,
  scriptType: string,
  scriptFormat: string,
  value: string,
  resource: string,
  fields: field[]
}
const ElementListener = () => {
  const {prefix,modeler,moddle,modeling,businessObject,bpmnEle} = useContext(PropertiesPenalContext)
  const {initialState} = useModel('@@initialState')
  //消息信号
  const [formDataSource,setFormDataSource] = useState<addStruct[]>([])
  const [propertyDataSource, setPropertyDataSource] = useState<propertyStruct[]>([])
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [editPropertyModalVisible, setEditPropertyModalVisible] = useState(false)
  const [secModalVisible, setSecModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState("约束")
  const [noValue, setNoValue] = useState("")
  const [eventType, setEventType] = useState("")
  const [listenerType, setListenerType] = useState("")
  const [propertyNo, setPropertyNo] = useState("")
  const [propertyName,setPropertyName] = useState("")
  const [propertyType,setPropertyType] = useState("")
  const [value,setValue] = useState("")
  const [javaClass,setJavaClass] = useState("")
  const [expression,setExpression] = useState("")
  const [proxyExpression,setProxyExpression] = useState("")
  const [scriptModel,setScriptModel] = useState("")
  const [scriptType,setScriptType] = useState("")
  const [scriptContent,setScriptContent] = useState("")
  const [urlResource,setUrlResource] = useState("")
  const [elementListenersList, setElementListenersList] = useState<any[]>([])
  const [bpmnElementListeners, setBpmnElementListeners] = useState<any[]>([])
  const [otherExtensionList, setOtherExtensionList] = useState<any[]>([])
  //const [prefix, setPrefix] = useState("flowable")
  //条件流转
  const phone = initialState?.currentUser?.phone
  const token = initialState?.currentUser?.token
  const [form] = Form.useForm()
  const [addForm] = Form.useForm()
  //const ref = React.createRef()
  const initColumns =[
    {
      title: '序号',
      dataIndex: 'no',
      key: 'no',
    },
    {
      title: '事件类型',
      dataIndex: 'eventType',
      key: 'eventType',
    },
    {
      title: '监听器类型',
      dataIndex: 'listenerType',
      key: 'listenerType',
    },
    {
      title: '操作',
      render: (item:addStruct) => (
        <span>
          <Button onClick={() => {
            setNoValue(item.no)
            const index = parseInt(item.no) -1
            console.log("bpmnElementListeners",bpmnElementListeners[index])
            console.log("elementListenersList",elementListenersList[index])
            setEventType(elementListenersList[index].event)
            setListenerType(elementListenersList[index].listenerType)
            console.log("listenerType",elementListenersList[index].listenerType)
            if(ListenerTypeEnum[elementListenersList[index].listenerType]==="script") {
              setScriptModel(elementListenersList[index].scriptFormat)
              setScriptType(elementListenersList[index].scriptType)
              elementListenersList[index].scriptType === "inlineScript" ?
                setScriptContent(elementListenersList[index].value) :
                setScriptContent(elementListenersList[index].resource);
            }
            setJavaClass(elementListenersList[index].class)
            setExpression(elementListenersList[index].expression)
            setProxyExpression(elementListenersList[index].delegateExpression)
            const propertyArray:propertyStruct[] = []
            for(let i = 0; i < elementListenersList[index].fields?.length;i++){
              let property="string",value=""
              if(elementListenersList[index].fields[i].string?.length > 0){
                property="string"
                value=elementListenersList[index].fields[i].string
              }
              if(elementListenersList[index].fields[i].expression?.length > 0){
                property="expression"
                value=elementListenersList[index].fields[i].expression
              }
              const obj:propertyStruct = {
                propertyNo: "" + (i + 1),
                propertyName: elementListenersList[index].fields[i].name,
                propertyType: property,
                value: value
              }
              propertyArray.push(obj)
            }
            setPropertyDataSource(propertyArray)
            setEditPropertyModalVisible(true)
          }}>编辑</Button>
          <Button onClick={() => {
            console.log("移除",item)
            const lt = formDataSource.filter((it)=>{return it.no !== item.no})
            for(let i = 0; i< lt.length; i++){
              lt[i].no=""+(i+1)
            }
            //console.log(lt)
            setFormDataSource(lt);
            const bpmnList:any[] = bpmnElementListeners
            const elementList:any[] = elementListenersList
            const index = parseInt(item.no) -1
            console.log("bpmnList: ",bpmnList)
            console.log("elementList: ",elementList)
            bpmnList?.splice(index,1)
            elementList?.splice(index,1)
            setBpmnElementListeners(bpmnList)
            setElementListenersList(elementList)
            updateElementExtensions(modeler,bpmnEle, otherExtensionList.concat(bpmnList))
          }}>删除</Button>
          </span>
      )
    }
  ]
  const initPropertyColumns =[
    {
      title: '序号',
      dataIndex: 'propertyNo',
      key: 'propertyNo',
    },
    {
      title: '字段名称',
      dataIndex: 'propertyName',
      key: 'propertyName',
    },
    {
      title: '字段类型',
      dataIndex: 'propertyType',
      key: 'propertyType',
    },
    {
      title: '字段值/表达式',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: '操作',
      render: (item:propertyStruct) => (
        <span>
          <Button onClick={() => {
            setModalTitle("属性")
            setPropertyNo(item.propertyNo)
            setPropertyName(item.propertyName)
            setPropertyType(item.propertyType)
            setValue(item.value)
            setEditModalVisible(true)
            console.log("属性编辑",item)
          }}
          >编辑</Button>
          <Button onClick={() => {
            const lt = propertyDataSource.filter((it)=>{return it.propertyNo !== item.propertyNo})
            for(let i = 0; i< lt.length; i++){
              lt[i].propertyNo=""+(i+1)
            }
            //console.log(lt)
            setPropertyDataSource(lt);
            //console.log("属性移除",item)
          }}>移除</Button>
        </span>
      )
    }
  ]
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
        url: `${""}${uri}`,
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
    console.log("inside processPenal: ",businessObject)
    const elementBaseInfo = businessObject!=null?JSON.parse(JSON.stringify(businessObject)):null;
    console.log("elementBaseInfo: "+elementBaseInfo?.id+":"+elementBaseInfo?.name)
    resetListenersList()
  },[businessObject])
  useEffect(()=>{
    setEventType(eventType)
    setListenerType(listenerType)
  },[editModalVisible])
  const  proProcessModal = ()=> {
    if(listenerType=="classListener"){
      if( javaClass === null ||javaClass ==="" || javaClass === undefined) {
        message.error("java类不能为空")
        return
      }
    }
    if(listenerType=="expressionListener"){
      if( expression === null ||expression ==="" || expression === undefined) {
        message.error("表达式不能为空")
        return
      }
    }
    if(listenerType=="delegateExpressionListener"){
      if( proxyExpression === null ||proxyExpression ==="" || proxyExpression === undefined) {
        message.error("代理表达式不能为空")
        return
      }
    }
    if(listenerType=="scriptListener"){
      if( scriptModel === null ||scriptModel ==="" || scriptModel === undefined) {
        message.error("脚本格式不能为空")
        return
      }
      if( scriptType === null ||scriptType ==="" || scriptType === undefined) {
        message.error("脚本类型不能为空")
        return
      }
      if( scriptContent === null ||scriptContent ==="" || scriptContent === undefined) {
        message.error("脚本内容不能为空")
        return
      }
    }
    const obj:addStruct = {
      no: ''+(formDataSource.length +1),
      eventType:eventType,
      listenerType:listenerType,
      scriptModel:scriptModel,
      scriptType,
      scriptContent,
      javaClass,
      expression,
      proxyExpression,
    }

    setFormDataSource([...formDataSource,obj])
    const fields:field[]=[]
    for(let i = 0; i < propertyDataSource.length; i++){
      const fieldStr:field = {
        name:propertyDataSource[i].propertyName,
        fieldType:propertyDataSource[i].propertyType==="string"?"string":"expression",
        string: propertyDataSource[i].propertyType==="string"?propertyDataSource[i].value:"",
        expression: propertyDataSource[i].propertyType==="expression"?propertyDataSource[i].value:"",
      }
      fields.push(fieldStr)
    }
    const baseFormStructure = {
      no: obj.no,
      event:eventType,
      listenerType:listenerType,
    }
    if(listenerType === "classListener"){
      Object.assign(baseFormStructure,{class:javaClass})
    }
    if(listenerType === "expressionListener"){
      Object.assign(baseFormStructure,{expression:expression})
    }
    if(listenerType === "delegateExpressionListener"){
      Object.assign(baseFormStructure,{delegateExpression:proxyExpression})
    }
    if(listenerType === "scriptListener"){
      Object.assign(baseFormStructure,{scriptFormat: scriptModel})
      Object.assign(baseFormStructure,{scriptType:scriptType})
      if(scriptType==="inlineScript"){
        Object.assign(baseFormStructure,{value:scriptContent})
      }
      if(scriptType==="externalScript"){
        Object.assign(baseFormStructure,{resource:urlResource})
      }
    }
    Object.assign(baseFormStructure,{fields:fields})
    const formStructure:propertyForm = {
      id: obj.no,
      event:eventType,
      listenerType:listenerType,
      expression,
      delegateExpression:proxyExpression,
      class: javaClass,
      scriptFormat: scriptModel,
      scriptType: scriptType,
      value:scriptType==="inlineScript"?scriptContent:"",
      resource:scriptType==="externalScript"?urlResource:"",
      fields: fields
    }
    const listenerObject = createListenerObject(modeler,baseFormStructure,false,prefix)
    console.log("baseFormStructure",baseFormStructure)
    console.log("listenerObject: ",listenerObject)
    const bpmnElementListeners1 = bpmnElementListeners
    bpmnElementListeners1.push(listenerObject)
    const elementListenersList1 = elementListenersList
    elementListenersList1.push(formStructure)
    setBpmnElementListeners(bpmnElementListeners1)
    setElementListenersList(elementListenersList1)
    let otherExtensionList = bpmnEle.businessObject?.extensionElements?.values?.filter(ex => ex.$type !== `${prefix}:ExecutionListener`) ?? [];

    setOtherExtensionList(otherExtensionList)
    otherExtensionList = otherExtensionList.concat(bpmnElementListeners)
    updateElementExtensions(modeler,bpmnEle, otherExtensionList);
    setAddModalVisible(false)
  }
  const  editProcessModal = ()=> {
    if(listenerType=="classListener"){
      if( javaClass === null ||javaClass ==="" || javaClass === undefined) {
        message.error("java类不能为空")
        return
      }
    }
    if(listenerType=="expressionListener"){
      if( expression === null ||expression ==="" || expression === undefined) {
        message.error("表达式不能为空")
        return
      }
    }
    if(listenerType=="delegateExpressionListener"){
      if( proxyExpression === null ||proxyExpression ==="" || proxyExpression === undefined) {
        message.error("代理表达式不能为空")
        return
      }
    }
    if(listenerType=="scriptListener"){
      if( scriptModel === null ||scriptModel ==="" || scriptModel === undefined) {
        message.error("脚本格式不能为空")
        return
      }
      if( scriptType === null ||scriptType ==="" || scriptType === undefined) {
        message.error("脚本类型不能为空")
        return
      }
      if( scriptContent === null ||scriptContent ==="" || scriptContent === undefined) {
        message.error("脚本内容不能为空")
        return
      }
    }
    const index = parseInt(noValue) -1
    let lt = formDataSource.map(item => {
      if(item.no === noValue){
        return {
          no: noValue,
          eventType:eventType,
          listenerType: listenerType,
          scriptModel,
          scriptType,
          scriptContent,
          javaClass,
          expression,
          proxyExpression,
        }
      }else
        return item
    })
    setFormDataSource(lt)
    const fields:field[]=[]
    for(let i = 0; i < propertyDataSource.length; i++){
      const fieldStr:field = {
        name:propertyDataSource[i].propertyName,
        fieldType:propertyDataSource[i].propertyType==="string"?"string":"expression",
        string: propertyDataSource[i].propertyType==="string"?propertyDataSource[i].value:"",
        expression: propertyDataSource[i].propertyType==="expression"?propertyDataSource[i].value:"",
      }
      fields.push(fieldStr)
    }
    console.log("fields: ",fields)
    const formStructure:propertyForm = {
      id: noValue,
      event:eventType,
      listenerType:listenerType,
      expression,
      delegateExpression:proxyExpression,
      class: javaClass,
      scriptFormat: scriptModel,
      scriptType: scriptType,
      value:scriptType==="inlineScript"?scriptContent:"",
      resource:scriptType==="externalScript"?urlResource:"",
      fields: fields
    }
    const listenerObject = createListenerObject(modeler,formStructure,false,prefix)
    console.log("listenerObject: ",listenerObject)
    const bpmnLists = bpmnElementListeners
    const eleLists = elementListenersList
    bpmnLists.splice(index,1,listenerObject)
    eleLists.splice(index,1,formStructure)
    setBpmnElementListeners(bpmnLists)
    setElementListenersList(eleLists)

    let otherExtensionList = bpmnEle.businessObject?.extensionElements?.values?.filter(ex => ex.$type !== `${prefix}:ExecutionListener`) ?? [];

    setOtherExtensionList(otherExtensionList)
    otherExtensionList = otherExtensionList.concat(bpmnElementListeners)
    updateElementExtensions(modeler,bpmnEle, otherExtensionList);
    setEditPropertyModalVisible(false)
  }
  const setDebounceJavaClass = debounce((value:string)=>{
    console.log("setJavaClass Name:",value)
    setJavaClass(value)
  },100)
  const setDebounceExpression = debounce((value:string)=>{
    console.log("setExpression Name:",value)
    setExpression(value)
  },100)
  const setDebounceProxyExpression = debounce((value:string)=>{
    console.log("setProxyExpression Name:",value)
    setProxyExpression(value)
  },100)
  const setDebounceScriptModel = debounce((value:string)=>{
    console.log("setScriptModel:",value)
    setScriptModel(value)
  },100)
  const setDebounceScriptContent = debounce((value:string)=>{
    console.log("setScriptContent:",value)
    setScriptContent(value)
  },100)
  const setDebounceUrlResource = debounce((value:string)=>{
    console.log("setUrlResource:",value)
    setUrlResource(value)
  },100)
  const setDebouncePropertyName = debounce((value:string)=>{
    console.log("setDebounceTimer:",value)
    setPropertyName(value)
  },100)
  const setDebounceValue = debounce((value:string)=>{
    console.log("setDebounceTimer:",value)
    setValue(value)
  },100)

  const resetListenersList = ()=> {
    const otherExtensionList:any[] = []
    const bpmnElementListeners =
      bpmnEle.businessObject?.extensionElements?.values?.filter(ex => ex.$type === `${prefix}:ExecutionListener`) ?? [];
    const elementListenersList = bpmnElementListeners.map(listener => initListenerType(listener));
    console.log("bpmnElementListeners: ",bpmnElementListeners)
    console.log("elementListenersList: ",elementListenersList)
    setBpmnElementListeners(bpmnElementListeners)
    setElementListenersList(elementListenersList)
    setOtherExtensionList(otherExtensionList)
    let formDataSource:any[] = []
    for(let i = 0; i < elementListenersList.length; i++){
      const obj:addStruct = {
        no: ''+(i +1),
        eventType:elementListenersList[i].event,
        listenerType:ListenerTypeEnum[elementListenersList[i].listenerType],
        scriptModel:scriptModel,
        scriptType,
        scriptContent,
        javaClass,
        expression,
        proxyExpression,
      }
      formDataSource.push(obj)
    }
    setFormDataSource(formDataSource)
  }
  const { Option } = Select;
  return (
    <>
      <Card >
        <Table pagination={false} dataSource={formDataSource} columns={initColumns} />
        <Button onClick={()=>{
          setAddModalVisible(true)
          setEventType("")
          setListenerType("")
          setExpression("")
          setProxyExpression("")
          setScriptModel("")
          setUrlResource("")
          setValue("")
          setJavaClass("")
          setPropertyDataSource([])
        }} style={{width:'100%',marginTop:'5px'}} type="primary">+添加监听器</Button>
      </Card>

      <AntdModal
        title={"任务监听器"}
        visible={addModalVisible}
        onOk={()=>{
          proProcessModal()
          //setAddModalVisible(false)
        }}
        onCancel={()=>{
          // hideModal()
          setAddModalVisible(false)
        }}
        maskClosable={false}
        forceRender
        closable={true}
        centered={false}
        style={{top:10,right:50}}
      >
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>事件类型</span></Col>
          <Col span={18}>
            <Select
              labelInValue
              defaultValue={{ value: "" }}
              value={{ value: eventType,label:eventType }}
              style={{ width: '100%' }}
              onChange={(value: { value: string; label: React.ReactNode })=>{setEventType(value.value)}}
            >
              <Option value="start">start</Option>
              <Option value="end">end</Option>
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>监听器类型</span></Col>
          <Col span={18}>
            <Select
              labelInValue
              defaultValue={{ value: "" }}
              value={{ value: listenerType,label: listenerType}}
              style={{ width: '100%' }}
              onChange={(value: { value: string; label: React.ReactNode })=>{setListenerType(value.value)}}
            >
              <Option value="classListener">Java类</Option>
              <Option value="expressionListener">表达式</Option>
              <Option value="delegateExpressionListener">代理表达式</Option>
              <Option value="scriptListener">脚本</Option>
            </Select>
          </Col>
        </Row>
        { listenerType ==="classListener"?
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>Java类</span></Col>
            <Col span={18}>
              <Input value={javaClass} onChange={(event)=>{setDebounceJavaClass(event.target.value)}}/>
            </Col>
          </Row>:null
        }
        { listenerType ==="expressionListener"?
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>表达式</span></Col>
            <Col span={18}>
              <Input value={expression} onChange={(event)=>{setDebounceExpression(event.target.value)}}/>
            </Col>
          </Row>:null
        }
        { listenerType ==="delegateExpressionListener"?
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>代理表达式</span></Col>
            <Col span={18}>
              <Input value={proxyExpression} onChange={(event)=>{setDebounceProxyExpression(event.target.value)}}/>
            </Col>
          </Row>:null
        }
        { listenerType ==="scriptListener"?
          (<>
            <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>脚本格式</span></Col>
            <Col span={18}>
              <Input value={scriptModel} onChange={(event)=>{setDebounceScriptModel(event.target.value)}}/>
            </Col>
          </Row>
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
             <Col span={6}><span>脚本类型</span></Col>
             <Col span={18}>
               <Select
                 labelInValue
                 defaultValue={{ value: scriptType }}
                 value={{ value: scriptType,label: scriptType}}
                 style={{ width: '100%' }}
                 onChange={(value: { value: string; label: React.ReactNode })=>{setScriptType(value.value)}}
               >
                 <Option value="inlineScript">内联脚本</Option>
                 <Option value="externalScript">外部脚本</Option>
               </Select>
             </Col>
           </Row>
              {scriptType==="inlineScript"?
                <Row style={{marginTop:"10px"}} justify="end" align="middle">
                  <Col span={6}><span>脚本内容</span></Col>
                  <Col span={18}>
                    <Input value={scriptContent} onChange={(event)=>{setDebounceScriptContent(event.target.value)}}/>
                  </Col>
                </Row>:null
              }
              {scriptType==="externalScript"?
                <Row style={{marginTop:"10px"}} justify="end" align="middle">
                  <Col span={6}><span>资源地址</span></Col>
                  <Col span={18}>
                    <Input value={urlResource} onChange={(event)=>{setDebounceUrlResource(event.target.value)}}/>
                  </Col>
                </Row>:null
              }
          </>
          ):null
        }
        <Card style={{marginTop:"10px"}} title={<span style={{fontSize: "14px"}}><AppstoreOutlined/>&nbsp;注入字段:</span>}
              extra={<Button onClick={()=>{
                setSecModalVisible(true);
                setModalTitle("约束");
                setPropertyName("");
                setPropertyType("");
                setValue("")
              }}
                             size="small" type="primary">添加字段</Button>} >
          <Table dataSource={propertyDataSource} columns={initPropertyColumns} />
        </Card>

      </AntdModal>

      <AntdModal
        title={"任务监听器"}
        visible={editPropertyModalVisible}
        onOk={()=>{
          editProcessModal()
        }}
        onCancel={()=>{
          // hideModal()
          setEditPropertyModalVisible(false)
        }}
        maskClosable={false}
        forceRender
        closable={true}
        centered={false}
        style={{top:10,right:50}}
      >
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>事件类型</span></Col>
          <Col span={18}>
            <Select
              labelInValue
              defaultValue={{ value: "" }}
              value={{ value: eventType,label:eventType }}
              style={{ width: '100%' }}
              onChange={(value: { value: string; label: React.ReactNode })=>{setEventType(value.value)}}
            >
              <Option value="start">start</Option>
              <Option value="end">end</Option>
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>监听器类型</span></Col>
          <Col span={18}>
            <Select
              labelInValue
              defaultValue={{ value: "" }}
              value={{ value: listenerType,label: listenerType}}
              style={{ width: '100%' }}
              onChange={(value: { value: string; label: React.ReactNode })=>{setListenerType(value.value)}}
            >
              <Option value="classListener">Java类</Option>
              <Option value="expressionListener">表达式</Option>
              <Option value="delegateExpressionListener">代理表达式</Option>
              <Option value="scriptListener">脚本</Option>
            </Select>
          </Col>
        </Row>
        { listenerType ==="classListener"?
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>Java类</span></Col>
            <Col span={18}>
              <Input value={javaClass} onChange={(event)=>{setDebounceJavaClass(event.target.value)}}/>
            </Col>
          </Row>:null
        }
        { listenerType ==="expressionListener"?
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>表达式</span></Col>
            <Col span={18}>
              <Input value={expression} onChange={(event)=>{setDebounceExpression(event.target.value)}}/>
            </Col>
          </Row>:null
        }
        { listenerType ==="delegateExpressionListener"?
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>代理表达式</span></Col>
            <Col span={18}>
              <Input value={proxyExpression} onChange={(event)=>{setDebounceProxyExpression(event.target.value)}}/>
            </Col>
          </Row>:null
        }
        { listenerType ==="scriptListener"?
          (<>
              <Row style={{marginTop:"10px"}} justify="end" align="middle">
                <Col span={6}><span>脚本格式</span></Col>
                <Col span={18}>
                  <Input value={scriptModel} onChange={(event)=>{setDebounceScriptModel(event.target.value)}}/>
                </Col>
              </Row>
              <Row style={{marginTop:"10px"}} justify="end" align="middle">
                <Col span={6}><span>脚本类型</span></Col>
                <Col span={18}>
                  <Select
                    labelInValue
                    defaultValue={{ value: scriptType }}
                    value={{ value: scriptType,label: scriptType}}
                    style={{ width: '100%' }}
                    onChange={(value: { value: string; label: React.ReactNode })=>{setScriptType(value.value)}}
                  >
                    <Option value="inlineScript">内联脚本</Option>
                    <Option value="externalScript">外部脚本</Option>
                  </Select>
                </Col>
              </Row>
              {scriptType==="inlineScript"?
                <Row style={{marginTop:"10px"}} justify="end" align="middle">
                  <Col span={6}><span>脚本内容</span></Col>
                  <Col span={18}>
                    <Input value={scriptContent} onChange={(event)=>{setDebounceScriptContent(event.target.value)}}/>
                  </Col>
                </Row>:null
              }
              {scriptType==="externalScript"?
                <Row style={{marginTop:"10px"}} justify="end" align="middle">
                  <Col span={6}><span>资源地址</span></Col>
                  <Col span={18}>
                    <Input value={urlResource} onChange={(event)=>{setDebounceUrlResource(event.target.value)}}/>
                  </Col>
                </Row>:null
              }
            </>
          ):null
        }
        <Card style={{marginTop:"10px"}} title={<span style={{fontSize: "14px"}}><AppstoreOutlined/>&nbsp;注入字段:</span>}
              extra={<Button onClick={()=>{
                setSecModalVisible(true);
                setModalTitle("约束");
                setPropertyName("");
                setPropertyType("");
                setValue("");
              }}
                             size="small" type="primary">添加字段</Button>} >
          <Table dataSource={propertyDataSource} columns={initPropertyColumns} />
        </Card>

      </AntdModal>

      <AntdModal
        title={"字段配置"}
        visible={secModalVisible}
        onOk={()=>{
          // addProcessModal()
          if( propertyName === null ||propertyName ==="" || propertyName === undefined) {
            message.error("字段名称不能为空")
            return
          }
          if( propertyType === null ||propertyType ==="" || propertyType === undefined) {
            message.error("字段类型不能为空")
            return
          }
          if( value === null ||value ==="" || value === undefined) {
            message.error("字段值/表达式不能为空")
            return
          }
            setPropertyDataSource(
              [...propertyDataSource,
                {
                  propertyNo: ""+(propertyDataSource.length+1),
                  propertyName: propertyName,
                  propertyType: propertyType,
                  value:value
                }
              ]
            )
          setPropertyName("")
          setPropertyType("")
          setSecModalVisible(false)
        }}
        onCancel={()=>{
          // hideModal()
          setPropertyName("")
          setPropertyType("")
          setSecModalVisible(false)
        }}
        maskClosable={false}
        forceRender
        closable={true}
        centered={false}
        style={{top:10,right:50}}
      >
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>{"字段名称"}</span></Col>
          <Col span={18}>
            <Input value={propertyName} onChange={(event)=>{setDebouncePropertyName(event.target.value)}}/>
          </Col>
        </Row>
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>字段类型</span></Col>
          <Col span={18}>
            <Select
              labelInValue
              defaultValue={{ value: propertyType }}
              value={{ value: propertyType,label: propertyType}}
              style={{ width: '100%' }}
              onChange={(value: { value: string; label: React.ReactNode })=>{setPropertyType(value.value)}}
            >
              <Option value="string">字符串</Option>
              <Option value="expression">表达式</Option>
            </Select>
          </Col>
        </Row>
        {propertyType==="string"?
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>{"字段值"}</span></Col>
            <Col span={18}>
              <Input value={value} onChange={(event)=>{{setDebounceValue(event.target.value)}}}/>
            </Col>
          </Row>:null
        }
        {propertyType==="expression"?
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>{"表达式"}</span></Col>
            <Col span={18}>
              <Input value={value} onChange={(event)=>{{setDebounceValue(event.target.value)}}}/>
            </Col>
          </Row>:null
        }
      </AntdModal>
      <AntdModal
        title={"字段编辑"}
        visible={editModalVisible}
        onOk={()=>{
          // addProcessModal()
          if( propertyName === null ||propertyName ==="" || propertyName === undefined) {
            message.error("字段名称不能为空")
            return
          }
          if( propertyType === null ||propertyType ==="" || propertyType === undefined) {
            message.error("字段类型不能为空")
            return
          }
          if( value === null ||value ==="" || value === undefined) {
            message.error("字段值/表达式不能为空")
            return
          }
            let lt = propertyDataSource.map(item => {
              if(item.propertyNo === propertyNo){
                return {
                  propertyNo,
                  propertyName: propertyName,
                  propertyType: propertyType,
                  value:value
                }
              }else
                return item
            })
            setPropertyDataSource(lt)
            setEditModalVisible(false)
            //console.log("find Index: "+index)
        }}
        onCancel={()=>{
          // hideModal()

          setEditModalVisible(false)
        }}
        maskClosable={false}
        forceRender
        closable={true}
        centered={false}
        style={{top:10,right:50}}
      >
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>{"字段名称"}</span></Col>
          <Col span={18}>
            <Input value={propertyName} onChange={(event)=>{setDebouncePropertyName(event.target.value)}}/>
          </Col>
        </Row>
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>字段类型</span></Col>
          <Col span={18}>
            <Select
              labelInValue
              defaultValue={{ value: propertyType,label: propertyType }}
              style={{ width: '100%' }}
              value={{ value: propertyType,label: propertyType}}
              onChange={(value: { value: string; label: React.ReactNode })=>{setPropertyType(value.value)}}
            >
              <Option value="string">字符串</Option>
              <Option value="expression">表达式</Option>
            </Select>
          </Col>
        </Row>
        {propertyType==="string"?
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>{"字段值"}</span></Col>
            <Col span={18}>
              <Input value={value} onChange={(event)=>{{setDebounceValue(event.target.value)}}}/>
            </Col>
          </Row>:null
        }
        {propertyType==="expression"?
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>{"表达式"}</span></Col>
            <Col span={18}>
              <Input value={value} onChange={(event)=>{{setDebounceValue(event.target.value)}}}/>
            </Col>
          </Row>:null
        }
      </AntdModal>
    </>
  )
}


export default ElementListener
