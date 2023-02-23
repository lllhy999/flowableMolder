import {useEffect, useState, useRef, useContext,} from 'react'
import {FormInstance, message, Card, Modal as AntdModal, Table, Button, Collapse, Form, Input,Switch,Select,Row,Col} from 'antd'
import {useModel,useRequest} from "@umijs/max";
import { InfoCircleFilled,MessageFilled,NotificationFilled,PlusCircleFilled,SettingOutlined,LeftOutlined, PlusCircleOutlined,
  AppstoreOutlined} from '@ant-design/icons';
import debounce from "lodash.debounce"
import BpmnModeler from "bpmn-js/lib/Modeler";
import React from "react";
import PropertiesPenalContext from "../propertiesPenalContext"

const Other = () => {
  const {prefix,modeler,moddle,modeling,businessObject,bpmnEle,bpmnFactory} = useContext(PropertiesPenalContext)
  const {initialState} = useModel('@@initialState')
  const [documentation, setDocumentation] = useState("")
  const phone = initialState?.currentUser?.phone
  const token = initialState?.currentUser?.token
  const [form] = Form.useForm()
  //const ref = React.createRef()

  useEffect(()=>{
    console.log("inside processPenal: ",businessObject)
    const documentations = bpmnEle.businessObject?.documentation;
    const doc = documentations && documentations.length ? documentations[0].text : "";
    setDocumentation(doc)
  },[businessObject])

  const setDebounceDoc = debounce((value:string)=>{
    setDocumentation(value)
    console.log("debouce Doc:",value)
  },1000)
  const { Panel } = Collapse;
  return (
    <>
      <Row justify="end" align="middle">
        <Col span={6}><span>元素文档</span></Col>
        <Col span={18}>
          <Input.TextArea value={documentation} onChange={(event)=>{
            setDocumentation(event.target.value)
            const doc = bpmnFactory.create("bpmn:Documentation", { text: event.target.value })
            modeling.updateProperties(bpmnEle, {
              documentation: [doc]
            })
          }}/>
        </Col>
      </Row>
      </>
  )
}
export default Other
