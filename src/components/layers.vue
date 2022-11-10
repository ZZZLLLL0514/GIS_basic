<template>
  <div style="position: relative">
    <div class="map-container" :style="style" ref="map"></div>
    <div id="popup" class="ol-popup">
      <a href="#" id="popup-closer" class="ol-popup-closer"></a>
      <div v-show="isDraw" id="popup-content">
        <el-table :data="FeaTableData" style="width: 100%" height="250" border>
          <el-table-column prop="field" label="字段" width="130">
          </el-table-column>
          <el-table-column prop="value" label="值" width="130">
          </el-table-column>
        </el-table>
      </div>
      <div v-if="isQueryTable" id="popup-content">
        <el-table :data="queryFeaTable" style="width: 100%" height="250" width="400" border>
          <el-table-column label="ID" type="index" :index="index"> </el-table-column>
          <el-table-column
            v-for="(item, index) in Object.keys(queryFeaTable[0])"
            :key="index"
            :prop="item"
            :label="item"
            width="100"
          >
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div class="bottomBar" @click="barClick" ref="bottomBar">
      <div v-for="(item, index) in operateArray" :key="index">
        <el-tooltip
          :content="item.title"
          placement="right"
          popper-class="changeToolTipStyle"
        >
          <img :src="item.img" alt="" :data-index="index" />
        </el-tooltip>
      </div>
    </div>
    <div class="topBar" ref="topBar">
      <div
        v-for="(item, index) in topoperateArray"
        :key="index"
        class="butnContian"
      >
        <el-button
          :type="item.active ? 'primary' : ''"
          @click="topBarClick(index)"
          size="small"
          round
          >{{ item.title }}</el-button
        >
      </div>
    </div>
    <div v-show="isShow" id="coorContainer" class="coorContainer"></div>
    <div class="control" v-if="layerInfo">
      <el-checkbox v-model="checkAll" @change="handleCheckAllChange"
        >全选</el-checkbox
      >
      <div style="margin: 10px 0"></div>
      <el-checkbox
        v-for="(item, index) in layerInfo"
        v-model="layerInfo[index].visibility"
        :key="item.layerName"
        @change="handleCheckedCitiesChange(layerInfo[index].visibility, index)"
        >{{ item.layerName }}</el-checkbox
      >
      <!-- <button @click="getAioxs()">aioxs请求</button> -->
      <!-- 
      <button @click="getSelect()">获取选中要素</button>
      <button id="export-pdf">导出pdf</button> -->
    </div>
  </div>
</template>
  </div>
</template>

<script>
import "ol/ol.css";
import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import LayerVector from "ol/layer/Vector";
import sourceVector from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Select from "ol/interaction/Select";
import Overlay from "ol/Overlay";
import { toLonLat } from "ol/proj";
import { toStringHDMS } from "ol/coordinate";
import {
  Circle,
  Fill,
  Icon,
  IconImage,
  Image,
  RegularShape,
  Stroke,
  Style,
} from "ol/style";
import axios from "axios";
import { mapMeasure } from "@/mixins/measure.js";
let WFSlayer; //保存WFS加载的图层
let selectInteraction; //保存选中交互对象
export default {
  mixins: [mapMeasure],
  data() {
    return {
      style: "",
      map: null,
      checkAll: true,
      checkedLayers: [],
      layerInfo: [], //图层信息
      layerArr: [], //图层数组，加载图层名用
      layerStyle: new Style({
        //WFS图层样式
        stroke: new Stroke({
          color: "rgba(99, 122, 94,0.4)",
          width: 2,
        }),
        fill: new Fill({
          color: "rgba(120, 110, 114,0.6)",
        }),
      }),
      heightLingFea: null, //高亮feature
      container: null,
      content: null,
      closer: null,
      popupOerlay: null,
      FeaTableData: [],
      queryFeaTable:[]
    };
  },
  mounted() {
    let that = this;
    window.onresize = () => {
      let height = document.documentElement.clientHeight;
      this.style = `height:${height}px`;
    };
    this.initMap();
    this.getLayerName();
    this.iniPopup();
    // let style = new Style({
    //   stroke: new Stroke({
    //     color: "red",
    //     width: 1,
    //   }),
    //   fill: new Fill({
    //     color: "rgba(77, 172, 74,0.4)",
    //   }),
    // });
    // this.map.on("click", (e) => {
    //   console.log("e", e);
    //   let FeatureProperties;
    //   //实现高亮显示和设置中心点
    //   WFSlayer.getFeatures(e.pixel).then((features) => {
    //     let Feature = features.length ? features[0] : undefined;
    //     if (Feature) {
    //       Feature.setStyle(style);
    //       if (that.heightLingFea) that.heightLingFea.setStyle(that.layerStyle);
    //       that.heightLingFea = Feature;
    //       FeatureProperties = Feature.getProperties();
    //       map.getView().setCenter(e.coordinate);
    //       Object.keys(FeatureProperties).forEach((key) => {
    //         if (key != "geometry") {
    //           let fieldValue = {};
    //           fieldValue.field = key;
    //           fieldValue.value = FeatureProperties[key];
    //           this.FeaTableData.push(fieldValue);
    //         }
    //       });
    //       const coordinate = e.coordinate;
    //       // const hdms = toStringHDMS(toLonLat(coordinate));
    //       // console.log("inHTML", inHTML);
    //       // this.content.innerHTML = inHTML;
    //       this.popupOerlay.setPosition(coordinate);
    //     } else if (that.heightLingFea && !Feature) {
    //       that.heightLingFea.setStyle(that.layerStyle);
    //     }
    //   });
    //   if (this.drawSource.getFeatures()[0] && !this.isPick) {
    //     let length = this.drawSource.getFeatures().length;
    //     this.ShowResults(
    //       this.drawSource.getFeatures()[length - 1].getGeometry()
    //     );
    //   } else if (this.isPick) this.pickClick(e);
    // });

    // this.exportMap();
    // selectInteraction = new Select({
    //   // 设置选中后的style
    //   style: new Style({
    //     stroke: new Stroke({
    //       color: "red",
    //       width: 1,
    //     }),
    //     fill: new Fill({
    //       color: "rgb(77, 172, 74)",
    //     }),
    //   }),
    //   layers: [WFSlayer],
    // });
    // 添加一个用于选择Feature的交互方式,实现点击要素高亮显示
    // this.map.addInteraction(selectInteraction);
    // 因为是异步加载，所以要采用事件监听的方式来判定是否加载完成
    // var listenerKey = WFSlayer.getSource().on("change", function () {
    //   if (WFSlayer.getSource().getState() === "ready") {
    //     // 判定是否加载完成
    //     console.log(
    //       "WFSlayer.getSource().getFeatures",
    //       WFSlayer.getSource().getFeatures()
    //     );
    //   }
    // });
    // WFSlayer.getSource().un("change", listenerKey); // 注销监听器
  },
  methods: {
    getLayerName() {
      this.layerArr = this.map.getAllLayers();
      this.layerArr.forEach((item) => {
        if (item.values_.name) {
          let layerInfo = {};
          layerInfo.layerName = item.values_.name;
          layerInfo.visibility = item.values_.visible;
          this.layerInfo.push(layerInfo);
          this.checkedLayers.push(item.values_.name);
        }
      });
    },
    getAioxs() {
      let url = "";
      axios.get("/ajaxserver").then((res) => {
        console.log("请求结果", res);
      });
    },
    getSelect() {
      console.log("selectInteraction", selectInteraction);

      console.log(
        "selectInteraction.getProperties",
        selectInteraction.getFeatures().array_[0].getProperties()
      );
    },
    handleCheckAllChange(val) {
      let that;
      that = this;
      this.checkAll = val;
      function allSelect(value) {
        that.layerArr.forEach((item) => {
          item.values_.visible = value;
        });
      }
      if (val) {
        this.layerInfo.forEach((item) => {
          item.visibility = true;
          allSelect(val);
        });
      } else {
        this.layerInfo.forEach((item) => {
          item.visibility = false;
          allSelect(val);
        });
      }
    },
    handleCheckedCitiesChange(value, index) {
      let sum = 0;
      if (!value) {
        this.checkAll = false;
      } else {
        this.layerInfo.forEach((item) => {
          if (item.visibility == true) {
            sum++;
          }
        });
        if (sum == this.layerInfo.length) this.checkAll = true;
      }
      this.layerArr[index].values_.visible = value;
    },
    initMap() {
      //创建WFS图层
      let url =
        "http://127.0.0.1:8888/geoserver/fistWorkspace/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=fistWorkspace%3Achina&maxFeatures=50&outputFormat=application%2Fjson";
      WFSlayer = new LayerVector({
        title: "geoserveWFS",
        name: "geoserveWFS",
        zIndex: 90,
        style: this.layerStyle,
        source: new sourceVector({
          crossOrigin: "anonymous",
          projection: "EPSG:4326",
          url,
          format: new GeoJSON(),
        }),
      });
      //创建绘制图层
      let DrawLayer = new LayerVector({
        source: this.drawSource,
        style: new Style({
          image: new Circle({
            radius: 4,
            fill: new Fill({
              color: "rgb(94,56,98)",
            }),
          }),
          stroke: new Stroke({
            color: "red",
            width: 2,
          }),
          fill: new Fill({
            color: "rgba(120, 110, 84,0.7)",
          }),
        }),
        visible: true,
      });
      //查询结果图层
      let queryLayer = new LayerVector({
        source: this.querySource,
        style: new Style({
          image: new Circle({
            radius: 4,
            fill: new Fill({
              color: "rgb(94,56,98)",
            }),
          }),
          stroke: new Stroke({
            color: "rgba(78, 203, 255,0.8)",
            width: 3,
          }),
          fill: new Fill({
            color: "rgba(78, 203, 255,0.6)",
          }),
        }),
      });
      this.WFSlayer = WFSlayer;
      let layers = [
        new TileLayer({
          name: "高德地图",
          source: new XYZ({
            crossOrigin: "anonymous",
            url: "http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}", //高德地图
          }),
          // zIndex: 4,
        }),
        new TileLayer({
          name: "arcgis地图",
          // zIndex:2,
          source: new XYZ({
            crossOrigin: "anonymous",
            url: "https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetWarm/MapServer/tile/{z}/{y}/{x}",
          }),
          visible: false,
        }),
        new TileLayer({
          name: "卫星影像图",
          source: new XYZ({
            //卫星影像图
            url: "http://t3.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=5612b1061b22a39f84d1112ceb5a1f6b",
            crossOrigin: "anonymous",
          }),
        }),
        WFSlayer,
        DrawLayer,
        queryLayer,
      ];
      this.map = new Map({
        target: this.$refs.map,
        layers,
        view: new View({
          projection: "EPSG:4326", // 使用这个坐标系
          center: [113.570594, 21.829485],
          zoom: 4,
        }),
      });

      window.map = this.map;
    },
    iniPopup() {
      this.container = document.getElementById("popup");
      this.content = document.getElementById("popup-content");
      this.closer = document.getElementById("popup-closer");
      this.popupOerlay = new Overlay({
        element: this.container,
        autoPan: {
          animation: {
            duration: 250,
          },
        },
      });
      this.closer.onclick = () => {
        this.popupOerlay.setPosition(undefined);
        this.closer.blur();
        return false;
      };
      this.map.addOverlay(this.popupOerlay);
    },
  },
};
</script>
<style lang="less" scoped>
.map-container {
  width: 100%;
  height: 13.5593rem;
  position: relative;
}

.control {
  position: absolute;
  z-index: 20;
  top: 20px;
  right: 20px;
  padding: 10px;
  background-color: rgba(182, 185, 187, 0.7);

  label {
    display: block;
    padding: 4px 0px;
  }
}

.ol-popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  width: 400px;
}

.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}

.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}

.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}

.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
}

.ol-popup-closer:after {
  content: "✖";
}
.el-tooltip__popper.is-dark.changeToolTipStyle {
  background: rgba(13, 65, 136, 0.38) !important;
  font-size: 12px;
  font-family: Helvetica;
  color: #04f4ff !important;
  line-height: 14px;
}
.bottomBar {
  width: 40px;
  position: absolute;
  background: transparent;
  border-radius: 4px;
  bottom: 300px;
  left: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  font-size: 30px;

  img {
    width: 40px;
    height: 40px;
    cursor: pointer;
  }
}
.topBar {
  position: absolute;
  background-color: rgba(36, 156, 183, 0.7);
  border-radius: 4px;
  top: 30px;
  left: 140px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-size: 30px;
  .butnContian {
    padding: 0px 5px 10px;
  }
}
.coorContainer {
  width: 10vw;
  height: 50px;
  margin-bottom: 15px;
  position: absolute;
  color: rgb(8, 226, 237);
  background: rgba(0, 156, 255, 0.11);
  border: 1px solid rgb(78, 203, 255);
  border-radius: 4px;
  left: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 100px;
  z-index: 66;
  font-size: 20px;
}
</style>
