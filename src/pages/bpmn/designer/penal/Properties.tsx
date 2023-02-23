import {useEffect, useState, useRef, useContext,} from 'react'
import {FormInstance, message, Card, Modal as AntdModal, Table, Button, Collapse, Form, Input,Switch,Select,Row,Col} from 'antd'
import {useModel,useRequest} from "@umijs/max";
import { InfoCircleFilled,MessageFilled,NotificationFilled,PlusCircleFilled,SettingOutlined,LeftOutlined, PlusCircleOutlined,
  AppstoreOutlined} from '@ant-design/icons';
import debounce from "lodash.debounce"
import BpmnModeler from "bpmn-js/lib/Modeler";
import React from "react";
import PropertiesPenalContext from "../propertiesPenalContext"

interface propertyStruct  {
  noValue: string,
  nameValue: string,
  valueValue: string,
}

const Properties = () => {
  const {prefix,modeler,moddle,modeling,businessObject,bpmnEle} = useContext(PropertiesPenalContext)
  const {initialState} = useModel('@@initialState')
  //消息信号
  const [propertyDataSource, setPropertyDataSource] = useState<propertyStruct[]>([])
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editOrDelete,setEditOrDelete] = useState("edit")
  const [modalTitle, setModalTitle] = useState("约束")
  const [noValue, setNoValue] = useState("")
  const [nameValue, setNameValue] = useState("")
  const [valueValue, setValueValue] = useState("string")
  const [editingPropertyIndex, setEditingPropertyIndex] = useState(-1)
  const [elementPropertyList, setElementPropertyList] = useState<any[]>([])
  const [otherExtensionList, setOtherExtensionList] = useState<any[]>([])
  const [bpmnElementPropertyList, setBpmnElementPropertyList] = useState<any[]>([])
  //const [prefix, setPrefix] = useState("flowable")
  //条件流转
  const phone = initialState?.currentUser?.phone
  const token = initialState?.currentUser?.token
  //const ref = React.createRef()
  const initColumns =[
    {
      title: '序号',
      dataIndex: 'noValue',
      key: 'noValue',
    },
    {
      title: '属性名',
      dataIndex: 'nameValue',
      key: 'nameValue',
    },
    {
      title: '属性值',
      dataIndex: 'valueValue',
      key: 'valueValue',
    },
    {
      title: '操作',
      render: (item:propertyStruct) => (
        <span>
          <Button onClick={() => {
            setNameValue(item.nameValue)
            setValueValue(item.valueValue)
            setNoValue(item.noValue)
            setEditingPropertyIndex(parseInt(item.noValue,10))
            console.log("item.noValue",item.noValue)
            setEditModalVisible(true)
          }}>编辑</Button>

          <Button onClick={() => {
            console.log("表单项移除",item)
            const lt = propertyDataSource.filter((it)=>{return it.noValue !== item.noValue})
            for(let i = 0; i< lt.length; i++){
              lt[i].noValue=""+(i+1)
            }
            //console.log(lt)
            //setPropertyDataSource(lt);
            const index = parseInt(item.noValue,10) -1
            console.log("delete before: ",bpmnElementPropertyList+" : "+index+" :noValue"+item.noValue)
            let bpmnElementPropertyLis:any[] = bpmnElementPropertyList
            bpmnElementPropertyLis.splice(index, 1)
            //setElementPropertyList(elementPropertyList.splice(index, 1))
            setBpmnElementPropertyList(bpmnElementPropertyLis)

            const propertiesObject = moddle.create(`${prefix}:Properties`, {
              values: bpmnElementPropertyLis
            });
            //setOtherExtensionList(otherExtensionList.concat([propertiesObject]))
            console.log("delete after: ",bpmnElementPropertyLis.length)
            const extensions = moddle.create("bpmn:ExtensionElements", {
              values: otherExtensionList.concat([propertiesObject])
            });
            modeling.updateProperties(bpmnEle, {
              extensionElements: extensions
            });
            resetAttributesList()
          }}>删除</Button>
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
    resetAttributesList()
  },[businessObject])

  useEffect(()=>{
    let propertyQueues:any[] = []
    for(let i = 0; i < elementPropertyList.length; i++){
      const obj:propertyStruct = {
        noValue: ''+(i +1),
        nameValue:elementPropertyList[i].name,
        valueValue:elementPropertyList[i].value,
      }
      propertyQueues.push(obj)
    }
    setPropertyDataSource(propertyQueues)
  },[elementPropertyList])
  const  proProcessModal = ()=> {
    const obj:propertyStruct = {
      noValue: ''+(propertyDataSource.length +1),
      nameValue:nameValue,
      valueValue:valueValue,
    }
    setPropertyDataSource([...propertyDataSource,obj])
    const newPropertyObject = moddle.create(`${prefix}:Property`, { name:nameValue, value:valueValue });
    // 新建一个属性字段的保存列表
    let newBpmnEleList = bpmnElementPropertyList.concat([newPropertyObject])
    console.log("newBpmnEleList",newBpmnEleList.length)
    setBpmnElementPropertyList(newBpmnEleList)
    const propertiesObject = moddle.create(`${prefix}:Properties`, {
      values: bpmnElementPropertyList.concat([newPropertyObject])
    });
    setElementPropertyList(JSON.parse(JSON.stringify(newBpmnEleList)))
    setOtherExtensionList(otherExtensionList.concat([propertiesObject]))
    console.log("add Property: ",otherExtensionList.concat([propertiesObject]))
    const extensions = moddle.create("bpmn:ExtensionElements", {
      values: otherExtensionList.concat([propertiesObject])
    });
    modeling.updateProperties(bpmnEle, {
      extensionElements: extensions
    });
    resetAttributesList()
  }
  const proEditModal = () => {
    if(editingPropertyIndex === -1) return
    console.log("bpmnElementPropertyList[editingPropertyIndex-1]",bpmnElementPropertyList[editingPropertyIndex-1])
    modeling.updateModdleProperties(bpmnEle,
      bpmnElementPropertyList[editingPropertyIndex-1], {
      name:nameValue,
      value:valueValue
    });
    let lt = propertyDataSource.map(item => {
      if(item.noValue === noValue){
        return {
          noValue: noValue,
          nameValue:nameValue,
          valueValue:valueValue,
        }
      }else
        return item
    })

    //setPropertyDataSource(lt)
    resetAttributesList()
  }
  const setDebounceName = debounce((value:string)=>{
    console.log("debouce Name:",value)
    setNameValue(value)
  },1000)
  const setDebounceValue = debounce((value:string)=>{
    console.log("Value:",value)
    setValueValue(value)
  },1000)

  const  resetAttributesList = ()=> {
    const otherExtensionList:any[] = []; // 其他扩展配置
    let bpmnElementProperties =
      bpmnEle.businessObject?.extensionElements?.values?.filter(ex => {
        if (ex.$type !== `${prefix}:Properties`) {
          console.log("ex.$type",ex.$type)
          otherExtensionList.push(ex);
        }
        return ex.$type === `${prefix}:Properties`;
      })
    bpmnElementProperties=bpmnElementProperties==null?[]:bpmnElementProperties
    setOtherExtensionList(otherExtensionList)
    console.log("otherExtensionList ",otherExtensionList)
    console.log("bpmnElementProperties ",bpmnElementProperties)
    // 保存所有的 扩展属性字段
    const bpmnElementPropertyList = bpmnElementProperties.reduce((pre, current) => pre.concat(current.values), []);
    // 复制 显示
    setBpmnElementPropertyList(bpmnElementPropertyList)
    setElementPropertyList(JSON.parse(JSON.stringify(bpmnElementPropertyList ?? [])))
    console.log("ElementPropertyList ",JSON.parse(JSON.stringify(bpmnElementPropertyList)))
    console.log("bpmnElementPropertyList ",bpmnElementPropertyList)
  }
  const { Option } = Select;
  return (
    <>
      <Card >
        <Table dataSource={propertyDataSource} columns={initColumns} />
        <Button onClick={()=>{
          setAddModalVisible(true)
          setNameValue("")
          setValueValue("")
        }} style={{width:'100%',marginTop:'5px'}} type="primary">+添加属性</Button>
      </Card>

      <AntdModal
        title={"属性配置"}
        visible={addModalVisible}
        onOk={()=>{
          if( nameValue === null ||nameValue ==="" || nameValue === undefined) {
            message.error("属性名不能为空")
            return
          }
          if( valueValue === null ||valueValue ==="" || valueValue === undefined) {
            message.error("属性值不能为空")
            return
          }
          proProcessModal()
          setAddModalVisible(false)
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
        <Row justify="end" align="middle">
          <Col span={6}><span>属性名</span></Col>
          <Col span={18}>
            <Input value={nameValue} onChange={(event)=>{setNameValue(event.target.value)}}/>
          </Col>
        </Row>
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>属性值</span></Col>
          <Col span={18}>
            <Input value={valueValue} onChange={(event)=>{setValueValue(event.target.value)}}/>
          </Col>
        </Row>
      </AntdModal>

      <AntdModal
        title={"字段修改"}
        visible={editModalVisible}
        onOk={()=>{
          //proEditModal()
          if( nameValue === null ||nameValue ==="" || nameValue === undefined) {
            message.error("属性名不能为空")
            return
          }
          if( valueValue === null ||valueValue ==="" || valueValue === undefined) {
            message.error("属性值不能为空")
            return
          }
          proEditModal()
          setEditModalVisible(false)
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
        <Row justify="end" align="middle">
          <Col span={6}><span>属性名</span></Col>
          <Col span={18}>
            <Input value={nameValue} onChange={(event)=>{setNameValue(event.target.value)}}/>
          </Col>
        </Row>
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>属性值</span></Col>
          <Col span={18}>
            <Input value={valueValue} onChange={(event)=>{setValueValue(event.target.value)}}/>
          </Col>
        </Row>
      </AntdModal>
    </>
  )
}

export default Properties
