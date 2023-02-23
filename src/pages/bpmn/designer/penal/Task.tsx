import {useEffect, useState, useRef, useContext,} from 'react'
import {FormInstance, message as AntdMessage,Checkbox, Card, Modal as AntdModal, Table, Button, Collapse, Form, Input,Switch,Select,Row,Col} from 'antd'
import {useModel,useRequest} from "@umijs/max";
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
//import {httpUrl} from '../../../services/ant-design-pro/globalParams'
import { InfoCircleFilled,MessageFilled,NotificationFilled,PlusCircleFilled,SettingOutlined,LeftOutlined, PlusCircleOutlined,
  AppstoreOutlined} from '@ant-design/icons';
import debounce from "lodash.debounce"
import BpmnModeler from "bpmn-js/lib/Modeler";
import React from "react";
import useSyncState from "../../useStateSync"
import PropertiesPenalContext from "../propertiesPenalContext"
import {CheckboxChangeEvent} from "antd/lib/checkbox";
import {instanceOf} from "prop-types";

interface user {
  id: string,
  name: string,
}
interface group {
  id: string,
  name: string,
}
interface messageInterface {
  id: string,
  name: string,
}

const Task = () => {
  const {prefix,modeler,moddle,modeling,businessObject,bpmnEle} = useContext(PropertiesPenalContext)
  const {initialState} = useModel('@@initialState')
  //消息信号
  const [multiVisible, setMultiVisible] = useState(false)
  const [loopProperty,setLoopProperty] = useState("none")
  const [loopCount, setLoopCount] = useState("")
  const [collections, setCollections] = useState("")
  const [atomVariables, setAtomVariables] = useState("")
  const [finishCondition, setFinishCondition] = useState("")
  const [asyncBefore, setAsyncBefore] = useState(false)
  const [asyncAfter, setAsyncAfter] = useState(false)
  const [exclusive,setExclusive] = useState(false)
  const [exclusiveVisible,setExclusiveVisible] = useState(false)
  const [userIdentity,setUserIdentity] = useState(true)
  const [userValue,setUserValue] = useState(false)
  const [assigneeValue,setAssigneeValue] = useState("")
  const [canDidateUserValue,setCanDidateUserValue] = useState("")
  const [canDidateGrpValue,setCanDidateGrpValue] = useState("")
  const [userOptionsValues,setUserOptionsValues] = useState<string[]>()
  const [grpValues, setGrpValues] = useState<string[]>()
  const [exclusiveValues, setExclusiveValues] = useState<string[]>()
  const [tryPeriod,setTryPeriod] = useState("")
  const [user, setUser] = useState<user>()
  const [candidateUsers, setCandidateUsers] = useState()
  const [candidateGroups, setCandidateGroups] = useState()
  const [scriptFormat,setScriptFormat] = useState("")
  const [scriptType,setScriptType] = useState("")
  const [script,setScript] = useState("")
  const [resource,setResource] = useState("")
  //const [resultVariable,setResultVariable] = useState("")
  const [resultVariable,setResultVariable] = useState("")

  //const [prefix, setPrefix] = useState("flowable")
  const [type, setType] = useState("")
  const [id, setId] = useState("")
  const [name, setName] = useState("")
  const [message,setMessage] = useState<messageInterface>()
  const [editMessageVisible, setEditMessageVisible] = useState(false)
  const [messageMap, setMessageMap] = useState({})
  const [messageQueue, setMessageQueue] = useState([])
  const [assignee, setAssignee] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [followUpDate, setFollowUpDate] = useState("")
  const [priority, setPriority] = useState("")
  const [bindMessageId,setBindMessageId] = useState("")
  const [bpmnMessageRefsMap, setBpmnMessageRefsMap] = useState<any>()

  //条件流转
  const phone = initialState?.currentUser?.phone
  const token = initialState?.currentUser?.token

  const users:user[] = [
    { id: '1', name: '龙海鹰' },
    { id: '2', name: '吴良材' },
    { id: '3', name: '张三' },
    { id: '4', name: '李四' },
    { id: '5', name: '王五' },
    { id: '6', name: '赵六' },
    { id: '7', name: '马小奇' },
    { id: '8', name: '仇小王' },
  ];
  const groups:group[] = [
    { id: '1', name: '招财组' },
    { id: '2', name: '花钱组' },
    { id: '3', name: '讨债组' },
    { id: '4', name: '物料组' },
    { id: '5', name: '其他组' },
  ];
  const options = [
    { label: '异步前', value: 'asyncBefore' },
    { label: '异步后', value: 'asyncAfter' },
  ];
  const options1 = [
    { label: '排除', value: 'exclusive' },
  ];
  const userOptions = [
    { label: '用户身份模式', value: 'userIdentity' },
    { label: '固定用户模式', value: 'userValue' },
  ];
  const request = useRequest(
    (values: any) => {
      AntdMessage.loading({
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
        AntdMessage.success({
          content: data.msg,
          key: 'process'
        })
        //hideModal(true)
      },
      onError: (() => {
        AntdMessage?.success({
          content: "操作数据失败",
          key: 'process'
        })
      }),
      formatResult: (res:any) => {
        return res
      }
    })

  const setDebounceAssigneeValue = debounce((value:string)=>{
    console.log("debouce setAssigneeValue:",value)
    setAssigneeValue(value)
  },100)
  const setDebounceCandidateUserValue = debounce((value:string)=>{
    console.log("debouce setCanDidateUserValue:",value)
    setCanDidateUserValue(value)
  },100)
  const setDebounceCandidateGrpValue = debounce((value:string)=>{
    console.log("debouce setCanDidateGrpValue:",value)
    setCanDidateGrpValue(value)
  },100)
  useEffect(()=>{
    const eleType = bpmnEle.type.split(":")[1] || "";
    if(eleType==="UserTask") {
      updateElementTask('assignee', assigneeValue)
    }
  },[assigneeValue])
  useEffect(()=>{
    const eleType = bpmnEle.type.split(":")[1] || "";
    if(eleType==="UserTask") {
      updateElementTask('candidateUsers', canDidateUserValue)
    }
  },[canDidateUserValue])
  useEffect(()=>{
    const eleType = bpmnEle.type.split(":")[1] || "";
    if(eleType==="UserTask") {
      updateElementTask('candidateGroups', canDidateGrpValue)
    }
  },[canDidateGrpValue])
  useEffect(()=>{
    console.log(resultVariable)
    console.log(scriptFormat)
    updateScriptTask()
  },[resultVariable,scriptFormat,resource,resultVariable,scriptType])

  useEffect(()=>{
    console.log("inside processPenal: userIdentity userValue ",businessObject," ", userIdentity," ",userValue)
    console.log("inside processPenal: ",businessObject)
    if(businessObject === undefined || businessObject === null) return
    const elementBaseInfo = businessObject!=null?JSON.parse(JSON.stringify(businessObject)):null;
    console.log("elementBaseInfo: "+elementBaseInfo?.id+":"+elementBaseInfo?.name)
    const asyncBefore1 = businessObject?.asyncBefore;
    const asyncAfter1 = businessObject?.asyncAfter;
    const exclusive1 = businessObject?.exclusive;
    setAsyncBefore(asyncBefore1)
    setAsyncAfter(asyncAfter1)
    setExclusive(exclusive1)
    const eleType = bpmnEle.type.split(":")[1] || "";
    setType(eleType)
    console.log("eleType: ",eleType)
    if(eleType==="UserTask"){
      setCanDidateUserValue("")
      setCanDidateGrpValue("")
      const canDidUers = businessObject['candidateUsers'] ?
        businessObject['candidateUsers'].split(",") : [];
      let indexOfDollar = businessObject['candidateUsers']?.indexOf('$') > -1;
      if(indexOfDollar){
        setUserIdentity(false)
        setUserValue(true)
      }
      console.log("bpmnEle",bpmnEle)
      console.log("bpmnEle?.businessObject",businessObject)
      console.log("bpmnEle?.businessObject['candidateUsers']",businessObject['candidateUsers'])
      console.log("indexOfDollar1",indexOfDollar)
       indexOfDollar?
        setCanDidateUserValue(businessObject['candidateUsers']):
        setCandidateUsers(canDidUers)
      const canDidGrps = businessObject['candidateGroups'] ?
        businessObject['candidateGroups'].split(",") : [];
      console.log("bpmnEle?.businessObject['candidateGroups']",businessObject['candidateGroups'])
      console.log("indexOfDollar2",indexOfDollar)
      let indexOfDollar1 =businessObject['candidateGroups']?.indexOf('$') > -1
      if(indexOfDollar1){
        setUserIdentity(false)
        setUserValue(true)
      }
      indexOfDollar1 ?
        setCanDidateGrpValue(businessObject['candidateGroups']):
        setCandidateGroups(canDidGrps)

      const assign = businessObject['assignee'] ||"";
      let indexOfDollar2 =businessObject['assignee']?.indexOf('$') > -1;
      (indexOfDollar||indexOfDollar1||userValue) ?setAssigneeValue(assign) :""
      !(indexOfDollar||indexOfDollar1||userValue) ?setAssignee(assign):""
      indexOfDollar2? setAssigneeValue(assign):setAssignee(assign)

      console.log("assign",assign)
      !(indexOfDollar||indexOfDollar1) ?setUser({id:assign,name:""}):setUser({id:"",name:""})
      const dueDat = businessObject['dueDate'] ||""
      setDueDate(dueDat)
      const followUpDat = businessObject['followUpDate'] ||""
      setFollowUpDate(followUpDat)
      const prior = businessObject['priority'] ||""
      setPriority(prior)
    }
    if(eleType==="ScriptTask"){
      resetFormScript()
    }
    if(eleType==="ReceiveTask"){
      resetMessageMap()
    }
  },[businessObject])

  const resetFormScript =()=> {
      const scriptFormat1 = bpmnEle?.businessObject['scriptFormat'] || ""
      setScriptFormat(scriptFormat1)
      const script1 = bpmnEle?.businessObject['script'] || ""
      setScript(script1)
      const resource1 = bpmnEle?.businessObject['resource'] || ""
      setResource(resource1)
      const resultVariable1 = bpmnEle?.businessObject['resultVariable'] || ""
      setResultVariable(resultVariable1)
      const scriptType1 = script1? "inline" : "external"
      setScriptType(scriptType1)
      if(script1===""){
        setScriptType("")
      }
  }
  const onChange = (checkedValues: CheckboxValueType[]) => {
    setGrpValues(checkedValues as string[])
    let asyncBefore1,asyncAfter1
    if(checkedValues.indexOf("asyncBefore") >-1){
      asyncBefore1 = true
      setAsyncBefore(asyncBefore1)
      console.log('asyncBefore   ',asyncBefore1);
    }else{
      asyncBefore1 = false
      setAsyncBefore(asyncBefore1)
      console.log('asyncBefore   ',asyncBefore1);
    }
    if(checkedValues.indexOf("asyncAfter") >-1){
      asyncAfter1 = true
      setAsyncAfter(asyncAfter1)
      console.log('asyncAfter   ',asyncAfter1);
    }else{
      asyncAfter1 = false
      setAsyncAfter(asyncAfter1)
      console.log('asyncAfter   ',asyncAfter1);
    }
    if(checkedValues.length>=1){
      setExclusiveVisible(true)
    }else{
      setExclusiveVisible(false)
    }
    changeTaskAsync(asyncBefore1,asyncAfter1,exclusive)
    console.log('checked = ', checkedValues);
  };
  const onChange1 = (checkedValues: CheckboxValueType[]) => {
    let exclusive1
    setExclusiveValues(checkedValues as string[])
    if(checkedValues.indexOf("exclusive") >-1){
      exclusive1 = true
      setExclusive(exclusive1)
      console.log('exclusive   ',exclusive1);
    }else{
      exclusive1 = false
      setExclusive(exclusive1)
      console.log('exclusive   ',exclusive1);
    }
    changeTaskAsync(asyncBefore,asyncAfter,exclusive1)
   // console.log('checked = ', checkedValues);
  };
 const onUserOptionsChange = (e: CheckboxChangeEvent) => {
     setUserIdentity(e.target.checked)
     if(e.target.checked){
       setUserValue(false)
     }
     console.log('CheckboxChangeEvent   ',e);
 };
  const onUserValueChange = (e: CheckboxChangeEvent) => {
    setUserValue(e.target.checked)
    if(e.target.checked){
      setUserIdentity(false)
      console.log('setUserIdentity(false)',)
    }
    console.log('CheckboxChangeEvent   ',e);
  };
  const updateElementTask = (key:string,value:string|any[]) => {
    if(type ==="ScriptTask") return
    const taskAttr = Object.create(null);
    if ((key === "candidateUsers" || key === "candidateGroups")&&userIdentity ) {
      taskAttr[key] = value && value.length &&(value instanceof Array) ? value.join() : null;
    } else {
      taskAttr[key] = value || null;
    }
    modeling.updateProperties(bpmnEle, taskAttr);
  }

  const updateScriptTask = ()=> {
    if(type !=="ScriptTask") return
    let taskAttr = Object.create(null);
    taskAttr.scriptFormat = scriptFormat || null;
    taskAttr.resultVariable = resultVariable || null;
    if (scriptType === "inline") {
      taskAttr.script = script || null;
      taskAttr.resource = null;
    } else {
      taskAttr.resource = resource || null;
      taskAttr.script = null;
    }
    modeling.updateProperties(bpmnEle, taskAttr);
  }
  const changeTaskAsync = (asyncBefore1:boolean,asyncAfter1:boolean,exclusive1:boolean)=> {
    if (!asyncBefore1 && !asyncAfter1) {
      exclusive1 = false;
    }
    //setExclusive(exclusive1)
    modeling.updateProperties(bpmnEle, {
      asyncAfter:asyncAfter1,
      asyncBefore:asyncBefore1,
      exclusive:exclusive1
    });
  }
  const resetMessageMap = () => {
    const bpmnMessageRefsMap = Object.create(null);
    const bpmnRootElements = modeler.getDefinitions().rootElements;
    bpmnRootElements
      .filter(el => el.$type === "bpmn:Message")
      .forEach(m => {
        bpmnMessageRefsMap[m.id] = m;
        const mes={[ m.id]:m.name}
        const bing = Object.assign(messageMap,mes)
        setMessageMap(bing)
      });
    const mes={[ "-1"]:"无"}
    const bing = Object.assign(messageMap,mes)
    setMessageMap(bing); // 添加一个空对象，保证可以取消原消息绑定
    setBpmnMessageRefsMap(bpmnMessageRefsMap)
  }
  const createNewMessage =() => {
    if (messageMap[id]) {
      AntdMessage.error("该消息已存在，请修改id后重新保存");
      return;
    }
    const newMessage = moddle.create("bpmn:Message", {id,name});
    modeler.getDefinitions().rootElements.push(newMessage);
    const mes={[id]:name}
    const bing = Object.assign(messageMap,mes)
    setMessageMap(bing)
    const messageQueue1 = messageQueue
    messageQueue1.push(id)
    setMessageQueue(messageQueue1)
    const bpmnMessageRefsMap1 = bpmnMessageRefsMap
    bpmnMessageRefsMap1[id] = newMessage;
    setEditMessageVisible(false)
  }
  const deleteMessage = () =>{
    console.log("messageMap: ",messageMap)
    console.log("messageQueue: ",messageQueue)
    if(bindMessageId !== "-1"){
      let messageMap1 = messageMap
      delete messageMap1[bindMessageId]
      console.log("messageMap1:",messageMap1)
      const index = messageQueue.findIndex((id)=>{
        return id === bindMessageId
      })
      console.log("index:",index)
    }
  }
  const { Option } = Select;
  return (
        <>
          <Row style={{marginTop: "10px"}} justify="end" align="middle">
            <Col span={6}><span>异步延续</span></Col>
            <Col span={12}>
              <Checkbox.Group
                options={options}
                defaultValue={['']}
                value={grpValues}
                onChange={onChange}
              />
            </Col>
            {exclusiveVisible ?
              <Col span={6}>
                <Checkbox.Group
                  options={options1}
                  defaultValue={['']}
                  value={exclusiveValues}
                  onChange={onChange1}
                />
              </Col> : <Col span={6}></Col>
            }
          </Row>
          {type==="UserTask"?
            <>
              <Row style={{marginTop: "10px"}} justify="end" align="middle">
                <Col span={6}><span>用户模式</span></Col>
                <Col span={18}>
                  <Checkbox
                    checked={userIdentity}
                    onChange={onUserOptionsChange}
                  >
                    用户身份模式
                  </Checkbox>
                  <Checkbox
                    checked={userValue}
                    onChange={onUserValueChange}
                  >
                    固定用户模式
                  </Checkbox>
                </Col>
              </Row>
              {userIdentity?
              <Row style={{marginTop: "10px"}} justify="end" align="middle">
                <Col span={6}><span>处理用户</span></Col>
                <Col span={18}>
                  <Select
                    labelInValue
                    defaultValue={{value: ""}}
                    value={{value: user?.id}}
                    style={{width: '100%'}}
                    onChange={(value: { value: string; label: React.ReactNode }) => {
                      setUser({id: value.value, 'name': value.label})
                      updateElementTask('assignee',value.value)
                    }}
                  >
                    {users.map((user) => {
                      return (<Option value={user.id}>{user.name}</Option>)
                    })}
                  </Select>
                </Col>
              </Row>:
                <Row style={{marginTop: "10px"}} justify="end" align="middle">
                  <Col span={6}><span>处理用户</span></Col>
                  <Col span={18}>
                    <Input value={assigneeValue}
                      onChange={(event)=> {
                      console.log(event.target.value)
                      setDebounceAssigneeValue(event.target.value)
                    }
                    }/>
                  </Col>
                </Row>
              }
              {userIdentity?
              <Row style={{marginTop: "10px"}} justify="end" align="middle">
                <Col span={6}><span>候选用户</span></Col>
                <Col span={18}>
                  <Select
                    mode="multiple"
                    allowClear
                    style={{width: '100%'}}
                    value={candidateUsers}
                    onChange={(value: string[]) => {
                      setCandidateUsers(value)
                      updateElementTask('candidateUsers',value)
                      console.log(value)
                      console.log("candidateUsers",candidateUsers)
                    }}
                  >
                    {users.map((user) => {
                      return (<Option value={user.id}>{user.name}</Option>)
                    })}
                  </Select>
                </Col>
              </Row>:
                <Row style={{marginTop: "10px"}} justify="end" align="middle">
                <Col span={6}><span>候选用户</span></Col>
                <Col span={18}>
                  <Input value={canDidateUserValue} onChange={(event)=> {
                      console.log(event.target.value)
                      setDebounceCandidateUserValue(event.target.value)
                    }
                  }/>
                </Col>
                </Row>
              }
              {userIdentity?
              <Row style={{marginTop: "10px"}} justify="end" align="middle">
                <Col span={6}><span>候选分组</span></Col>
                <Col span={18}>
                  <Select
                    mode="multiple"
                    allowClear
                    style={{width: '100%'}}
                    value={candidateGroups}
                    onChange={(value: string[]) => {
                      setCandidateGroups(value)
                      updateElementTask('candidateGroups',value)
                      console.log(value)
                      console.log("candidateGroups",candidateGroups)
                    }}
                  >
                    {groups.map((group) => {
                      return (<Option value={group.id}>{group.name}</Option>)
                    })}
                  </Select>
                </Col>
              </Row>:
                <Row style={{marginTop: "10px"}} justify="end" align="middle">
                  <Col span={6}><span>候选分组</span></Col>
                  <Col span={18}>
                    <Input value={canDidateGrpValue}  onChange={(event)=> {
                      console.log(event.target.value)
                      setDebounceCandidateGrpValue(event.target.value)
                    }
                    }/>
                  </Col>
                </Row>
                }
              <Row style={{marginTop: "10px"}} justify="end" align="middle">
                <Col span={6}><span>到期时间</span></Col>
                <Col span={18}>
                  <Input value={dueDate} onChange={(event)=> {
                    setDueDate(event.target.value)
                    updateElementTask('dueDate', event.target.value)
                  }
                  }/>
                </Col>
              </Row>
              <Row style={{marginTop: "10px"}} justify="end" align="middle">
                <Col span={6}><span>跟踪时间</span></Col>
                <Col span={18}>
                  <Input value={followUpDate} onChange={(event)=>{
                    setFollowUpDate(event.target.value)
                    updateElementTask('followUpDate',event.target.value)
                  }}/>
                </Col>
              </Row>
              <Row style={{marginTop: "10px"}} justify="end" align="middle">
                <Col span={6}><span>优先级</span></Col>
                <Col span={18}>
                  <Input value={priority} onChange={(event)=> {
                    setPriority(event.target.value)
                    updateElementTask('priority',event.target.value)
                  }
                  }/>
                </Col>
              </Row>
            </>:null
          }
          {type==="ScriptTask"?
            <>
              <Row style={{marginTop: "10px"}} justify="end" align="middle">
                <Col span={6}><span>脚本格式</span></Col>
                <Col span={18}>
                  <Input value={scriptFormat} onChange={(event) => {
                    setScriptFormat(event.target.value)
                  }}/>
                </Col>
              </Row>
              <Row style={{marginTop: "10px"}} justify="end" align="middle">
                <Col span={6}><span>脚本类型</span></Col>
                <Col span={18}>
                  <Select
                    labelInValue
                    value={{value: scriptType, label: scriptType}}
                    style={{width: '100%'}}
                    onChange={(value: { value: string; label: React.ReactNode }) => {
                      setScriptType(value.value)
                    }}
                  >
                    <Option value="inline">内联脚本</Option>
                    <Option value="external">外部脚本</Option>
                  </Select>
                </Col>
              </Row>
              {scriptType === "inline" ?
                <Row style={{marginTop: "10px"}} justify="end" align="middle">
                  <Col span={6}><span>脚本内容</span></Col>
                  <Col span={18}>
                    <Input value={script} onChange={(event) => {
                      setScript(event.target.value)
                    }}/>
                  </Col>
                </Row> : null
              }
              {scriptType === "external" ?
                <Row style={{marginTop: "10px"}} justify="end" align="middle">
                  <Col span={6}><span>资源地址</span></Col>
                  <Col span={18}>
                    <Input value={resource} onChange={(event) => {
                      setResource(event.target.value)
                    }}/>
                  </Col>
                </Row> : null
              }
              <Row style={{marginTop: "10px"}} justify="end" align="middle">
                <Col span={6}><span>结果变量</span></Col>
                <Col span={18}>
                  <Input value={resultVariable} onChange={(event) => {
                    setResultVariable(event.target.value)
                  }}/>
                </Col>
              </Row>
            </>:null
          }
          { type==="ReceiveTask"?
            <Row style={{marginTop: "10px"}} justify="end" align="middle">
              <Col span={4}><span>消息实例</span></Col>
              <Col span={14}>
                <Select
                  labelInValue
                  defaultValue={{value: "无"}}
                  value={{value: bindMessageId, label: bindMessageId}}
                  style={{width: '100%'}}
                  onChange={(value: { value: string; label: React.ReactNode }) => {
                    console.log("BindMessageId",value.value)
                    setBindMessageId(value.value)
                  }}
                >
                  {Object.keys(messageMap).length === 0 ?
                    <Option value={"无"}>无</Option>
                    : Object.keys(messageMap).map((id) => {
                      return (<Option value={id}>{messageMap[id]}</Option>)
                    })}
                </Select>
              </Col>
              <Col span={1}></Col>
              <Col span={2}><Button type="primary"
                                    onClick={() => {
                                      setId("")
                                      setName("")
                                      setEditMessageVisible(true)
                                    }
                                    }
              >+</Button></Col>
              <Col span={1}></Col>
              <Col span={2}><Button type="primary"
                                    onClick={() => {
                                     // deleteMessage()
                                    }
                                    }
              >-</Button></Col>
            </Row>:null
          }
          <AntdModal
            title={"创建新消息"}
            visible={editMessageVisible}
            onOk={()=>{
              createNewMessage()
            }}
            onCancel={()=>{
              // hideModal()
              setEditMessageVisible(false)
            }}
            maskClosable={false}
            forceRender
            closable={true}
            centered={false}
            style={{top:10,right:50}}
          >
            <Row style={{marginTop:"10px"}} justify="end" align="middle">
              <Col span={6}><span>消息ID</span></Col>
              <Col span={18}>
                <Input value={id} onChange={(event)=>{setId(event.target.value)}}/>
              </Col>
            </Row>
            <Row style={{marginTop:"10px"}} justify="end" align="middle">
              <Col span={6}><span>消息名称</span></Col>
              <Col span={18}>
                <Input value={name} onChange={(event)=>{setName(event.target.value)}}/>
              </Col>
            </Row>
          </AntdModal>
        </>
  )
}


export default Task
