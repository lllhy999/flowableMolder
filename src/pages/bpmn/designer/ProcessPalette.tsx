import {useEffect, useState, useRef, } from 'react'
import {FormInstance, message, Card, Modal, Table, Button, Collapse} from 'antd'
import {LeftOutlined, PlusCircleOutlined} from '@ant-design/icons'
import {useModel,useRequest} from "@umijs/max";
import BpmnModeler from "bpmn-js/lib/Modeler";
import {httpUrl} from '../../../services/ant-design-pro/globalParams'
import styles from  './ProcessPalette.less'
//import {useRequest} from "@@/plugin-request/request";
const ProcessPalette = ({bpmnModeler}:{bpmnModeler:BpmnModeler}) => {
  const {initialState} = useModel('@@initialState')

  const phone = initialState?.currentUser?.phone
  const token = initialState?.currentUser?.token
  let form:FormInstance
  //const ref = React.createRef()
  const ref = useRef<any>()
  const init = useRequest<{ data: ProductCommonApi.cateGgryResults }>(
    //`${httpUrl}/CatByParentId?phone=${phone}&token=${token}&parentId=${parentId}`,
    (values: any) => {
      /* message.loading({
         content: "Processing ",
         key: "process",
         duration: 0
       })*/
      const {uri, method, ...formValues} = values
      //console.log('useRequest: ', values)
      return {
        url: `${httpUrl}${uri}`,
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
      onError: () => {
        // history.goBack()
        message.error('获取数据失败')
      },
      formatResult: (res:any) => {
        //setListData(res.data)
        //message.success('获取数据成功')
        //console.log('res modal: ', res.data)
        return res
      }
    })

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
        url: `${httpUrl}${uri}`,
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
    //console.log('init.data: ',init.data)
  },[init.data])
  useEffect(()=>{
  },[])
  const onChange = (event:Event) => {
    //console.log(event)
  }
  const createElement = (event:Event|undefined, Task:String) => {
    console.log("event:", event);
    console.log("Task:", Task);
  }

  const { Panel } = Collapse;
  return (
    <Card >
      <p>简易palette</p>
      <Collapse className={styles.MyProcessPalette} defaultActiveKey={['1']} onChange={onChange}>
        <Panel header="任务" key="1">
          <div className={styles.CustomButton} onClick={()=>createElement(event,'Task')}
           onMouseDown={()=>createElement(event, 'Task')}>
           任务
          </div>
          <div className={styles.CustomButton} onClick={()=>createElement(event,'UserTask')}
               onMouseDown={()=>createElement(event, 'UserTask')}>
            用户任务
          </div>
          <div className={styles.CustomButton} onClick={()=>createElement(event,'SendTask')}
               onMouseDown={()=>createElement(event, 'SendTask')}>
            发送任务
          </div>
          <div className={styles.CustomButton} onClick={()=>createElement(event,'ReceiveTask')}
               onMouseDown={()=>createElement(event, 'ReceiveTask')}>
            接收任务
          </div>
          <div className={styles.CustomButton} onClick={()=>createElement(event,'ScriptTask')}
               onMouseDown={()=>createElement(event, 'ScriptTask')}>
            脚本任务
          </div>
          <div className={styles.CustomButton} onClick={()=>createElement(event,'ServiceTask')}
               onMouseDown={()=>createElement(event, 'ServiceTask')}>
            服务任务
          </div>
        </Panel>
        <Panel header="网关" key="2">
          <div className={styles.CustomButton} onClick={()=>createElement(event,'Gateway')}
               onMouseDown={()=>createElement(event, 'Gateway')}>
            网关
          </div>
        </Panel>
        <Panel header="开始" key="3">
          <div className={styles.CustomButton} onClick={()=>createElement(event,'StartEvent')}
               onMouseDown={()=>createElement(event, 'StartEvent')}>
            网关
          </div>
        </Panel>
        <Panel header="结束" key="4">
          <div className={styles.CustomButton} onClick={()=>createElement(event,'EndEvent')}
               onMouseDown={()=>createElement(event, 'EndEvent')}>
            网关
          </div>
        </Panel>
        <Panel header="工具" key="5">
          <div className={styles.CustomButton} onClick={()=>createElement(event,'handTool')}
               onMouseDown={()=>createElement(event, 'handTool')}>
            手型工具
          </div>
          <div className={styles.CustomButton} onClick={()=>createElement(event,'lassoTool')}
               onMouseDown={()=>createElement(event, 'lassoTool')}>
            框选工具
          </div>
          <div className={styles.CustomButton} onClick={()=>createElement(event,'connectTool')}
               onMouseDown={()=>createElement(event, 'connectTool')}>
            连线工具
          </div>
        </Panel>
      </Collapse>
    </Card>
  )
}


export default ProcessPalette
