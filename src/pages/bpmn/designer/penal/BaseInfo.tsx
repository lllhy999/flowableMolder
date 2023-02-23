import {useEffect, useState, useRef, useContext,} from 'react'
import {  Form, Input,Switch} from 'antd'
//import {useModel,useRequest} from "@umijs/max";
//import {httpUrl} from '../../../services/ant-design-pro/globalParams'
import debounce from "lodash.debounce"
import BpmnModeler from "bpmn-js/lib/Modeler";
import PropertiesPenalContext from "../propertiesPenalContext"

const BaseInfo = () => {
  const {modeler,modeling,businessObject,bpmnEle} = useContext(PropertiesPenalContext)
  //const {initialState} = useModel('@@initialState')
  const [id,setId] = useState("")
  const [name, setName] = useState("")
  const [versionTag, setVersionTag] = useState("")
  const [isExecutable,setIsExecutable] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  //const phone = initialState?.currentUser?.phone
  //const token = initialState?.currentUser?.token
  const [elementBaseInfo, setElementBaseInfo] = useState<any>()
  const [form] = Form.useForm()
  //const ref = React.createRef()
  let bpmnModelerRef = useRef<BpmnModeler>();
  let bpmnElementRef = useRef<any>()
  let elementBaseInfoRef = useRef<any>()
  useEffect(()=>{
    //console.log("inside processPenal: ",elementBusinessObject)
    //console.log("inside processPenal bpmnModeler: ",bpmnModeler)
    //console.log("inside processPenal bpmnElement: ",bpmnElement)
    const elementBaseInfo = businessObject!=null?JSON.parse(JSON.stringify(businessObject)):null;
    if (elementBaseInfo && elementBaseInfo.$type === "bpmn:SubProcess") {
      elementBaseInfo["isExpanded"] = elementBaseInfo.di?.isExpanded;
      form.setFieldsValue({isExpanded:elementBaseInfo?.isExpanded})
    }
    //console.log("elementBaseInfo: "+elementBaseInfo?.id+":"+elementBaseInfo?.name)
    setElementBaseInfo(elementBaseInfo)
    form.setFieldsValue({id:elementBaseInfo?.id,name:elementBaseInfo?.name,
      versionTag:elementBaseInfo?.versionTag,isExecutable:elementBaseInfo?.isExecutable})
    bpmnModelerRef.current = modeler;
    bpmnElementRef.current =bpmnEle
    elementBaseInfoRef.current = elementBaseInfo
    resetBaseInfo()
  },[businessObject])

  useEffect(()=>{
    updateBaseInfo('id',id)
  },[id])
  useEffect(()=>{
    updateBaseInfo('name',name)
  },[name])
  useEffect(()=>{
    updateBaseInfo('versionTag',versionTag)
  },[versionTag])
  useEffect(()=>{
    updateBaseInfo('isExecutable',isExecutable)
  },[isExecutable])
  useEffect(()=>{
    updateBaseInfo('isExpanded',isExpanded)
  },[isExpanded])

  const resetBaseInfo =()=> {

  }
  const updateBaseInfo =(key:string,value:any)=> {
    //console.log("bpmnModeler:",modeler)
    if (key === "id") {
      modeling?.updateProperties(bpmnElementRef.current, {
        id: value,
        di: { id: `${value}_di` }
      });
      return;
    }
    if (key === "isExpanded") {
      modeling?.toggleCollapse(bpmnElementRef.current);
      return;
    }

    const attrObj = Object.create(null);
    attrObj[key] = value;
    modeling?.updateProperties(bpmnEle, attrObj);
  }

  const setDebounceID = debounce((value:string)=>{
    setId(value)
   // console.log("debouce ID:",value)
  },1000)
  const setDebounceName = debounce((value:string)=>{
    setName(value)
    //console.log("debouce Name:",value)
  },1000)
  const setDebounceVersion = debounce((value:string)=>{
    setVersionTag(value)
   // console.log("debouce Version:",value)
  },1000)
  const onExecuteChange = (checked: boolean)=>{
    setIsExecutable(checked)
   // console.log(`switch to ${checked}`);
  }
  const onExpandChange = (checked: boolean) => {
    setIsExpanded(checked)
    //console.log(`switch to ${checked}`);
  }
  //const { Panel } = Collapse;
  return (
    <div>
          <Form
            form={form}
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            initialValues={{ remember: true }}
            onFinish={()=>{}}
            onFinishFailed={()=>{}}
            autoComplete="off"
          >
            <Form.Item
              label="ID"
              name="id"
            >
              <Input disabled={false} onChange={(event)=>{setDebounceID(event.target.value);}} />
            </Form.Item>

            <Form.Item
              label="名称"
              name="name"
            >
              <Input  onChange={(event)=>{setDebounceName(event.target.value);}}/>
            </Form.Item>
            {elementBaseInfo?.$type === "bpmn:Process"?
              <>
              <Form.Item
                label="版本标签"
                name="versionTag"
              >
                <Input  onChange={(event)=>{setDebounceVersion(event.target.value);}}/>
              </Form.Item>
              <Form.Item
                label="可执行"
                name="isExecutable"
              >
                <Switch checked={isExecutable} checkedChildren="是" unCheckedChildren="否"  onChange={(checked,event)=>{
                  onExecuteChange(checked)
                  setIsExecutable(checked)
                }} defaultChecked />
              </Form.Item>
            </>:
              null}
            {elementBaseInfo?.$type === "bpmn:SubProcess"?
              <Form.Item
                label="可折叠"
                name="isExpanded"
              >
                <Switch checked={isExpanded} checkedChildren="是" unCheckedChildren="否"  onChange={(checked,event)=>{
                  onExpandChange(checked)
                  setIsExpanded(checked)
                }} defaultChecked={false} />
              </Form.Item>
              :null
            }
          </Form>
    </div>
  )
}
export default BaseInfo
