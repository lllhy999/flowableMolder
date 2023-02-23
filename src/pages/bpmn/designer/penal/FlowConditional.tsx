import {useEffect, useState, useRef, useContext,} from 'react'
import {FormInstance, message, Card, Modal as AntdModal, Table, Button, Collapse, Form, Input,Switch,Select,Row,Col} from 'antd'
import {useModel,useRequest} from "@umijs/max";
import styles from  './ProcessPenal.less'
import { InfoCircleFilled,MessageFilled,NotificationFilled,PlusCircleFilled,SettingOutlined,LeftOutlined, PlusCircleOutlined,
  AppstoreOutlined} from '@ant-design/icons';
import BpmnModeler from "bpmn-js/lib/Modeler";
import React from "react";
import BaseInfo from "@/pages/bpmn/designer/penal/BaseInfo";
import {debounce} from "min-dash";
import PropertiesPenalContext from "../propertiesPenalContext"

const FlowConditional = () => {
  const {prefix,modeler,moddle,modeling,businessObject,bpmnEle} = useContext(PropertiesPenalContext)
  const {initialState} = useModel('@@initialState')
  //条件流转
  const [useConditionalPath, setUseConditionalPath] = useState(false)
  const [useExpression,setUseExpression] = useState(true)
  const [useInlineScript,setUseInlineScript] = useState(true)
  const [type, setType] = useState("default")
  const [conditionType, setConditionType] = useState("expression")
  const [scriptType, setScriptType] = useState("inlineScript")
  const [expression, setExpression] = useState("")
  const [script, setScript] = useState("")
  const [body, setBody] = useState("")
  const [resource, setResource] = useState("")
  const [language, setLanguage] = useState("")
  const [inlineScript, setInlineScript] = useState("")
  const [externalScript, setExternalScript] = useState("")
  const phone = initialState?.currentUser?.phone
  const token = initialState?.currentUser?.token
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
    resetFlowCondition()
  },[businessObject])
  useEffect(()=>{
    updateFlowCondition()
  },[conditionType,scriptType,body,language,resource])
  const resetFlowCondition = ()=> {
    console.log("businessObject ====: ",businessObject)
    if(businessObject?.conditionExpression === null||businessObject?.conditionExpression === undefined){
      setType("default")
      setUseConditionalPath(false)
    }else{
      setType("condition")
      setUseConditionalPath(true)
      console.log("have conditionExpression: ")
      if(businessObject?.conditionExpression?.language === null||businessObject?.conditionExpression?.language === undefined){
        console.log("expression++++: ")
        setUseExpression(true)
        setConditionType("expression")
        setBody(businessObject?.conditionExpression?.body)
      }else {
        console.log("script++++: ",businessObject?.conditionExpression?.language)
        setUseExpression(false)
        setConditionType("script")
        setLanguage(businessObject?.conditionExpression?.language)
        if(businessObject?.conditionExpression?.body === null||businessObject?.conditionExpression?.body === undefined){
          setScriptType("externalScript")
          setUseInlineScript(false)
          console.log("externalScript++++: ")
          setResource(businessObject?.conditionExpression?.resource)
        }else {
          setScriptType("inlineScript")
          setUseInlineScript(true)
          console.log("inlineScript++++: ")
          setBody(businessObject?.conditionExpression?.body)
        }
      }
    }
   // const bpmnElementSource = bpmnElement.source;
    /*const bpmnElementSourceRef = bpmnEle.businessObject.sourceRef;
    console.log("bpmnElementSourceRef: ",bpmnEle.businessObject)
    if (bpmnElementSourceRef && bpmnElementSourceRef.default && bpmnElementSourceRef.default.id === bpmnEle.id) {
      // 默认
      setType("default")
      setUseConditionalPath(false)
    } else if (!bpmnEle.businessObject.conditionExpression) {
      // 普通
      setUseConditionalPath(false)
      setType("normal")
    } else {
      // 带条件
      const conditionExpression = bpmnEle.businessObject.conditionExpression;
      const flowConditionForm = { ...conditionExpression, type: "condition" };
      // resource 可直接标识 是否是外部资源脚本
      if (flowConditionForm.resource) {
        //setUseExpression(false)
       // setConditionType("script")
        //{ resource, language }
      //  setResource(conditionExpression?.resource)
      //  setLanguage(conditionExpression?.language)
        flowConditionForm.conditionType = "script"
        flowConditionForm.scriptType = "externalScript"
        return;
      }
      if (conditionExpression.language) {
       // setUseExpression(false)
     //   setConditionType("script")
        //{ body, language }
       // setBody(conditionExpression?.body)
     //   setLanguage(conditionExpression?.language)
        flowConditionForm.conditionType = "script"
        flowConditionForm.scriptType = "inlineScript"
        return;
      }
     // setUseExpression(false)
    //  setConditionType("expression")
      flowConditionForm.conditionType = "expression"
    }*/
  }
  const updateFlowType = (value: { value: string; label: React.ReactNode }) => {
    if(value.value === 'condition'){
      setUseConditionalPath(true)
      setType(value.value)
    }else if(value.value === 'normal'||value.value === 'default'){
      setUseConditionalPath(false)
      setType(value.value)
    }
    console.log(value.value); // { value: "lucy", key: "lucy", label: "Lucy (101)" }
  }
  const updateFlowCondition =()=> {
    let condition;
    if (conditionType === "expression") {
      condition = modeler.get("moddle").create("bpmn:FormalExpression", { body });
    } else {
      if (scriptType === "inlineScript") {
        condition = modeler.get("moddle").create("bpmn:FormalExpression", { body, language });

        setResource("")
      } else {
        setBody("")
        condition = modeler.get("moddle").create("bpmn:FormalExpression", { resource, language });
      }
    }
    console.log("condition: ",condition)
    modeler.get("modeling").updateProperties(bpmnEle, { conditionExpression: condition });
  }

  const handleConditionTypeChange = (value: { value: string; label: React.ReactNode }) => {
    if(value.value === 'script'){
      setUseExpression(false)
      setConditionType("script")
    }else if(value.value === 'expression'){
      setUseExpression(true)
      setConditionType("expression")
    }
    setBody("")
    console.log(value); // { value: "lucy", key: "lucy", label: "Lucy (101)" }
  };
  const handleScriptChange = (value: { value: string; label: React.ReactNode }) => {
    if(value.value === 'inlineScript'){
      setUseInlineScript(true)
      setScriptType("inlineScript")
    }else if(value.value === 'externalScript'){
      setUseInlineScript(false)
      setScriptType("externalScript")
    }
    console.log(value); // { value: "lucy", key: "lucy", label: "Lucy (101)" }
  }
  const setDebounceScript = debounce((value:string)=>{
    console.log("setBody Name:",value)
    setBody(value)
    //updateFlowCondition()
  },1000)
  const { Option } = Select;
  return (
        <>
          <Row justify="end" align="middle">
            <Col span={6}><span>流转类型</span></Col>
            <Col span={18}>
              <Select
                labelInValue
                defaultValue={{ value: 'default', label: '默认流转路径' }}
                value={{ value: type }}
                style={{ width: '100%' }}
                onChange={(value: { value: string; label: React.ReactNode })=>updateFlowType(value)}
              >
                <Option value="normal">普通流转路径</Option>
                <Option value="default">默认流转路径</Option>
                <Option value="condition">条件流转路径</Option>
              </Select>
            </Col>
          </Row>
          { useConditionalPath? <>
            <Row style={{marginTop:"10px"}} justify="end" align="middle">
              <Col span={6}><span>条件格式</span></Col>
              <Col span={18}>
                <Select
                  labelInValue
                  defaultValue={{ value: conditionType,label:"" }}
                  value={{ value: conditionType }}
                  style={{ width: '100%' }}
                  onChange={handleConditionTypeChange}
                >
                  <Option value="expression">表达式</Option>
                  <Option value="script">脚本</Option>
                </Select>
              </Col>
            </Row>
            {useExpression ?
              <Row style={{marginTop: "10px"}} justify="end" align="middle">
                <Col span={6}><span>表达式</span></Col>
                <Col span={18}>
                  <Input value={body} onChange={(event)=> {
                    setBody(event.target.value)
                   // updateFlowCondition(event.target.value,"")
                  }}/>
                </Col>
              </Row>:<>
                <Row style={{marginTop:"10px"}} justify="end" align="middle">
                  <Col span={6}><span>脚本语言</span></Col>
                  <Col span={18}>
                    <Input value={language} onChange={(event)=>{
                      setLanguage(event.target.value)
                      console.log("--------------",event.target.value)
                     // scriptType === "inlineScript"?updateFlowCondition(body,event.target.value)
                     //   :updateFlowCondition(resource,event.target.value)
                    }}/>
                  </Col>
                </Row>
                <Row style={{marginTop:"10px"}} justify="end" align="middle">
                  <Col span={6}><span>脚本类型</span></Col>
                  <Col span={18}>
                    <Select
                      labelInValue
                      defaultValue={{ value: 'inlineScript', label: '内联脚本' }}
                      value={{value: scriptType}}
                      style={{ width: '100%' }}
                      onChange={handleScriptChange}
                    >
                      <Option value="inlineScript">内联脚本</Option>
                      <Option value="externalScript">外部脚本</Option>
                    </Select>
                  </Col>
                </Row>
                {useInlineScript?
                  <Row style={{marginTop:"10px"}} justify="end" align="middle">
                    <Col span={6}><span>脚本</span></Col>
                    <Col span={18}>
                      <Input value={body} onChange={(event)=>{
                        setBody(event.target.value)
                        setDebounceScript(event.target.value)
                      //  updateFlowCondition(event.target.value,language)
                      }}/>
                    </Col>
                  </Row>
                  :
                  <Row style={{marginTop:"10px"}} justify="end" align="middle">
                    <Col span={6}><span>资源地址</span></Col>
                    <Col span={18}>
                      <Input value={resource} onChange={(event)=>{
                        setResource(event.target.value)
                     //   updateFlowCondition(event.target.value,language)
                      }}/>
                    </Col>
                  </Row>
                }
              </>
            }
          </>:null}
          {/*<Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={24}>
              <Button style={{width:"100%"}}  type="primary" onClick={()=>{updateFlowCondition()}}>提交</Button>
            </Col>
          </Row>*/}
        </>
  )
}


export default FlowConditional
