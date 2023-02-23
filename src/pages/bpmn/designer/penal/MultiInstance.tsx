import {useEffect, useState, useRef, useContext,} from 'react'
import {FormInstance, message,Checkbox, Card, Modal as AntdModal, Table, Button, Collapse, Form, Input,Switch,Select,Row,Col} from 'antd'
import {useModel,useRequest} from "@umijs/max";
import type { CheckboxValueType } from 'antd/es/checkbox/Group';
//import {httpUrl} from '../../../services/ant-design-pro/globalParams'
import { InfoCircleFilled,MessageFilled,NotificationFilled,PlusCircleFilled,SettingOutlined,LeftOutlined, PlusCircleOutlined,
  AppstoreOutlined} from '@ant-design/icons';
import debounce from "lodash.debounce"
import BpmnModeler from "bpmn-js/lib/Modeler";
import React from "react";
import LinkButton from "@/pages/ProductList/component/linkbutton";
import PropertiesPenalContext from "../propertiesPenalContext"

const MultiInstance = () => {
  const {prefix,modeler,moddle,modeling,businessObject,bpmnEle} = useContext(PropertiesPenalContext)
  const {initialState} = useModel('@@initialState')
  //消息信号
  const [multiVisible, setMultiVisible] = useState(false)
  const [loopCharacteristics,setLoopCharacteristics] = useState("无")
  const [loopCardinality, setLoopCardinality] = useState("")
  const [collection, setCollection] = useState("")
  const [elementVariable, setElementVariable] = useState("")
  const [completionCondition, setCompletionCondition] = useState("")
  const [asyncBefore, setAsyncBefore] = useState(false)
  const [asyncAfter, setAsyncAfter] = useState(false)
  const [exclusive,setExclusive] = useState(true)
  const [timeCycle,setTimeCycle] = useState("")
  const [exclusiveVisible,setExclusiveVisible] = useState(false)
  const [exclusiveValues, setExclusiveValues] = useState<string[]>(["exclusive"])
  const [multiLoopInstance, setMultiLoopInstance] = useState()
  //条件流转
  const phone = initialState?.currentUser?.phone
  const token = initialState?.currentUser?.token

  const options = [
    { label: '异步前', value: 'asyncBefore' },
    { label: '异步后', value: 'asyncAfter' },
  ];
  const options1 = [
    { label: '排除', value: 'exclusive' },
  ];
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
    getElementLoop()
  },[businessObject])
  useEffect(()=>{
    changeLoopCharacteristicsType()
  },[loopCharacteristics])
  useEffect(()=>{
    updateLoopCardinality()
  },[loopCardinality])
  useEffect(()=>{
    updateLoopBase()
  },[collection,elementVariable])
  useEffect(()=>{
    updateLoopCondition()
  },[completionCondition])
  useEffect(()=>{
    updateLoopAsync('asyncBefore')
  },[asyncBefore])
  useEffect(()=>{
    updateLoopAsync('asyncAfter')
  },[asyncAfter])
  useEffect(()=>{
    updateLoopAsync('exclusive')
  },[exclusive])
  useEffect(()=>{
    updateLoopTimeCycle()
  },[timeCycle])
  const setDebounceLoopCardinality = debounce((value:string)=>{
    console.log("debouce setLoopCardinality:",value)
    setLoopCardinality(value)
  },1000)
  const setDebounceLoopCharacteristics = debounce((value:string)=>{
    console.log("debouce setLoopCharacteristics:",value)
    setLoopCharacteristics(value)
  },1000)
  const setDebounceCollection = debounce((value:string)=>{
    console.log("debouce Name:",value)
    setCollection(value)
  },1000)
  const setDebounceElementVariable = debounce((value:string)=>{
    console.log("debouce elementVariable:",value)
    setElementVariable(value)
  },1000)
  const setDebounceCompletionCondition = debounce((value:string)=>{
    console.log("completionCondition:",value)
    setCompletionCondition(value)
  },1000)
  const setDebounceTimeCycle = debounce((value:string)=>{
    console.log("timeCycle:",value)
    setTimeCycle(value)
  },1000)

  const onChange = (checkedValues: CheckboxValueType[]) => {
    //setGrpValues(checkedValues as string[])
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
   // changeTaskAsync(asyncBefore1,asyncAfter1,exclusive)
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
    //changeTaskAsync(asyncBefore,asyncAfter,exclusive1)
    // console.log('checked = ', checkedValues);
  };

  const getElementLoop = ()=> {
    if (!businessObject.loopCharacteristics) {
      const loopCharacteristics1 = "Null";
      setLoopCharacteristics(loopCharacteristics1)
      setTimeCycle("")
      setCompletionCondition("")
      setLoopCardinality("")
      setExclusive(false)
      setAsyncAfter(false)
      setAsyncBefore(false)
      return;
    }
    if (businessObject.loopCharacteristics.$type === "bpmn:StandardLoopCharacteristics") {
      const loopCharacteristics1 = "StandardLoop";
      setLoopCharacteristics(loopCharacteristics1)
      setTimeCycle("")
      setCompletionCondition("")
      setLoopCardinality("")
      setExclusive(false)
      setAsyncAfter(false)
      setAsyncBefore(false)
      return;
    }
    if (businessObject.loopCharacteristics.isSequential) {
      setLoopCharacteristics("SequentialMultiInstance");
    } else {
      setLoopCharacteristics("ParallelMultiInstance");
    }
    // 合并配置
      setCompletionCondition(businessObject.loopCharacteristics?.completionCondition?.body ?? "")
      setLoopCardinality(businessObject.loopCharacteristics?.loopCardinality?.body ?? "")
    // 保留当前元素 businessObject 上的 loopCharacteristics 实例
    setMultiLoopInstance(bpmnEle.businessObject.loopCharacteristics)
    // 更新表单
    if (
      businessObject.loopCharacteristics.extensionElements &&
      businessObject.loopCharacteristics.extensionElements.values &&
      businessObject.loopCharacteristics.extensionElements.values.length
    ) {
      setTimeCycle(businessObject.loopCharacteristics.extensionElements.values[0].body);
    }
  }
  const changeLoopCharacteristicsType = ()=> {
    // this.loopInstanceForm = { ...this.defaultLoopInstanceForm }; // 切换类型取消原表单配置
    // 取消多实例配置
    let multiLoopInstance1:any = null
    if (loopCharacteristics === "Null") {
      modeling.updateProperties(bpmnEle, { loopCharacteristics: null });
      return;
    }
    // 配置循环
    if (loopCharacteristics === "StandardLoop") {
      const loopCharacteristicsObject = moddle.create("bpmn:StandardLoopCharacteristics");
      modeling.updateProperties(bpmnEle, {
        loopCharacteristics: loopCharacteristicsObject
      });
      multiLoopInstance1 = null
      setMultiLoopInstance(multiLoopInstance1)
      return;
    }
    // 时序
    if (loopCharacteristics === "SequentialMultiInstance") {
      multiLoopInstance1 = moddle.create("bpmn:MultiInstanceLoopCharacteristics", {
        isSequential: true
      })
      setMultiLoopInstance(multiLoopInstance1)
    } else {
      multiLoopInstance1 = moddle.create("bpmn:MultiInstanceLoopCharacteristics")
      setMultiLoopInstance(multiLoopInstance1)
    }
    modeling.updateProperties(bpmnEle, {
      loopCharacteristics: multiLoopInstance1
    });
  }

  const updateLoopCardinality = () =>{
    let loopCardinality1 = null;
    if (loopCardinality && loopCardinality.length) {
      loopCardinality1 = moddle.create("bpmn:FormalExpression", { body: loopCardinality });
    }
    if(multiLoopInstance === undefined || multiLoopInstance === null) return
    modeling?.updateModdleProperties(bpmnEle, multiLoopInstance, {
      loopCardinality:loopCardinality1
    });
  }
  const  updateLoopCondition =()=> {
    let completionCondition1 = null;
    if (completionCondition && completionCondition.length) {
      completionCondition1 = moddle.create("bpmn:FormalExpression", { body: completionCondition });
    }
    if(multiLoopInstance === undefined || multiLoopInstance === null) return
    modeling?.updateModdleProperties(bpmnEle, multiLoopInstance, {
      completionCondition:completionCondition1
    });
  }
  const updateLoopTimeCycle = ()=> {
    if(multiLoopInstance === undefined || multiLoopInstance === null) return
    const extensionElements =moddle.create("bpmn:ExtensionElements", {
      values: [
        moddle.create(`${prefix}:FailedJobRetryTimeCycle`, {
          body: timeCycle
        })
      ]
    });
    modeling.updateModdleProperties(bpmnEle, multiLoopInstance, {
      extensionElements
    });
  }
  const updateLoopBase = ()=> {
    if(multiLoopInstance === undefined || multiLoopInstance === null) return
    modeling.updateModdleProperties(bpmnEle, multiLoopInstance, {
      collection: collection || null,
      elementVariable: elementVariable || null
    });
  }

  const updateLoopAsync = (key:string)=> {
    if(multiLoopInstance === undefined || multiLoopInstance === null) return
    let asyncAttr = Object.create(null);
    if (!asyncBefore && !asyncAfter) {
      setExclusive(false);
      asyncAttr = { asyncBefore: false, asyncAfter: false, exclusive: false, extensionElements: null };
    } else {
      if(key==="asyncBefore")
        asyncAttr[key] = asyncBefore
      if(key==="asyncAfter")
        asyncAttr[key] = asyncAfter
      if(key==="exclusive")
        asyncAttr[key] = exclusive
    }
    modeling.updateModdleProperties(bpmnEle, multiLoopInstance, asyncAttr);
  }

  const { Option } = Select;
  return (
    <>
      <Row style={{marginTop:"10px"}} justify="end" align="middle">
        <Col span={6}><span>回路特性</span></Col>
        <Col span={18}>
          <Select
            labelInValue
            defaultValue={{ value: loopCharacteristics }}
            style={{ width: '100%' }}
            onChange={(value: { value: string; label: React.ReactNode })=>{
              setLoopCharacteristics(value.value)
              console.log(value.value)
            }}
          >
            <Option value="ParallelMultiInstance">并行多重事件</Option>
            <Option value="SequentialMultiInstance">时序多重事件</Option>
            <Option value="StandardLoop">循环事件</Option>
            <Option value="Null">无</Option>
          </Select>
        </Col>
      </Row>
      {(loopCharacteristics==="ParallelMultiInstance"||loopCharacteristics==="SequentialMultiInstance")?
        <>
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>循环基数</span></Col>
            <Col span={18}>
              <Input value={loopCardinality} onChange={(event)=>{setLoopCardinality(event.target.value)}}/>
            </Col>
          </Row>
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>集合</span></Col>
            <Col span={18}>
              <Input value={collection} onChange={(event)=>{setCollection(event.target.value)}}/>
            </Col>
          </Row>
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>元素变量</span></Col>
            <Col span={18}>
              <Input value={elementVariable} onChange={(event)=>{setDebounceElementVariable(event.target.value)}}/>
            </Col>
          </Row>
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>完成条件</span></Col>
            <Col span={18}>
              <Input value={completionCondition} onChange={(event)=>{setDebounceCompletionCondition(event.target.value)}}/>
            </Col>
          </Row>
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>异步状态</span></Col>
            <Col span={12}>
              <Checkbox.Group
                options={options}
                defaultValue={['']}
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
              </Col> : <Col span={6}></Col>}
          </Row>
          <Row style={{marginTop:"10px"}} justify="end" align="middle">
            <Col span={6}><span>重试周期</span></Col>
            <Col span={18}>
              <Input value={timeCycle} onChange={(event)=>{setDebounceTimeCycle(event.target.value)}}/>
            </Col>
          </Row>
        </>
        :null}
    </>
  )
}


export default MultiInstance
