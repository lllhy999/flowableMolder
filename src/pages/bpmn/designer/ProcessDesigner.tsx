import {useEffect, useState, useRef } from 'react'
import {FormInstance, message, Card, Modal as AntdModal, Table, Button, Dropdown, Menu, Collapse,
  Upload,Space,Tooltip,Popconfirm } from 'antd'
import {useModel,useRequest} from "@umijs/max";
import {httpUrl} from '../../../services/ant-design-pro/globalParams'
import  './ProcessDesigner.less'
import { UploadOutlined,DownloadOutlined,EyeOutlined,BugOutlined, SearchOutlined,
  InfoCircleFilled,MessageFilled,NotificationFilled,PlusCircleFilled,SettingOutlined,
  LeftOutlined,AlignCenterOutlined,AlignLeftOutlined,AlignRightOutlined,ChromeOutlined,
  ZoomInOutlined,ZoomOutOutlined,OneToOneOutlined,RedoOutlined,UndoOutlined} from '@ant-design/icons';

import BpmnModeler from "bpmn-js/lib/Modeler";
import DefaultEmptyXML from "./plugins/defaultEmpty";

import camundaModdleDescriptor from "./plugins/descriptor/camundaDescriptor.json";
import activitiModdleDescriptor from "./plugins/descriptor/activitiDescriptor.json";
import flowableModdleDescriptor from "./plugins/descriptor/flowableDescriptor.json";
import customTranslate from "./plugins/translate/customTranslate";
import translationsCN from "./plugins/translate/zh";
import tokenSimulation from "bpmn-js-token-simulation"
import minimapModule from "diagram-js-minimap";

import 'bpmn-js/dist/assets/diagram-js.css' // 左边工具栏以及编辑节点的样式
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css'
import 'bpmn-js-properties-panel/dist/assets/bpmn-js-properties-panel.css'
import "bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css"
import "bpmn-js-token-simulation/assets/css/font-awesome.min.css"
import "bpmn-js-token-simulation/assets/css/normalize.css"
import "diagram-js-minimap/assets/diagram-js-minimap.css"
import ActionBuilder from "@/pages/BasicList/builder/ActionBuilder";
import React from "react";
import X2JS from  "x2js";
import Highlight from "react-highlight"
import ProcessPanel from "./ProcessPenal";
import PropertiesPenalContext from "./propertiesPenalContext"

const ProcessDesigner = (props:any) => {
  const [simulation,setSimultion] = useState(true)
  const [fileList, setFileList] = useState([])
  const [previewModal,setPerviewModal] = useState(false)
  const [alignModal,setAlignModal] = useState(false)
  const [previewResult,setPreviewResult] = useState()
  const [previewType,setPreviewType] = useState()
  const [simulationStatus, setSimulationStatus] = useState(false)
  const [eleAlign,setEleAlign] = useState("")
  const [defaultZoom, setDefaultZoom] = useState(1)
  const [bpmnElement, setBpmnElement] = useState<any>()
  const [elementId,setElementId] = useState()
  const [elementType, setElementType] = useState()
  const [elementBusinessObject, setElementBusinessObject] = useState()
  const [modeling,setModeling] = useState(null)
  const [moddle,setModdle] = useState(null)
  const [commandStack, setCommandStack] = useState(null)
  const [eventBus,setEventBus] = useState(null)
  const [bpmnFactory, setBpmnFactory] = useState(null)
  const [conditionFormVisible, setConditionFormVisible] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [recoverable, setRecoverable] = useState(false)
  const [revocable, setRevocable] = useState(false)
  const [prefix, setPrefix] = useState("camunda")//("camunda")
  const {initialState} = useModel('@@initialState')
  const phone = initialState?.currentUser?.phone
  const token = initialState?.currentUser?.token
  const onlyCustomizeAddi = false;
  let additionalModel:[] = [];
  let translations:Object = null;

  let events:Array<string>= ["element.click"];
  let moddleExtension:Object = null;
  const onlyCustomizeModdle = false;
  //let bpmnModeler:any = null
  let bpmnModelerRef = useRef<BpmnModeler>();
  let Extensions:any = {};
  let Modules:any[] = [];
  //const ref = React.createRef()
  const BpmnCanvas = useRef<any>()
  const simulationRef = useRef<boolean>()
  const additionalModules = ()=> {
    // 仅保留用户自定义扩展模块
    if (onlyCustomizeAddi) {
      if (Object.prototype.toString.call(additionalModel) === "[object Array]") {
        Modules = additionalModel || [];
      }
      Modules = additionalModel;
    }

    // 插入用户自定义扩展模块
    if (Object.prototype.toString.call(additionalModel) === "[object Array]") {
      Modules.push(...additionalModel);
    } else {
      additionalModel && Modules.push(additionalModel);
    }

    // 翻译模块
    const TranslateModule = {
      translate: ["value", customTranslate(translations || translationsCN)]
    };
    Modules.push(TranslateModule);

    // 模拟流转模块
    if (simulation) {
      Modules.push(tokenSimulation);
    }

  }

  const moddleExtensions = ()=> {
    // 仅使用用户自定义模块
    if (onlyCustomizeModdle) {
      Extensions = moddleExtension || null;
    }

    // 插入用户自定义模块
    if (moddleExtension) {
      for (let key in moddleExtension) {
        Extensions[key] = moddleExtension[key];
      }
    }
    // 根据需要的 "流程类型" 设置 对应的解析文件
    if (prefix === "activiti") {
      Extensions.activiti = activitiModdleDescriptor;
    }
    if (prefix === "flowable") {
      Extensions.flowable = flowableModdleDescriptor;
    }
    if (prefix === "camunda") {
      Extensions.camunda = camundaModdleDescriptor;
    }
  }
  const createBpmnDiagram = async (xml:string) => {
    const bpmnModeler = bpmnModelerRef.current;
    try {
      let newId =  `Process_${new Date().getTime()}`;
      let newName = `业务流程_${new Date().getTime()}`;
      let xmlString =  xml || DefaultEmptyXML(newId, newName, prefix);
      const result = await bpmnModeler?.importXML(xmlString);
      console.log("result: ",result);
      console.log('属性面板数据: ', bpmnModeler?.get('propertiesPanel'));
    } catch(error) {
      console.error(error)
    }
  }

  const initBpmnModeler =()=> {
    let bpmnModeler = bpmnModelerRef.current;
    if (bpmnModeler) return;
    moddleExtensions();
    additionalModules();
    bpmnModeler = new BpmnModeler({
      container: BpmnCanvas.current, //"#canvas",
      height: '100vh',
      propertiesPanel: {
        parent: '#penal'
      },
      additionalModules: [...Modules,minimapModule],
      moddleExtensions: Extensions,
      minimap: {
        open: true
      }
    });
    bpmnModelerRef.current = bpmnModeler
    setModdle(bpmnModeler.get("moddle"))
    setModeling(bpmnModeler.get("modeling"))
    setCommandStack(bpmnModeler.get("commandStack"))
    setEventBus(bpmnModeler.get("eventBus"))
    setBpmnFactory(bpmnModeler.get("bpmnFactory"))
    //this.$emit("init-finished", this.bpmnModeler);
    createBpmnDiagram(null);
    //initModelListeners();
    const EventBus = bpmnModeler.get("eventBus");
    bpmnModeler.on("element.changed", ({ element }:{ element:any }) => {
      //console.log("element.changed: "+element.id+" elementId:"+elementId);
      if (element && element.id === elementId) {
        initFormOnChanged(element);
      }
    });
    bpmnModeler.on("selection.changed", ({ newSelection }:{newSelection:any}) => {
      //console.log("selection.changed"+" elementId:"+elementId);
      initFormOnChanged(newSelection[0] || null);
    });
    bpmnModeler.on("canvas.viewbox.changed", ({ viewbox }:{ viewbox:any }) => {
      //console.log("canvas.viewbox.changed",viewbox);
      //const { scale } = viewbox;
      //defaultZoom = Math.floor(scale * 100) / 100;
    });
    bpmnModeler.on("import.done", (e:any) => {
      initFormOnChanged(null);
    });
    //console.log("EventBus",EventBus);
    EventBus.on("commandStack.changed", async (event:any) => {
      console.log("commandStack.changed: ",event);
      try {
        setRecoverable(bpmnModeler.get("commandStack").canRedo());
        setRevocable(bpmnModeler.get("commandStack").canUndo());
        let { xml } = await bpmnModeler.saveXML({ format: true });
        console.log("xml: ",xml);
      } catch (e) {
        console.error(`[Process Designer Warn]: ${e.message || e}`);
      }
    });
  }
  useEffect(()=>{
    initBpmnModeler();
  },[])

  useEffect(()=>{
    simulationRef.current = simulationStatus
  },[simulationStatus])

  const HandleImportFile = (e: any) => {
    console.log('e:  ', e.fileList.length, e.file.status, e)
    if (e.file.status === "uploading") {
      //return
    }
    console.log('e: uploading is doned ')
    let {fileList} = e
    let name = fileList[0]!.name
    let suffix = name.substr(name.lastIndexOf("."))
    let reader = new FileReader()
    console.log('Files: ', fileList[0])
    reader.readAsText(fileList[0].originFileObj)
    reader.onload = async (event) => {
      try {
        let {result} = event.target
        console.log('result 文件: ',result)
        let index = (''+result).indexOf("flowable.org")
        console.log("set --------------------- index",index)
        if(index > -1){
          setPrefix("flowable")
          console.log("set --------------------- flowable")
        }else{
          index = (''+result).indexOf("camunda.org")
          if(index > -1) {
            setPrefix("camunda")
            console.log("set --------------------- camunda")
          }
        }
        //createBpmnDiagram(null);
        if(result){
          message.warn("文件上传成功")
          createBpmnDiagram(result);
        }
      } catch (e) {
        message.error("文件类型错误")
      }
    }
    e.fileList = []
    setFileList([])
  }

  const downloadProcessAsXml = () => {
    downloadProcess("xml","diagram.bpmn20");
  }
  const downloadProcessAsBpmn = () => {
    downloadProcess("bpmn","diagram.bpmn20");
  }
  const downloadProcess = async (type:any, name:any)=> {
    const bpmnModeler = bpmnModelerRef.current;
    try {
      // 按需要类型创建文件并下载
      if (type === "xml" || type === "bpmn") {
        const { err, xml } = await bpmnModeler.saveXML();
        if (err) {
          console.error(`[Process Designer Warn ]: ${err.message || err}`);
        }
        let { href, filename } = setEncoded(type, name, xml);
        downloadFunc(href, filename);
      }
    } catch (e) {
      console.error(`[Process Designer Warn ]: ${e.message || e}`);
    }
  }
  const downloadFunc =(href:any, filename:any)=> {
    if (href && filename) {
      let a = document.createElement("a");
      a.download = filename;
      a.href = href;
      a.click();
      URL.revokeObjectURL(a.href);
    }
  }
  const setEncoded =(type:any, filename = "diagram", data:any) =>{
    const encodedData = encodeURIComponent(data);
    return {
      filename: `${filename}.${type}`,
      href: `data:application/${type === "svg" ? "text/xml" : "bpmn20-xml"};charset=UTF-8,${encodedData}`,
      data: data
    };
  }
  const previewProcessXML = ()=> {
    const bpmnModeler = bpmnModelerRef.current;
    bpmnModeler.saveXML({ format: true }).then(({ xml }) => {
      setPreviewResult(xml)
      setPreviewType("xml")
      setPerviewModal(true)
    });
  }
  const previewProcessJson = ()=> {
    const bpmnModeler = bpmnModelerRef.current;
    const newConvert = new X2JS();
    bpmnModeler.saveXML({ format: true }).then(({ xml }) => {
      const { definitions } = newConvert.xml2js(xml);
      if (definitions) {
        setPreviewResult(JSON.stringify(definitions, null, 4));
      } else {
        setPreviewResult("");
      }
      setPreviewType("json")
      setPerviewModal(true)
    });
  }
  const processSimulation = ()=> {
    const bpmnModeler = bpmnModelerRef.current;
    setSimulationStatus(!simulationStatus)
    bpmnModeler.get("toggleMode").toggleMode();
  }
  const alignProcessModal = () => {
    const bpmnModeler = bpmnModelerRef.current;
    const Align = bpmnModeler.get("alignElements");
    const Selection = bpmnModeler.get("selection");
    const SelectedElements = Selection.get();
    if (!SelectedElements || SelectedElements.length <= 1) {
      message.warning("请按住 Ctrl 键选择多个元素对齐");
      setAlignModal(false)
      return;
    }
    Align.trigger(SelectedElements, eleAlign);
    setAlignModal(false)
  }
  const elementsAlign =(align:string)=> {
    setAlignModal(true)
    setEleAlign(align)
  }
  const processZoomOut = () => {
    const bpmnModeler = bpmnModelerRef.current;
    let newZoom = Math.floor(defaultZoom * 100 - 0.1 * 100) / 100;
    if (newZoom < 0.2) {
      message.warn("[Process Designer Warn ]: The zoom ratio cannot be less than 0.2");
      return
    }
    setDefaultZoom(newZoom);
    bpmnModeler.get("canvas").zoom(newZoom);
  }
  const processZoomIn = () => {
    const bpmnModeler = bpmnModelerRef.current;
    let newZoom = Math.floor(defaultZoom * 100 + 0.1 * 100) / 100;
    if (newZoom > 4) {
      message.warn("[Process Designer Warn ]: The zoom ratio cannot be greater than 4");
      return
    }
    setDefaultZoom(newZoom);
    bpmnModeler.get("canvas").zoom(newZoom);
  }
  const processReZoom = () => {
    const bpmnModeler = bpmnModelerRef.current;
    const newZoom = 1
    if (newZoom < 0.2) {
      message.warn("[Process Designer Warn ]: The zoom ratio cannot be less than 0.2");
      return
    }
    if (newZoom > 4) {
      message.warn("[Process Designer Warn ]: The zoom ratio cannot be greater than 4");
      return
    }
    setDefaultZoom(newZoom);
    bpmnModeler.get("canvas").zoom(newZoom);
  }
  const processUndo =()=> {
    const bpmnModeler = bpmnModelerRef.current;
    bpmnModeler.get("commandStack").undo();
  }
  const processRedo =()=> {
    const bpmnModeler = bpmnModelerRef.current;
    bpmnModeler.get("commandStack").redo();
  }
  const processRefresh = ()=> {
    console.log("refresh click")
    createBpmnDiagram(null);
  }
  const initFormOnChanged = (element:any)=> {
    const bpmnModeler = bpmnModelerRef.current;
    let activatedElement = element;
    if (!activatedElement) {
      const elementRegistry = bpmnModeler.get("elementRegistry");
      activatedElement =
        elementRegistry.find(el => el.type === "bpmn:Process") ??
         elementRegistry.find(el => el.type === "bpmn:Collaboration");
    }
    if (!activatedElement) {console.log("activatedElement is null");return;}
    //console.log(`select element changed: id: ${activatedElement.id} , type: ${activatedElement.businessObject.$type}`);
    console.log("businessObject:", activatedElement.businessObject);
    setBpmnElement(activatedElement);
   // console.log("BpmnElemente: ",activatedElement);
    setElementId(activatedElement.id);
    const eleType = activatedElement.type.split(":")[1] || "";
    setElementType(eleType);
    setElementBusinessObject(JSON.parse(JSON.stringify(activatedElement.businessObject)));
    //console.log("businessObject: ",JSON.parse(JSON.stringify(activatedElement.businessObject)));
    const conditionFormVisible1 = !!(
      eleType === "SequenceFlow" &&
      activatedElement.source &&
      activatedElement.source.type.indexOf("StartEvent") === -1
    );
    setConditionFormVisible(conditionFormVisible1);
    setFormVisible(eleType === "UserTask" || eleType === "StartEvent");
  }
  const previewMenu = (
    <Menu
      items={[
        {
          key: '1',
          label: (
            <Button type="text" onClick={()=>previewProcessXML()}>预览XML</Button>
          ),
        },
        {
          key: '2',
          label: (
            <Button type="text" onClick={()=>previewProcessJson()}>预览JSON</Button>
          ),
        },
      ]}
    />
  );
  const simulationMenu = (
    <Menu
      items={[
        {
          key: '1',
          label: (
            <Button type="text" onClick={()=>processSimulation()} >{simulationStatus?"退出模拟":"开启模拟"}</Button>
          ),
        },
      ]}
    />
  );
  const downloadMenu = (
    <Menu
      items={[
        {
          key: '1',
          label: (
            <Button type="text" onClick={()=>downloadProcessAsXml()}>下载为XML</Button>
          ),
        },
        {
          key: '2',
          label: (
            <Button type="text" onClick={()=>downloadProcessAsBpmn()}>下载为BPMN</Button>
          ),
        },
      ]}
    />
  );
  return (
    <div className="designer-container">
    <div className="designer">
      <div className="designer-header">
        <Upload
          action=""
          accept=".xml,.bpmn"
          name="file"
          onChange={HandleImportFile}
          fileList={[]}
          //beforeUpload={beforeUpload}
        >
          <Button type="primary" icon={<UploadOutlined/>}>打开文件</Button>
        </Upload>
        <Dropdown overlay={downloadMenu} placement="bottomLeft" arrow>
          <Button type="primary" icon={<DownloadOutlined/>}>下载文件</Button>
        </Dropdown>
        <Dropdown overlay={previewMenu} placement="bottomLeft" arrow>
          <Button type="primary" icon={<EyeOutlined/>}>预览</Button>
        </Dropdown>
        <Dropdown overlay={simulationMenu} placement="bottomLeft" arrow>
          <Button type="primary" icon={<BugOutlined/>}>模拟</Button>
        </Dropdown>
        <Space>&nbsp;</Space>
        <Tooltip placement="bottomLeft" title={"左对齐"}>
          <Button icon={<AlignLeftOutlined/>} onClick={()=>elementsAlign('left')}></Button>
        </Tooltip>
        <Tooltip placement="bottomLeft" title={"右对齐"}>
        <Button icon={<AlignRightOutlined/>} onClick={()=>elementsAlign('right')}></Button>
        </Tooltip>
        <Tooltip placement="bottomLeft" title={"顶对齐"}>
        <Button onClick={()=>elementsAlign('top')} style={{transform: "rotate(-90deg)"}} icon={<AlignRightOutlined/>}></Button>
        </Tooltip>
        <Tooltip placement="bottomLeft" title={"底对齐"}>
        <Button onClick={()=>elementsAlign('bottom')} style={{transform: "rotate(-90deg)"}} icon={<AlignLeftOutlined/>}></Button>
        </Tooltip>
        <Tooltip placement="bottomLeft" title={"垂直对齐"}>
        <Button onClick={()=>elementsAlign('center')} icon={<AlignCenterOutlined/>}></Button>
        </Tooltip>
        <Tooltip placement="bottomLeft" title={"水平对齐"}>
        <Button onClick={()=>elementsAlign('middle')} style={{transform: "rotate(-90deg)"}} icon={<AlignCenterOutlined/>}></Button>
        </Tooltip>
        <Space>&nbsp;</Space>
        <Tooltip placement="bottomLeft" title={"缩小显示"}>
        <Button onClick={()=>processZoomOut()} disabled={defaultZoom <0.2} icon={<ZoomOutOutlined/>}></Button>
        </Tooltip>
        <Tooltip placement="bottomLeft" title={""}>
        <Button  >{ Math.floor(defaultZoom * 10 * 10) + "%" }</Button>
        </Tooltip>
        <Tooltip placement="bottomLeft" title={"放大显示"}>
        <Button onClick={()=>processZoomIn()} disabled={defaultZoom >4} icon={<ZoomInOutlined/>}></Button>
        </Tooltip>
        <Tooltip  placement="bottomLeft" title={"原始显示"}>
        <Button onClick={()=>processReZoom()} icon={<OneToOneOutlined/>}></Button>
        </Tooltip>
        <Space>&nbsp;</Space>
        <Tooltip placement="bottomLeft" title={"撤销"}>
        <Button disabled={revocable} onClick={()=>processUndo()} icon={<UndoOutlined/>}></Button>
        </Tooltip>
        <Tooltip placement="bottomLeft" title={"重做"}>
        <Button disabled={recoverable} onClick={()=>processRedo()} icon={<RedoOutlined/>}></Button>
        </Tooltip>
        <Tooltip placement="bottomLeft" title={"刷新"}>
        <Button  icon={<ChromeOutlined/>} onClick={()=>processRefresh()}></Button>
        </Tooltip>
      </div>
      <div className="designer-container">
        <div id="canvas" className="designer-canvas" ref={BpmnCanvas}></div>
      </div>
    </div>
      <PropertiesPenalContext.Provider
        value={{prefix:prefix,modeler:bpmnModelerRef.current,businessObject:elementBusinessObject,
          bpmnEle:bpmnElement,moddle,modeling,bpmnFactory}}>
        <ProcessPanel id="panel" className="properties-panel"></ProcessPanel>
      </PropertiesPenalContext.Provider>
      <AntdModal
        title={"预览"}
        visible={previewModal}
        onOk={()=>{
          setPerviewModal(false)
        }}
        onCancel={()=>{
          setPerviewModal(false)
        }}
         maskClosable={false}
        forceRender
      >
        {/*<div>{previewResult}</div>*/}
        <Highlight language={previewType} code={previewResult} >{previewResult}</Highlight>
      </AntdModal>
      <AntdModal
        title={"提示"}
        visible={alignModal}
        onOk={()=>{
          alignProcessModal()
        }}
        onCancel={()=>{
          // hideModal()
          setAlignModal(false)
        }}
        maskClosable={false}
        forceRender
      >
        <div>自动对齐可能造成图形变形，是否继续？</div>
      </AntdModal>
    </div>
  )
}

export default ProcessDesigner
