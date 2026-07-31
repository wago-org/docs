import DefaultTheme from 'vitepress/theme'
import WagoLayout from './WagoLayout.vue'
import Accordion from './components/Accordion.vue'
import Annotation from './components/Annotation.vue'
import Annotations from './components/Annotations.vue'
import ApiEndpoint from './components/ApiEndpoint.vue'
import Badge from './components/Badge.vue'
import Card from './components/Card.vue'
import CardGroup from './components/CardGroup.vue'
import ComparisonRow from './components/ComparisonRow.vue'
import ComparisonTable from './components/ComparisonTable.vue'
import FileTree from './components/FileTree.vue'
import FileTreeItem from './components/FileTreeItem.vue'
import Step from './components/Step.vue'
import Steps from './components/Steps.vue'
import Tab from './components/Tab.vue'
import Tabs from './components/Tabs.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: WagoLayout,
  enhanceApp({ app }) {
    app.component('Accordion', Accordion)
    app.component('Annotation', Annotation)
    app.component('Annotations', Annotations)
    app.component('ApiEndpoint', ApiEndpoint)
    app.component('Badge', Badge)
    app.component('Card', Card)
    app.component('CardGroup', CardGroup)
    app.component('ComparisonRow', ComparisonRow)
    app.component('ComparisonTable', ComparisonTable)
    app.component('FileTree', FileTree)
    app.component('FileTreeItem', FileTreeItem)
    app.component('Step', Step)
    app.component('Steps', Steps)
    app.component('Tab', Tab)
    app.component('Tabs', Tabs)
  }
}
