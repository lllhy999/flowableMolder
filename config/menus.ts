import Category from '../src/pages/ProductList/component/Category'
import OctRules from '../src/pages/OctRules/index'
import CollpaseColumn from '../src/pages/CollpaseColumn/index'
import DataAnalysisList from '../src/pages/DataAnalysisList/index'
import FinishedList from '../src/pages/FinishedList/index'
import UploadExecl from '../src/pages/UploadExecl/index'
import ProductList from '../src/pages/ProductList/index'
import ProductPage from '../src/pages/ProductList/component/Page'
import BasicPage from  '../src/pages/BasicList/component/Page'
import BasicList from '../src/pages/BasicList/index'
import ProcessDesigner from '../src/pages/bpmn/designer/ProcessDesigner'
import Test from '../src/pages/1T/Test'
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
    ],
  },
  {
    path: '/ProcessDesigner',
    name: 'ProcessDesigner',
    icon: 'smile',
    //access: 'canAdmin',
    component: ProcessDesigner,
  },
];
