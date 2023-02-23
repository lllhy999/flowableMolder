import {useEffect, useState, useRef, useContext} from 'react'
import {FormInstance, message, Card, Modal as AntdModal, Table, Button, Collapse, Form, Input,Switch,Select,Row,Col} from 'antd'
import {useModel,useRequest} from "@umijs/max";

import { InfoCircleFilled,MessageFilled,NotificationFilled,PlusCircleFilled,SettingOutlined,LeftOutlined, PlusCircleOutlined,
  AppstoreOutlined} from '@ant-design/icons';
import debounce from "lodash.debounce"
import BpmnModeler from "bpmn-js/lib/Modeler";
import ModdleElement from "bpmn-js/lib/Modeler"
import React from "react";
import {v4 as uuid} from "uuid";
import  "./Penal.less"
import PropertiesPenalContext from "../propertiesPenalContext"
interface addStruct  {
  noValue: string,
  propertyId: string,
  nameValue: string,
  typeValue: string,
  defaultValue: string,
  datePattern: string,
}
interface constraintStruct  {
  constraintNo: string,
  constraintName: string,
  constraintConfig: string,
}
interface propertyStruct  {
  propertyNo: string,
  propertyNumber: string,
  propertyValue: string,
}
interface enumStruct  {
  enumNo: string,
  enumNumber: string,
  enumName: string,
}
interface formFieldForm  {
  id: string,
  typeType: string,
  type: string,
  label: string,
  datePattern: string,
  defaultValue: string,
}
interface formDataStruct {
  $type:string,
  fields:any[]
}
const fieldType= {
    long: "长整型",
    string: "字符串",
    boolean: "布尔类",
    date: "日期类",
    enum: "枚举类",
    custom: "自定义类型"
}

const ElementForm = () => {
  const {prefix,modeler,moddle,modeling,businessObject,bpmnEle} = useContext(PropertiesPenalContext)
  const {initialState} = useModel('@@initialState')
  //消息信号
  const [formDataSource,setFormDataSource] = useState<addStruct[]>([])
  const [constraintDataSource, setConstraintDataSource] = useState<constraintStruct[]>([])
  const [propertyDataSource, setPropertyDataSource] = useState<propertyStruct[]>([])
  const [enumDataSource,setEnumDataSource] = useState<enumStruct[]>([])
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [propertyModalVisible, setPropertyModalVisible] = useState(false)
  const [secModalVisible, setSecModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editEnumVisible, setEditEnumVisible] = useState(false)
  const [addEnumVisible, setAddEnumVisible] = useState(false)
  const [editOrDelete,setEditOrDelete] = useState("edit")
  const [modalTitle, setModalTitle] = useState("约束")
  const [formIdentify, setFormIdentify] = useState("")
  const [businessIdentify, setBusinessIdentify] = useState("")
  const [noValue, setNoValue] = useState("")
  const [propertyId, setPropertyId] = useState("")
  const [nameValue, setNameValue] = useState("")
  const [typeValue, setTypeValue] = useState("string")
  const [datePattern, setDatePattern] = useState("")
  const [defaultValue, setDefaultValue] = useState("")
  const [constraintNo,setConstraintNo] = useState("")
  const [constraintName,setConstraintName] = useState("")
  const [constraintConfig,setConstraintConfig] = useState("")
  const [propertyNo,setPropertyNo] = useState("")
  const [propertyNumber,setPropertyNumber] = useState("")
  const [propertyValue,setPropertyValue] = useState("")
  const [enumNo,setEnumNo] = useState("")
  const [enumNumber,setEnumNumber] = useState("")
  const [enumName,setEnumName] = useState("")
  const [property0,setProperty0] = useState("")
  const [formKey, setFormKey] = useState("")
  const [businessKey, setBusinessKey] = useState("")
  const [formData, setFormData] = useState<formDataStruct>()
  const [fields, setFields] = useState<any[]>([])
  const [typeName, setTypeName] = useState("")
  const [fieldEnumList,setFieldEnumList] = useState<any[]>([]) // 枚举值列表
  const [fieldConstraintsList, setFieldConstraintsList] = useState<any[]>([])  // 约束条件列表
  const [fieldPropertiesList, setFieldPropertiesList] = useState<any[]>([]) // 绑定属性列表
  const [fieldList, setFieldList] = useState<any[]>([])
  const [otherExtensions, setOtherExtensions] = useState<any[]>([])
  const [item0,setItem0] = useState("")
  const [item1,setItem1] = useState("")
  const [item2,setItem2] = useState("")
  //const [prefix, setPrefix] = useState("flowable")
  //条件流转
  const phone = initialState?.currentUser?.phone
  const token = initialState?.currentUser?.token
  const [form] = Form.useForm()
  const [addForm] = Form.useForm()
  const FieldsRef = useRef<any[]>()
  const initColumns =[
    {
      title: '序号',
      dataIndex: 'noValue',
      key: 'noValue',
    },
    {
      title: '名称',
      dataIndex: 'nameValue',
      key: 'nameValue',
    },
    {
      title: '类型',
      dataIndex: 'typeValue',
      key: 'typeValue',
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
    },
    {
      title: '操作',
      render: (item:addStruct) => (
        <span>
          <Button onClick={() => {
            setNoValue(item.noValue)
            setNameValue(item.nameValue)
            setTypeValue(item.typeValue)
            setDefaultValue(item.defaultValue)
            setDatePattern(item.datePattern)
            setPropertyId(item.propertyId)
            setPropertyModalVisible(true)
            setProperty0(item.noValue)
            // console.log("defaultValue datePattern",defaultValue," : ",datePattern)
            const index = parseInt(item.noValue)-1
            getThreeArrays(index)
          }}>编辑</Button>
          <Button onClick={() => {
            //console.log("表单项移除",item)
            const lt = formDataSource.filter((it)=>{return it.noValue !== item.noValue})
            for(let i = 0; i< lt.length; i++){
              lt[i].noValue=""+(i+1)
            }
            //console.log(lt)
            setFormDataSource(lt);
            removeField("",parseInt(item.noValue)-1)
          }}>删除</Button>
          </span>
      )
    }
  ]
  const initConstraintColumns =[
    {
      title: '序号',
      dataIndex: 'constraintNo',
      key: 'constraintNo',
    },
    {
      title: '约束名称',
      dataIndex: 'constraintName',
      key: 'constraintName',
    },
    {
      title: '约束配置',
      dataIndex: 'constraintConfig',
      key: 'constraintConfig',
    },
    {
      title: '操作',
      render: (item:constraintStruct) => (
        <span>
          <Button onClick={() => {
            setModalTitle("约束")
            setEditModalVisible(true)
            setConstraintNo(item.constraintNo)
            setConstraintName(item.constraintName)
            setConstraintConfig(item.constraintConfig)
            setItem0(item.constraintNo)
            setItem1(item.constraintName)
            setItem2(item.constraintConfig)
            //console.log("约束编辑",item)
          }}>编辑</Button>
          <Button onClick={() => {
            //console.log("约束移除",item)
            const lt = constraintDataSource.filter((it)=>{return it.constraintNo !== item.constraintNo})
            for(let i = 0; i< lt.length; i++){
              lt[i].constraintNo=""+(i+1)
            }
            //console.log(lt)
            setConstraintDataSource(lt);
            removeFieldOptionItem("", parseInt(item.constraintNo)-1, 'constraint')
          }}>移除</Button>
          </span>
      )
    }
  ]
  const initEnumColumns =[
    {
      title: '序号',
      dataIndex: 'enumNo',
      key: 'enumNo',
    },
    {
      title: '枚举编号',
      dataIndex: 'enumNumber',
      key: 'enumNumber',
    },
    {
      title: '枚举名称',
      dataIndex: 'enumName',
      key: 'enumName',
    },
    {
      title: '操作',
      render: (item:enumStruct) => (
        <span>
          <Button onClick={() => {
            //setModalTitle("")
            setEditEnumVisible(true)
            setEnumNo(item.enumNo)
            setEnumNumber(item.enumNumber)
            setEnumName(item.enumName)
            //console.log("Enum编辑",item)
          }}>编辑</Button>
          <Button onClick={() => {
            const lt = enumDataSource.filter((it)=>{return it.enumNo !== item.enumNo})
            for(let i = 0; i< lt.length; i++){
              lt[i].enumNo=""+(i+1)
            }
            //console.log(lt)
            setEnumDataSource(lt);
            removeFieldOptionItem("", parseInt(item.enumNo)-1, 'enum')
            //console.log("属性移除",item)
          }}>移除</Button>
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
      title: '属性编号',
      dataIndex: 'propertyNumber',
      key: 'propertyNumber',
    },
    {
      title: '属性值',
      dataIndex: 'propertyValue',
      key: 'propertyValue',
    },
    {
      title: '操作',
      render: (item:propertyStruct) => (
        <span>
          <Button onClick={() => {
            setModalTitle("属性")
            setEditModalVisible(true)
            setPropertyNo(item.propertyNo)
            setPropertyNumber(item.propertyNumber)
            setPropertyValue(item.propertyValue)
            setItem0(item.propertyNo)
            setItem1(item.propertyNumber)
            setItem2(item.propertyValue)
            // console.log("属性编辑",item)
          }}>编辑</Button>
          <Button onClick={() => {
            const lt = propertyDataSource.filter((it)=>{return it.propertyNo !== item.propertyNo})
            for(let i = 0; i< lt.length; i++){
              lt[i].propertyNo=""+(i+1)
            }
            //console.log(lt)
            setPropertyDataSource(lt);
            removeFieldOptionItem("", parseInt(item.propertyNo)-1, 'property')
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
    //console.log("inside processPenal: ",businessObject)
    const elementBaseInfo = businessObject!=null?JSON.parse(JSON.stringify(businessObject)):null;
    //console.log("elementBaseInfo: "+elementBaseInfo?.id+":"+elementBaseInfo?.name)
    resetFormList()
  },[businessObject])

  const getThreeArrays = (index:number)=>{
    const propertyDataSrc:propertyStruct[] = formData?.fields[index]?.properties?.values?.map((item,index)=>{
      const propertySingle:propertyStruct = {
        propertyNo:index +1,
        propertyNumber:item.id,
        propertyValue:item.value,
      }
      return propertySingle
    })
    setFieldPropertiesList( formData?.fields[index]?.properties?.values)
    setPropertyDataSource(propertyDataSrc)
    const constraintDataSrc:constraintStruct[] = formData?.fields[index]?.validation?.constraints?.map((item,index)=>{
      const constraintSingle:constraintStruct = {
        constraintNo:index+1,
        constraintName:item.name,
        constraintConfig:item.config,
      }
      return constraintSingle
    })
    //console.log("formData?.fields:",formData?.fields)
    //console.log("propertyDataSrc:",propertyDataSrc," ",index)
    //console.log("constraintDataSrc:",constraintDataSrc," ",index)
    setFieldConstraintsList(formData?.fields[index]?.validation?.constraints)
    setConstraintDataSource(constraintDataSrc)
    if(formData?.fields[index]?.type ==="enum"){
        const enumDataSrc:enumStruct[] = formData?.fields[index]?.values?.map((item,index)=>{
          const enumDataSingle:enumStruct = {
            enumNo: index+1,
            enumName: item.id,
            enumNumber: item.name,
          }
          return enumDataSingle
        })
        setFieldEnumList(formData?.fields[index]?.values)
        setEnumDataSource(enumDataSrc)
    }

    /*const fields = FieldsRef.current
    if(fields === null ||fields=== undefined){
      return
    }
    if(fields[index].type ==="enum"){
      if(fields[index].values !==null && fields[index].values !==undefined){
        const enumDataSrc:enumStruct[] = []
        for(let i = 0; i<fields[index].values.length;i++){
          const obj:enumStruct = {
            enumNo:""+(i+1),
            enumNumber:fields[index].values[i].id,
            enumName:fields[index].values[i].name,
          }
          enumDataSrc.push(obj)
        }
        setEnumDataSource(enumDataSrc)
      }
    }
    if(fields[index].properties !==null && fields[index].properties !==undefined){
      if(fields[index].properties.values !==null && fields[index].properties.values !==undefined){
        const propertyDataSrc:propertyStruct[] = []
        for(let i = 0;i < fields[index].properties.values.length; i++){
          const obj:propertyStruct = {
            propertyNo:""+(i+1),
            propertyNumber:fields[index].properties.values[i].id,
            propertyValue:fields[index].properties.values[i].value,
          }
          propertyDataSrc.push(obj)
        }
        setPropertyDataSource(propertyDataSrc)
      }
    }
    if(fields[index].validation !==null && fields[index].validation !==undefined){
      if(fields[index].validation.constraints !==null && fields[index].validation.constraints !==undefined){
        const constraintDataSrc:constraintStruct[] = []
        for(let i = 0;i < fields[index].validation.constraints.length; i++){
          const obj:constraintStruct = {
            constraintNo:""+(i+1),
            constraintName:fields[index].validation.constraints[i].name,
            constraintConfig:fields[index].validation.constraints[i].config,
          }
          constraintDataSrc.push(obj)
        }
        setConstraintDataSource(constraintDataSrc)
      }
    }*/
  }
  const  proProcessModal = ()=> {

    const obj:addStruct = {
      noValue: ''+(formDataSource.length +1),
      nameValue:nameValue,
      typeValue:typeValue,
      defaultValue:defaultValue,
      datePattern:datePattern,
      propertyId
    }
    setFormDataSource([...formDataSource,obj])
    saveField(true)
  }
  const setDebounceName = debounce((value:string)=>{
    //console.log("debouce Name:",value)
    setNameValue(value)
  },1000)
  const setDebounceType = debounce((value:string)=>{
    //console.log("debouce Name:",value)
    setTypeValue(value)
  },1000)
  const setDebounceDefaultValue = debounce((value:string)=>{
    //console.log("debouce Name:",value)
    setDefaultValue(value)
  },1000)
  const setDebouncePropertyId = debounce((value:string)=>{
    //console.log("PropertyId:",value)
    setPropertyId(value)
  },1000)

  const setDebounceFormKey = debounce((value:string)=>{
    //console.log("debouce Name:",value)
    setFormKey(value)
    updateElementFormKey(value)
  },1000)

  const updateElementFormKey =(value:string)=> {
    modeling.updateProperties(bpmnEle, { formKey: value });
  }
  const updateElementBusinessKey =(value:string)=> {
    modeling.updateModdleProperties(bpmnEle, formData, {
      businessKey: value
    });
  }
  const updateElementExtensions = ()=> {
    // 更新回扩展元素
    //console.log("formData: ",formData)
    const newElExtensionElements = moddle.create(`bpmn:ExtensionElements`, {
      values: otherExtensions.concat(formData)
    });
    // 更新到元素上
    modeling.updateProperties(bpmnEle, {
      extensionElements: newElExtensionElements
    });
  }
  const removeField = (field:any, index:number)=> {
    let filedArr = formData?.fields
    //console.log("filedArr: ",filedArr)
    filedArr?.splice(index, 1)
    setFields(filedArr)
    FieldsRef.current = filedArr
  //updateElementExtensions();
  //console.log(" update extensionElements: ", FieldsRef.current)
  Object.assign(formData!.fields,FieldsRef.current)
  setFormData(formData)
  const newElExtensionElements = moddle.create(`bpmn:ExtensionElements`, {
    values: otherExtensions.concat(formData)//(FieldsRef.current)
  });
  // 更新到元素上
  modeling.updateProperties(bpmnEle, {
    extensionElements: newElExtensionElements
  });
  }
  const removeFieldOptionItem = (option:any, index:number, type:string)=> {
    if (type === "property") {
      const fieldPropertiesList1 = fieldPropertiesList
      fieldPropertiesList1.splice(index, 1);
      setFieldPropertiesList(fieldPropertiesList1)
      return;
    }
    if (type === "enum") {
      const fieldEnumList1 = fieldEnumList
      fieldEnumList1.splice(index, 1);
      setFieldEnumList(fieldEnumList1)
      return;
    }
    const fieldConstraintsList1=fieldConstraintsList
    fieldConstraintsList1.splice(index, 1);
    setFieldConstraintsList(fieldConstraintsList1)
  }
  const changeFieldTypeType = (type:string)=> {
    /*if(type === "custom"){
      formFieldForm.type = ""
    }else  formFieldForm.type = type*/
  }
  const resetFormList = ()=> {
    const formKey = bpmnEle.businessObject.formKey;
    setFormKey(formKey)
    // 获取元素扩展属性 或者 创建扩展属性
    const elExtensionElements =
      bpmnEle.businessObject.get("extensionElements")
      || moddle.create("bpmn:ExtensionElements", { values: [] });
    // 获取元素表单配置 或者 创建新的表单配置
    const formData =
      elExtensionElements.values.filter(ex => ex.$type === `${prefix}:FormData`)?.[0] ||
      moddle.create(`${prefix}:FormData`, { fields: [] });
    //console.log("formData: ",formData)
    setFormData(formData)
    // 业务标识 businessKey， 绑定在 formData 中
    const businessKey = formData.businessKey;
    setBusinessKey(businessKey)
    const formDataSrc:addStruct[] = formData?.fields?.map((item,index)=>{
      const dataSingle:addStruct = {
        noValue: index +1,
        propertyId: item.id,
        typeValue: item.type,
        nameValue: item.label,
        defaultValue: item.defaultValue,
        datePattern: item.datePattern,
      }
      return dataSingle
    })
    setFormDataSource(formDataSrc)
    // 保留剩余扩展元素，便于后面更新该元素对应属性
    const otherExtensions = elExtensionElements.values.filter(ex => ex.$type !== `${prefix}:FormData`);
    setOtherExtensions(otherExtensions)
    //console.log("otherExtensions",otherExtensions)
    // 复制原始值，填充表格
    const fieldList = JSON.parse(JSON.stringify(formData?.fields || []));
    setFieldList(fieldList)
    // 更新元素扩展属性，避免后续报错
    const newElExtensionElements = moddle.create(`bpmn:ExtensionElements`, {
      values: otherExtensions.concat(formData)
    });
    // 更新到元素上
    modeling.updateProperties(bpmnEle, {
      extensionElements: newElExtensionElements
    });
    //updateElementExtensions();
  }
  const saveField = (isAddForm:boolean)=> {
    //console.log("save")
    //const { id, type, label, defaultValue, datePattern } = formFieldForm;
    const formField:formFieldForm = {
      id:propertyId,
      typeType:typeValue,
      label:nameValue,
      defaultValue:defaultValue,
      type: typeValue,
      datePattern:datePattern
    }
    const Field = moddle.create(`${prefix}:FormField`, { id:formField.id, type:formField.typeType, label:formField.label });
    formField.defaultValue && (Field.defaultValue = defaultValue);
    formField.datePattern && (Field.datePattern = datePattern);
    // 构建属性
    //console.log("fieldPropertiesList:",fieldPropertiesList)
    if (fieldPropertiesList && fieldPropertiesList.length) {
      const fieldPropertyList = fieldPropertiesList.map(fp => {
        return moddle.create(`${prefix}:Property`, { id: fp.id, value: fp.value });
      });
      Field.properties = moddle.create(`${prefix}:Properties`, {
        values: fieldPropertyList
      });
    }
    //console.log("fieldPropertiesList created :",Field.properties)
    // 构建校验规则
    if (fieldConstraintsList && fieldConstraintsList.length) {
      const fieldConstraintList = fieldConstraintsList.map(fc => {
        return moddle.create(`${prefix}:Constraint`, { name: fc.name, config: fc.config });
      });
      Field.validation = moddle.create(`${prefix}:Validation`, {
        constraints: fieldConstraintList
      });
    }
    // 构建枚举值
    if (fieldEnumList && fieldEnumList.length) {
      Field.values = fieldEnumList.map(fe => {
        return moddle.create(`${prefix}:Value`, { name: fe.name, id: fe.id });
      });
    }
    //console.log("fieldPropertiesList created :",Field)
    // 更新数组 与 表单配置实例

    //console.log("Field:",Field)
    const fieldLi = fieldList
    let fies = fields
    if (isAddForm === true) {
      fieldLi.push(formField);
      setFieldList(fieldLi)
      fies.push(Field)
      setFields(fies)
      FieldsRef.current = fies
      //setFormData(formData.fields.push(Field));
    } else {
      /*const index = parseInt(noValue) - 1
      console.log("fies: ",fies," index: ",index)
      fieldLi.splice(index, 1, formField);
      fies.splice(index, 1, Field);
      console.log("Fields splice :",fies)
      setFields(fies)
      FieldsRef.current = fies
      setFieldList(fieldLi)*/
     // setFormData(formData);
      //fies.push(Field)
      const index = parseInt(noValue) - 1
      let filedArr = formData?.fields
      //console.log("filedArr: ",filedArr)
      filedArr?.splice(index, 1, Field)
      setFields(fies)
      FieldsRef.current = filedArr
    }
    //updateElementExtensions();
    //console.log(" update extensionElements: ", FieldsRef.current)
    Object.assign(formData!.fields,FieldsRef.current)
    setFormData(formData)
    const newElExtensionElements = moddle.create(`bpmn:ExtensionElements`, {
      values: otherExtensions.concat(formData)//(FieldsRef.current)
    });
    // 更新到元素上
    modeling.updateProperties(bpmnEle, {
      extensionElements: newElExtensionElements
    });
    //fieldModelVisible = false;
  }
  const { Option } = Select;
  return (
    <>
      <Card >
        <Row justify="end" align="middle">
          <Col span={6}><span>表单标识</span></Col>
          <Col span={18}>
            <Input value={formKey} onChange={(event)=>setDebounceFormKey(event.target.value)}
            >
            </Input>
          </Col>
        </Row>
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>业务标识</span></Col>
          <Col span={18}>
            <Select
              labelInValue
              defaultValue={{ value: '1', label: '' }}
              value={{ value: businessKey }}
              style={{ width: '100%' }}
              onChange={(value: { value: string; label: React.ReactNode })=>{
                setBusinessKey(value.value)
                updateElementBusinessKey(value.value)
              }}
            >
              { !!formDataSource && formDataSource.map(item => {
                  return <Option value={item.nameValue}>{item.nameValue}</Option>
                })
              }
            </Select>
          </Col>
        </Row>
        <Table pagination={false}  dataSource={formDataSource} columns={initColumns} />
        <Button onClick={()=>{
          setAddModalVisible(true)
          setPropertyId("")
          setNameValue("")
          setDefaultValue("")
          setDatePattern("")
          setTypeValue("")
          setConstraintDataSource([])
          setPropertyDataSource([])
          setEnumDataSource([])
          setFieldPropertiesList([])
          setFieldConstraintsList([])
          setFieldEnumList([])
          setPropertyId("PropertyID_"+uuid().slice(0,7))
        }} style={{width:'100%',marginTop:'5px'}} type="primary">+添加字段</Button>
      </Card>

      <AntdModal
        title={"字段配置"}
        visible={addModalVisible}
        onOk={()=>{
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
          <Col span={6}><span>字段ID</span></Col>
          <Col span={18}>
            <Input value={propertyId} onChange={(event)=>{setPropertyId(event.target.value)}}/>
          </Col>
        </Row>
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>类型</span></Col>
          <Col span={18}>
            <Select
              labelInValue
              defaultValue={{ value: typeValue }}
              value={{ value: typeValue,label:typeValue }}
              style={{ width: '100%' }}
              onChange={(value: { value: string; label: React.ReactNode })=>{setTypeValue(value.value)}}
            >
              <Option value="long">长整型</Option>
              <Option value="string">字符串</Option>
              <Option value="boolean">布尔类</Option>
              <Option value="date">日期类</Option>
              <Option value="enum">枚举类</Option>
              <Option value="custom">自定义类型</Option>
            </Select>
          </Col>
        </Row>
        {typeValue === "custom" ?
          <Row style={{marginTop: "10px"}} justify="end" align="middle">
            <Col span={6}><span>类型名称</span></Col>
            <Col span={18}>
              <Input value={typeName} onChange={(event) => {
                setTypeName(event.target.value)
              }}/>
            </Col>
          </Row> : null
        }
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>名称</span></Col>
          <Col span={18}>
            <Input value={nameValue} onChange={(event)=>{setNameValue(event.target.value)}}/>
          </Col>
        </Row>
        {typeValue === "date" ?
          <Row style={{marginTop: "10px"}} justify="end" align="middle">
            <Col span={6}><span>时间格式</span></Col>
            <Col span={18}>
              <Input value={datePattern} onChange={(event) => {
                setDatePattern(event.target.value)
              }}/>
            </Col>
          </Row> : null
        }
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>默认值</span></Col>
          <Col span={18}>
            <Input value={defaultValue} onChange={(event)=>{setDefaultValue(event.target.value)}}/>
          </Col>
        </Row>
        { typeValue === "enum"?
          <Card style={{marginTop: "10px"}}
                title={<span style={{fontSize: "14px"}}><AppstoreOutlined/>&nbsp;枚举值列表</span>}
                extra={<Button onClick={() => {
                  setAddEnumVisible(true);
                }}
                               size="small" type="primary">添加枚举值</Button>}>
            <Table pagination={false} dataSource={enumDataSource} columns={initEnumColumns}/>
          </Card>:null
        }
        <Card style={{marginTop:"10px"}} title={<span style={{fontSize: "14px"}}><AppstoreOutlined/>&nbsp;约束条件列表</span>}
              extra={<Button onClick={()=>{setSecModalVisible(true);setModalTitle("约束");addForm.resetFields();}}
                             size="small" type="primary">添加约束</Button>} >
          <Table pagination={false} dataSource={constraintDataSource} columns={initConstraintColumns} />
        </Card>
        <Card title={<span style={{fontSize: "14px"}}><AppstoreOutlined/>&nbsp;字段属性列表</span>}
              extra={<Button onClick={()=>{setSecModalVisible(true);setModalTitle("属性");
              addForm.resetFields();}}
                             size="small" type="primary">添加字段属性</Button>} >
          <Table pagination={false} dataSource={propertyDataSource} columns={initPropertyColumns} />
        </Card>
      </AntdModal>

      <AntdModal
        title={"字段修改"}
        visible={propertyModalVisible}
        onOk={()=>{
          //proProcessModal()
          let lt = formDataSource.map(item => {
            if(item.noValue === noValue){
              return {
                noValue: noValue,
                propertyId,
                nameValue:nameValue,
                typeValue:typeValue,
                defaultValue: defaultValue,
                datePattern
              }
            }else
              return item
          })
          saveField(false)
          setFormDataSource(lt)
          setEditModalVisible(false)
          setPropertyModalVisible(false)
        }}
        onCancel={()=>{
          // hideModal()
          setPropertyModalVisible(false)
        }}
        maskClosable={false}
        forceRender
        closable={true}
        centered={false}
        style={{top:10,right:50}}
      >
        <Row justify="end" align="middle">
          <Col span={6}><span>字段ID</span></Col>
          <Col span={18}>
            <Input value={propertyId} onChange={(event)=>{setPropertyId(event.target.value)}}/>
          </Col>
        </Row>
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>类型</span></Col>
          <Col span={18}>
            <Select
              labelInValue
              defaultValue={{ value: typeValue }}
              value={{ value: typeValue,label:typeValue }}
              style={{ width: '100%' }}
              onChange={(value: { value: string; label: React.ReactNode })=>{setTypeValue(value.value)}}
            >
              <Option value="long">长整型</Option>
              <Option value="string">字符串</Option>
              <Option value="boolean">布尔类</Option>
              <Option value="date">日期类</Option>
              <Option value="enum">枚举类</Option>
              <Option value="custom">自定义类型</Option>
            </Select>
          </Col>
        </Row>
        {typeValue === "custom" ?
          <Row style={{marginTop: "10px"}} justify="end" align="middle">
            <Col span={6}><span>类型名称</span></Col>
            <Col span={18}>
              <Input value={typeName} onChange={(event) => {
                setTypeName(event.target.value)
              }}/>
            </Col>
          </Row> : null
        }
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>名称</span></Col>
          <Col span={18}>
            <Input value={nameValue} onChange={(event)=>{setNameValue(event.target.value)}}/>
          </Col>
        </Row>
        {typeValue === "date" ?
          <Row style={{marginTop: "10px"}} justify="end" align="middle">
            <Col span={6}><span>时间格式</span></Col>
            <Col span={18}>
              <Input value={datePattern} onChange={(event) => {
                setDatePattern(event.target.value)
              }}/>
            </Col>
          </Row> : null
        }
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>默认值</span></Col>
          <Col span={18}>
            <Input value={defaultValue} onChange={(event)=>{setDefaultValue(event.target.value)}}/>
          </Col>
        </Row>
        { typeValue === "enum"?
          <Card style={{marginTop: "10px"}}
                title={<span style={{fontSize: "14px"}}><AppstoreOutlined/>&nbsp;枚举值列表</span>}
                extra={<Button onClick={() => {
                  setAddEnumVisible(true);
                }}
                               size="small" type="primary">添加枚举值</Button>}>
            <Table pagination={false} dataSource={enumDataSource} columns={initEnumColumns}/>
          </Card>:null
        }
        <Card style={{marginTop:"10px"}} title={<span style={{fontSize: "14px"}}><AppstoreOutlined/>&nbsp;约束条件列表</span>}
              extra={<Button onClick={()=>{
                setModalTitle("约束");
                setConstraintName("")
                setConstraintConfig("")
                setSecModalVisible(true);
              addForm.resetFields();}}
                             size="small" type="primary">添加约束</Button>} >
          <Table dataSource={constraintDataSource} columns={initConstraintColumns} />
        </Card>
        <Card title={<span style={{fontSize: "14px"}}><AppstoreOutlined/>&nbsp;字段属性列表</span>}
              extra={<Button onClick={()=>{
                setModalTitle("属性");
                setPropertyNumber("")
                setPropertyValue("")
                setSecModalVisible(true);
              addForm.resetFields();}}
                             size="small" type="primary">添加属性</Button>} >
          <Table dataSource={propertyDataSource} columns={initPropertyColumns} />
        </Card>
      </AntdModal>

      <AntdModal
        title={modalTitle+"配置"}
        visible={secModalVisible}
        onOk={()=>{
          // addProcessModal()
          if(modalTitle==="约束"){
            setConstraintDataSource(
              [...constraintDataSource,
                {
                  constraintNo: ""+(constraintDataSource.length+1),
                  constraintName,
                  constraintConfig,
                }
              ]
            )
            const obj = {
              name:constraintName,
              config:constraintConfig
            }
            setFieldConstraintsList([...fieldConstraintsList,obj])
          }else{
            setPropertyDataSource(
              [...propertyDataSource,
                {
                  propertyNo: ""+(propertyDataSource.length+1),
                  propertyNumber: propertyNumber,
                  propertyValue: propertyValue,
                }
              ]
            )
            const obj = {
              id:propertyNumber,
              value:propertyValue
            }
            setFieldPropertiesList([...fieldPropertiesList,obj])
          }
          setConstraintName("")
          setConstraintConfig("")
          setPropertyValue("")
          setPropertyNumber("")
          setItem2("")
          setItem1("")
          setSecModalVisible(false)
        }}
        onCancel={()=>{
          // hideModal()
          setItem2("")
          setItem1("")
          setConstraintName("")
          setConstraintConfig("")
          setPropertyValue("")
          setPropertyNumber("")
          setSecModalVisible(false)
        }}
        maskClosable={false}
        forceRender
        closable={true}
        centered={false}
        style={{top:10,right:50}}
      >
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>{modalTitle==="约束"?"名称":"编号/ID"}</span></Col>
          <Col span={18}>
            <Input value={modalTitle==="约束"?constraintName:propertyNumber} onChange={(event)=>{
              modalTitle==="约束"?
                setConstraintName(event.target.value):
                setPropertyNumber(event.target.value)
             // setItem1(event.target.value)
            }}/>
          </Col>
        </Row>
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>{modalTitle==="约束"?"配置":"值"}</span></Col>
          <Col span={18}>
            <Input value={ modalTitle==="约束"?constraintConfig:propertyValue} onChange={(event)=>{
              modalTitle==="约束"?
                setConstraintConfig(event.target.value):
                setPropertyValue(event.target.value)
              //setItem2(event.target.value)
            }}/>
          </Col>
        </Row>
      </AntdModal>
      <AntdModal
        title={modalTitle+"编辑"}
        visible={editModalVisible}
        onOk={()=>{
          // addProcessModal()
          if(modalTitle==="约束"){
            let lt = constraintDataSource.map(item => {
              if(item.constraintNo === constraintNo){
                return {
                  constraintNo: constraintNo,
                  constraintName:constraintName,
                  constraintConfig:constraintConfig,
                }
              }else
                return item
            })
            let fieldLt = fieldConstraintsList.map((item,index)=>{
              if(index ===(parseInt(constraintNo)-1)){
                //console.log("index ===(parseInt(constraintNo)-1)",constraintName," ",constraintConfig)
                return {
                  name:constraintName,
                  config:constraintConfig
                }
              }else
                return item
            })
            setConstraintDataSource(lt)
            setFieldConstraintsList(fieldLt)
            setConstraintName("")
            setConstraintConfig("")
            setEditModalVisible(false)
            //console.log("find Index: "+index)
          }else{
            let lt = propertyDataSource.map(item => {
              if(item.propertyNo === propertyNo){
                return {
                  propertyNo,
                  propertyNumber,
                  propertyValue,
                }
              }else
                return item
            })
            let propertiesList = fieldPropertiesList.map((item,index)=>{
              if(index ===(parseInt(propertyNo)-1)){
                //console.log("index ===(parseInt(propertyNo)-1)",propertyNumber," ",propertyValue)
                return {
                  id:propertyNumber,
                  value:propertyValue
                }
              }else
                return item
            })
            // console.log("lt: ", lt)
            // console.log("propertiesList: ",propertiesList)
            setPropertyDataSource(lt)
            setFieldPropertiesList(propertiesList)
            setPropertyNumber("")
            setPropertyValue("")
            setEditModalVisible(false)
          }
          saveField(false)
          setItem2("")
          setItem1("")
        }}
        onCancel={()=>{
          // hideModal()
          setItem2("")
          setItem1("")
          setEditModalVisible(false)
        }}
        maskClosable={false}
        forceRender
        closable={true}
        centered={false}
        style={{top:10,right:50}}
      >
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>{modalTitle==="约束"?"名称":"编号/ID"}</span></Col>
          <Col span={18}>
            <Input value={modalTitle==="约束"?constraintName:propertyNumber} onChange={(event)=>{
              modalTitle==="约束"?
                setConstraintName(event.target.value):
                setPropertyNumber(event.target.value)
              // setItem1(event.target.value)
            }}/>
          </Col>
        </Row>
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>{modalTitle==="约束"?"配置":"值"}</span></Col>
          <Col span={18}>
            <Input value={ modalTitle==="约束"?constraintConfig:propertyValue} onChange={(event)=>{
              modalTitle==="约束"?
                setConstraintConfig(event.target.value):
                setPropertyValue(event.target.value)
              //setItem2(event.target.value)
            }}/>
          </Col>
        </Row>
      </AntdModal>

      <AntdModal
        title={"枚举值添加"}
        visible={addEnumVisible}
        onOk={()=>{
          // addProcessModal()
          const obj:enumStruct = {
            enumNo:""+(enumDataSource.length+1),
            enumNumber,
            enumName,
          }
          setEnumDataSource([...enumDataSource,obj])
          setEnumNo("")
          setEnumName("")
          setEnumNumber("")
          setAddEnumVisible(false)
          const obj1 = {
            id:enumNumber,
            name:enumName
          }
          setFieldEnumList([...fieldEnumList,obj1])
          //console.log("find Index: "+index)
        }}
        onCancel={()=>{
          // hideModal()
          setAddEnumVisible(false)
        }}
        maskClosable={false}
        forceRender
        closable={true}
        centered={false}
        style={{top:10,right:50}}
      >
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>{"编号/ID"}</span></Col>
          <Col span={18}>
            <Input value={enumNumber} onChange={(event)=>{
              setEnumNumber(event.target.value)
              // setItem1(event.target.value)
            }}/>
          </Col>
        </Row>
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>{"名称"}</span></Col>
          <Col span={18}>
            <Input value={enumName} onChange={(event)=>{
              setEnumName(event.target.value)
              //setItem2(event.target.value)
            }}/>
          </Col>
        </Row>
      </AntdModal>
      <AntdModal
        title={"枚举值编辑"}
        visible={editEnumVisible}
        onOk={()=>{
          // addProcessModal()
            let lt = enumDataSource.map(item => {
              if(item.enumNo === enumNo){
                return {
                  enumNo,
                  enumNumber,
                  enumName,
                }
              }else
                return item
            })
          let enumList = fieldEnumList.map((item,index)=>{
            if(index ===(parseInt(enumNo)-1)){
              // console.log("index ===(parseInt(enumNo)-1)",enumNumber," ",enumName)
              return {
                id:enumNumber,
                name:enumName
              }
            }else
              return item
          })
            setEnumDataSource(lt)
            setFieldEnumList(enumList)
            setEnumNo("")
            setEnumName("")
            setEnumNumber("")
            setEditEnumVisible(false)
            //console.log("find Index: "+index)
        }}
        onCancel={()=>{
          // hideModal()
          setEditEnumVisible(false)
        }}
        maskClosable={false}
        forceRender
        closable={true}
        centered={false}
        style={{top:10,right:50}}
      >
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>{"编号/ID"}</span></Col>
          <Col span={18}>
            <Input value={enumNumber} onChange={(event)=>{
                setEnumNumber(event.target.value)
              // setItem1(event.target.value)
            }}/>
          </Col>
        </Row>
        <Row style={{marginTop:"10px"}} justify="end" align="middle">
          <Col span={6}><span>{"名称"}</span></Col>
          <Col span={18}>
            <Input value={enumName} onChange={(event)=>{
                setEnumName(event.target.value)
              //setItem2(event.target.value)
            }}/>
          </Col>
        </Row>
      </AntdModal>
    </>
  )
}

export default ElementForm
