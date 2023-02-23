import {useEffect, useState, useRef, useContext,} from 'react'
import {FormInstance, message, Card, Modal as AntdModal, Table, Button, Collapse,
  Form, Input,Switch,Select,Row,Col} from 'antd'
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
  id: string,
  listenerType: string,
  scriptModel: string,
  scriptType: string,
  scriptContent: string,
  timerType: string,
  timer: string,
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
  id: string,
  listenerType: string,
  class: string,
  expression: string,
  delegateExpression: string,
  scriptType: string,
  scriptFormat: string,
  value?: string,
  resource?: string,
  eventDefinitionType?: string,
  eventTimeDefinitions?: string,
  fields: field[]
}
const UserTaskListener = () => {
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
  const [id, setId] = useState("")
  const [listenerType, setListenerType] = useState("string")
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
  const [timerType,setTimerType] = useState("")
  const [timer,setTimer] = useState("")
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
      title: '事件id',
      dataIndex: 'id',
      key: 'id',
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
            setEventType(item.eventType)
            setId(item.id)
            setListenerType(item.listenerType)
            setScriptModel(item.scriptModel)
            setScriptType(item.scriptType)
            setScriptContent(item.scriptContent)
            setTimerType(item.timerType)
            setTimer(item.timer)
            setJavaClass(item.javaClass)
            setExpression(item.expression)
            setProxyExpression(item.proxyExpression)
            setEditPropertyModalVisible(true)
            const indexNO = parseInt(item.no) -1
            const propertySrc:propertyStruct[] = elementListenersList[indexNO].fields?.map((item,index)=>{
                let propertySingle: propertyStruct
                propertySingle= {
                  propertyNo: "" + (index + 1),
                  propertyType: (Object.keys(item).indexOf("expression")>-1&&item["expression"]!=="")?'expression':'string',
                  propertyName: item.name,
                  value: (Object.keys(item).indexOf("expression")>-1&&item["expression"]!=="")?item['expression']:item['string'],
                }
              console.log(item,' : ' ,Object.keys(item)," ",Object.keys(item).indexOf("expression"))
                return propertySingle
            })
            setPropertyDataSource(propertySrc)
          }}>编辑</Button>
          <Button onClick={() => {
            console.log("移除",item)
            const lt = formDataSource.filter((it)=>{return it.no !== item.no})
            for(let i = 0; i< lt.length; i++){
              lt[i].no=""+(i+1)
            }
            //console.log(lt)
            const index = parseInt(item.no)-1
            const bpmnElementListeners1 = bpmnElementListeners
            bpmnElementListeners1.splice(index,1)
            const elementListenersList1 = elementListenersList
            elementListenersList1.splice(index,1)
            setBpmnElementListeners(bpmnElementListeners1)
            setElementListenersList(elementListenersList1)
            let otherExtensionList = bpmnEle.businessObject?.extensionElements?.values?.filter(ex => ex.$type !== `${prefix}:TaskListener`) ?? [];

            setOtherExtensionList(otherExtensionList)
            otherExtensionList = otherExtensionList.concat(bpmnElementListeners)
            updateElementExtensions(modeler,bpmnEle, otherExtensionList);
            setFormDataSource(lt);
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


  const  proProcessModal = ()=> {
    if( id === null ||id ==="" || id === undefined) {
      message.error("ID不能为空")
      return
    }
    if(listenerType=="class"){
      if( javaClass === null ||javaClass ==="" || javaClass === undefined) {
        message.error("java类不能为空")
        return
      }
    }
    if(listenerType=="expression"){
      if( expression === null ||expression ==="" || expression === undefined) {
        message.error("表达式不能为空")
        return
      }
    }
    if(listenerType=="delegateExpression"){
      if( proxyExpression === null ||proxyExpression ==="" || proxyExpression === undefined) {
        message.error("代理表达式不能为空")
        return
      }
    }
    if(listenerType=="script"){
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
    if(timerType==="date"||timerType==="duration"||timerType==="cycle"){
      if( timer === null ||timer ==="" || timer === undefined) {
        message.error("定时器不能为空")
        return
      }
    }
    const obj:addStruct = {
      no: ''+(formDataSource.length +1),
      eventType:eventType,
      id:id,
      listenerType:listenerType,
      scriptModel:scriptModel,
      scriptType,
      scriptContent,
      timerType,
      timer,
      javaClass:javaClass,
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
    const formStructure:propertyForm = {
      id:id,
      event:eventType,
      listenerType:listenerType,
      expression,
      delegateExpression:proxyExpression,
      class: javaClass,
      scriptFormat: scriptModel,
      scriptType: scriptType,
      value:scriptType==="inlineScript"?scriptContent:"",
      resource:scriptType==="externalScript"?urlResource:"",
      eventDefinitionType: timerType,
      eventTimeDefinitions: timer,
      fields: fields
    }
    const listenerObject = createListenerObject(modeler,formStructure,true,prefix)
    console.log("listenerObject: ",listenerObject)
    const bpmnElementListeners1 = bpmnElementListeners
    bpmnElementListeners1.push(listenerObject)
    const elementListenersList1 = elementListenersList
    elementListenersList1.push(formStructure)
    setBpmnElementListeners(bpmnElementListeners1)
    setElementListenersList(elementListenersList1)
    let otherExtensionList = bpmnEle.businessObject?.extensionElements?.values?.filter(ex => ex.$type !== `${prefix}:TaskListener`) ?? [];

    setOtherExtensionList(otherExtensionList)
    otherExtensionList = otherExtensionList.concat(bpmnElementListeners)
    updateElementExtensions(modeler,bpmnEle, otherExtensionList);
    setAddModalVisible(false)

  }
  const editProcessModal = ()=> {
    if( id === null ||id ==="" || id === undefined) {
      message.error("ID不能为空")
      return
    }
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

    let lt = formDataSource.map(item => {
      if(item.no === noValue){
        return {
          no: noValue,
          eventType:eventType,
          id:id,
          listenerType: listenerType,
          scriptModel,
          scriptType,
          scriptContent,
          timerType,
          timer,
          class:javaClass,
          expression,
          proxyExpression,
        }
      }else
        return item
    })
    setFormDataSource(lt)
    const index = parseInt(noValue) -1
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
    console.log("changed fields: ",fields)
    const formStructure:propertyForm = {
      id: id,
      event:eventType,
      listenerType:listenerType,
      expression,
      delegateExpression:proxyExpression,
      class: javaClass,
      scriptFormat: scriptModel,
      scriptType: scriptType,
      value:scriptType==="inlineScript"?scriptContent:"",
      resource:scriptType==="externalScript"?urlResource:"",
      eventDefinitionType: timerType,
      eventTimeDefinitions: timer,
      fields: fields
    }
    const listenerObject = createListenerObject(modeler,formStructure,true,prefix)
    console.log("listenerObject: ",listenerObject)
    const bpmnElementListeners1 = bpmnElementListeners
    bpmnElementListeners1.splice(index,1, listenerObject)
    const elementListenersList1 = elementListenersList
    elementListenersList1.splice(index,1, formStructure)
    setBpmnElementListeners(bpmnElementListeners1)
    setElementListenersList(elementListenersList1)
    let otherExtensionList = bpmnEle.businessObject?.extensionElements?.values?.filter(ex => ex.$type !== `${prefix}:TaskListener`) ?? [];

    setOtherExtensionList(otherExtensionList)
    otherExtensionList = otherExtensionList.concat(bpmnElementListeners)
    updateElementExtensions(modeler,bpmnEle, otherExtensionList);
    setEditPropertyModalVisible(false)
  }
  const setDebounceId = debounce((value:string)=>{
    console.log("setId Name:",value)
    setId(value)
  },100)
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
  const setDebounceTimer = debounce((value:string)=>{
    console.log("setDebounceTimer:",value)
    setTimer(value)
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
      bpmnEle.businessObject?.extensionElements?.values?.filter(ex => ex.$type === `${prefix}:TaskListener`) ?? [];
    const elementListenersList = bpmnElementListeners.map(listener => initListenerType(listener));
    console.log("bpmnElementListeners: ",bpmnElementListeners)
    console.log("elementListenersList: ",elementListenersList)
    setBpmnElementListeners(bpmnElementListeners)
    setElementListenersList(elementListenersList)
    setOtherExtensionList(otherExtensionList)
    let formDataSource:any[] = []
    for(let i = 0; i < elementListenersList.length; i++){
      const constId = bpmnElementListeners[i].$attrs.id
      const obj:addStruct = {
        no: ''+(i +1),
        eventType:elementListenersList[i].event,
        listenerType:ListenerTypeEnum[elementListenersList[i].listenerType],
        scriptModel:scriptModel,
        scriptType:elementListenersList[i].script?.scriptFormat,
        scriptContent:elementListenersList[i].script?.value,
        javaClass:elementListenersList[i].class,
        expression:elementListenersList[i].expression,
        proxyExpression:elementListenersList[i].delegateExpression,
        id:constId,
        timerType,
        timer:elementListenersList[i].timer
      }
      formDataSource.push(obj)
    }
    setFormDataSource(formDataSource)
  }
  const { Option } = Select;
  return (
    <>
      <Card >
        <Table dataSource={formDataSource} columns={initColumns} />
        <Button onClick={()=>{
          setAddModalVisible(true)
          setPropertyDataSource([])
          setId("")
          setEventType("")
          setListenerType("")
          setExpression("")
          setUrlResource("")
          setTimer("")
        }} style={{width:'100%',marginTop:'5px'}} type="primary">+添加监听器</Button>
      </Card>

      <AntdModal
        title={"任务监听器"}
        visible={addModalVisible}
        onOk={()=>{
          proProcessModal()
         // setAddModalVisible(false)
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
              defaultValue={{ value: eventType }}
              value={{ value: eventType,label:eventType }}
              style={{ width: '100%' }}
              onChange={(value: { value: string; label: React.ReactNode })=>{setEventType(value.value)}}
            >
              <Option value="create">创建</Option>
              <Option value="assignment">指派</Option>
              <Option value="complete">完成</Option>
              <Option value="delete">删除</Option>
              <Option value="update">更新</Option>
              <Option value="timeout">超时</Option>
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>监听器ID</span></Col>
          <Col span={18}>
            <Input value={id} onChange={(event)=>{setDebounceId(event.target.value)}}/>
          </Col>
        </Row>
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>监听器类型</span></Col>
          <Col span={18}>
            <Select
              labelInValue
              defaultValue={{ value: listenerType }}
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
        {eventType==="timeout"?
          <>
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>定时器类型</span></Col>
            <Col span={18}>
              <Select
                labelInValue
                defaultValue={{ value: timerType }}
                value={{ value: timerType,label:timerType}}
                style={{ width: '100%' }}
                onChange={(value: { value: string; label: React.ReactNode })=>{setTimerType(value.value)}}
              >
                <Option value="日期">日期</Option>
                <Option value="持续时长">持续时长</Option>
                <Option value="循环">循环</Option>
                <Option value="无">无</Option>
              </Select>
            </Col>
          </Row>
            {(timerType==="date"||timerType==="duration"||timerType==="cycle")?
              <Row style={{marginTop:"10px"}} justify="end" align="middle">
                <Col span={6}><span>定时器</span></Col>
                <Col span={18}>
                  <Input value={timer} onChange={(event)=>{setDebounceTimer(event.target.value)}}/>
                </Col>
              </Row>:null
            }
          </>:null
        }
        <Card style={{marginTop:"10px"}} title={<span style={{fontSize: "14px"}}><AppstoreOutlined/>&nbsp;注入字段:</span>}
              extra={<Button onClick={()=>{
                setSecModalVisible(true);
                setModalTitle("约束");
               // setJavaClass("")
                //setExpression("")
                //setProxyExpression("")
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
              defaultValue={{ value: eventType }}
              value={{ value: eventType,label:eventType }}
              style={{ width: '100%' }}
              onChange={(value: { value: string; label: React.ReactNode })=>{setEventType(value.value)}}
            >
              <Option value="create">创建</Option>
              <Option value="assignment">指派</Option>
              <Option value="complete">完成</Option>
              <Option value="delete">删除</Option>
              <Option value="update">更新</Option>
              <Option value="timeout">超时</Option>
            </Select>
          </Col>
        </Row>
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>监听器ID</span></Col>
          <Col span={18}>
            <Input value={id} onChange={(event)=>{setDebounceId(event.target.value)}}/>
          </Col>
        </Row>
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>监听器类型</span></Col>
          <Col span={18}>
            <Select
              labelInValue
              defaultValue={{ value: listenerType }}
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
        {eventType==="timeout"?
          <>
            <Row style={{marginTop:"10px"}} justify="end" align="middle">
              <Col span={6}><span>定时器类型</span></Col>
              <Col span={18}>
                <Select
                  labelInValue
                  defaultValue={{ value: timerType }}
                  value={{ value: timerType,label:timerType}}
                  style={{ width: '100%' }}
                  onChange={(value: { value: string; label: React.ReactNode })=>{setTimerType(value.value)}}
                >
                  <Option value="date">日期</Option>
                  <Option value="duration">持续时长</Option>
                  <Option value="cycle">循环</Option>
                  <Option value="null">无</Option>
                </Select>
              </Col>
            </Row>
            {(timerType==="date"||timerType==="duration"||timerType==="cycle")?
              <Row style={{marginTop:"10px"}} justify="end" align="middle">
                <Col span={6}><span>定时器</span></Col>
                <Col span={18}>
                  <Input value={timer} onChange={(event)=>{setDebounceTimer(event.target.value)}}/>
                </Col>
              </Row>:null
            }
          </>:null
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
            console.log("changed propertyData: "+JSON.stringify(lt))
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


export default UserTaskListener
