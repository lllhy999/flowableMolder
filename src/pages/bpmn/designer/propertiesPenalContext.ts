import React from 'react';
import BpmnModeler from "bpmn-js/lib/Modeler";
// Creating the context object and passing the default values.
interface defaultValue{
  prefix: string,
  modeler:BpmnModeler, //bpmnModeler
  bpmnEle:any,
  businessObject:any,
  modeling:any, //bpmnModeler.get("modeling")
  moddle:any, //bpmnModeler.get("moddle")
  commandStack:any,
  eventBus:any,// bpmnModeler.get("eventBus"),
  bpmnFactory:any, // bpmnModeler.get("bpmnFactory"),
  elementFactory:any, //bpmnModeler.get("elementFactory"),
  elementRegistry:any, //bpmnModeler.get("elementRegistry"),
  replace: any, //bpmnModeler.get("replace"),
  selection: any, //bpmnModeler.get("selection")
}
let deault:defaultValue={
  prefix:"flowable",
  modeler:null,
  bpmnEle:null,
  businessObject:null,
  modeling:null,
  moddle:null,
  commandStack:null,
  eventBus:null,
  bpmnFactory:null,
  elementFactory:null,
  elementRegistry:null,
  replace:null,
  selection:null,
}
const propertiesPenalContext = React.createContext(deault);

export default propertiesPenalContext;
