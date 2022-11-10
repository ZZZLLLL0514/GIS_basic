import * as turf from "@turf/turf";
import Draw from "ol/interaction/Draw"
import sourceVector from "ol/source/Vector";
import { GeoJSON, WFS } from 'ol/format';
import {
    and as andFilter,
    equalTo as equalToFilter,
    like as likeFilter,
    intersects as geoIntersects
} from 'ol/format/filter';
import LayerVector from "ol/layer/Vector";
import { Point, LineString, Polygon } from 'ol/geom';
import WKT from 'ol/format/WKT';
import {
    Circle,
    Fill,
    Stroke,
    Style
} from "ol/style";
export const mapMeasure = {
    data() {
        return {
            isQurey: false,//是否在进行查询功能
            isDraw: false,//是否在进行测绘功能（包括点击查询）
            isPick: false,//是否坐标拾取
            isShow: false,//控制显隐测距dom数据
            isQueryTable:false,//控制是否显示查询结果列表
            draw: null,
            operateArray: [
                {
                    active: false,
                    title: "点击查询",
                    name: "circular",
                    img: require(`@/assets/img/circular.png`),
                },
                {
                    active: false,
                    title: "坐标拾取",
                    name: "coordinatePicking",
                    img: require(`@/assets/img/coordinatePicking.png`),
                },
                {
                    active: false,
                    title: "测距",
                    name: "ranging",
                    img: require(`@/assets/img/ranging.png`),
                },
                {
                    active: false,
                    title: "测面",
                    name: "measurement",
                    img: require(`@/assets/img/measurement.png`),
                },
            ],
            topoperateArray: [
                {
                    active: false,
                    title: "导出地图",
                    name: "export",
                },
                {
                    active: false,
                    title: "绘线查询",
                    name: "line",
                },
                {
                    active: false,
                    title: "绘面查询",
                    name: "polygon",
                }
            ],
            drawSource: new sourceVector(),//绘制图层源
            querySource: new sourceVector(),//查询图层源
            linestring: {
                //测距要素
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: [],
                },
            },
            jsonPolygon: {
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: [],
                },
            },
            textContent: "",//记录测量结果
            lenValue_el: null,
            distanceContainer: null,
            WFSlayer: null
        }
    },
    methods: {
        closeOperat(index) {//取消前一步地图操作
            if (index == "0") {
                this.operateArray[index].active = false;
                this.operateArray[index].img = require(`@/assets/img/${this.operateArray[index].name}.png`);

            } else {
                this.operateArray[index].active = false;
                this.operateArray[index].img = require(`@/assets/img/${this.operateArray[index].name}.png`);
                this.drawSource.getFeatures().forEach(item => {
                    this.drawSource.removeFeature(item)
                })
                this.lenValue_el.remove();
                this.distanceContainer.innerHTML = "";
                this.isPick = false;
                this.isShow = false;
            }
        },
        barClick(e) {
            if (this.isQurey) {
                this.$message({
                    message: '请关闭查询功能。',
                    type: 'warning'
                });
                return
            }
            let index = e.target.getAttribute("data-index");
            this.map.un("click", this.ClickQueryBack);
            this.map.removeInteraction(this.draw);//移除绘制
            if (this.operateArray[index].active) {
                if (index == 0) this.heightLingFea.setStyle(this.layerStyle);
                this.closeOperat(index);
                this.isDraw = false;//关闭测绘功能（包括点击查询）
            } else {
                this.isDraw = true;//开启测绘功能（包括点击查询）
                for (let i = 0; i < this.operateArray.length; i++) {
                    if (this.operateArray[i].active) {
                        this.closeOperat(i)
                        break;
                    }
                }
                this.operateArray[index].active = true;
                this.operateArray[index].img = require(`@/assets/img/${this.operateArray[index].name}Blue.png`);
                if (index != "0") {
                    this.distanceContainer = document.getElementById("coorContainer");
                    this.lenValue_el = document.createElement("pre");
                    this.lenValue_el.style.fontSize = "13px";
                    this.lenValue_el.style.color = "#ffffff";
                    this.isShow = true;
                }
                switch (index) {
                    case "0":
                        // this.iniPopup();
                        this.ClickQuery();
                        break;
                    case "1":
                        this.isPick = true;
                        this.measure("Point", 5);
                        break;
                    case "2":
                        this.measure("LineString");
                        break;
                    case "3":
                        this.measure("Polygon");
                        break;
                }
                this.operateArray.forEach((element, arrIndex) => {
                    if (arrIndex != index) element.img = require(`@/assets/img/${element.name}.png`);
                });
            }

        },
        topBarClick(index) {
            if (index != 0 && this.isDraw) {
                this.$message({
                    message: '请关闭测绘功能。',
                    type: 'warning'
                });
                return
            }
            if (this.isQurey) {
                this.drawSource.getFeatures().forEach(item => {
                    this.drawSource.removeFeature(item)
                })
                this.querySource.getFeatures().forEach(item => {
                    this.querySource.removeFeature(item)
                })
                this.map.removeInteraction(this.draw);//移除绘制
            }
            let active = this.topoperateArray[index].active;
            if (active) {
                if (index != 0) {
                    this.topoperateArray[index].active = false;
                    this.isQurey = false;//关闭查询
                    this.isQueryTable=false;//隐藏查询列表

                }
            } else {
                this.isQurey = true;//开启查询
                switch (index) {
                    case 0:
                        this.exportMap();
                        break;
                    case 1:
                        this.multiQuery(index);
                        break;
                    case 2:
                        this.multiQuery(index);
                        break;
                }
            }
        },
        multiQuery(index) {
            this.topoperateArray[index].active = true;
            if (index == 1) {
                this.topoperateArray[2].active = false;
                this.measure("LineString");//与绘线共用一个方法
            } else {
                this.topoperateArray[1].active = false;
                this.measure("Polygon");//绘面共用一个方法
            }

        },
        measure(drawType, size = 2) {
            this.map.un("click", this.pickClick)
            this.draw = new Draw({//创建绘制实例对象
                source: this.drawSource,
                type: drawType,
                style: new Style({
                    image: new Circle({
                        radius: size,
                        fill: new Fill({
                            color: 'red'
                        })
                    }),
                    stroke: new Stroke({
                        color: 'rgba(90,120,99,0.6)',
                        width: 3
                    }),
                    fill: new Fill({
                        color: 'rgba(99,110,121,0.6)'
                    })
                })
            });
            this.map.addInteraction(this.draw);//添加交互（绘制功能）
            if (!this.isPick) {//非坐标拾取
                this.map.on("dblclick", (e) => {
                    if (this.drawSource.getFeatures()[0]) {
                        let length = this.drawSource.getFeatures().length;
                        let geo = this.drawSource.getFeatures()[length - 1].getGeometry();//获取绘制出来的几何

                        if (!this.isDraw) {
                            let queryGeo;
                            if (geo.getType() == "LineString") {
                                let lineCoordinates = geo.getCoordinates().map((item) => {//对调经纬度在数组中位置，不然与geoserver经纬度顺序有冲突导致查询结果失败
                                    let t;
                                    t = item[0];
                                    item[0] = item[1];
                                    item[1] = t;
                                    return item;  //需要返回值
                                })
                                queryGeo = new LineString(lineCoordinates)
                                console.log("线")
                                this.filterByGeo(queryGeo, e.coordinate)
                            } else if (geo.getType() == "Polygon") {
                                let polygonCoordinates = geo.getCoordinates()[0].map((item) => {//这里的geo.getCoordinates得到的是数组，需要取出再遍历
                                    let t;
                                    t = item[0];
                                    item[0] = item[1];
                                    item[1] = t;
                                    return item;  //需要返回值
                                })
                                queryGeo = new Polygon([polygonCoordinates])//组成数组。所以这里大概也能以多个面查询
                                this.filterByGeo(queryGeo, e.coordinate)
                            }
                        } else {
                            this.ShowResults(
                                geo
                            );
                        }

                    }
                });
            } else {
                this.map.on("click", () => {
                    if (this.drawSource.getFeatures()[0] && this.isPick) {
                        let length = this.drawSource.getFeatures().length;
                        let geo = this.drawSource.getFeatures()[length - 1].getGeometry();//获取绘制出来的几何
                        this.pickClick(
                            geo.getCoordinates()
                        );
                    }
                })
            }
        },
        ShowResults(Geometry) {
            console.log("this.drawSource.getGeometry()", Geometry.getType());
            this.lenValue_el.remove();
            this.distanceContainer.innerHTML = "";
            if (Geometry.getType() == "LineString") {
                this.linestring.geometry.coordinates = Geometry.getCoordinates();
                const distance = turf.length(this.linestring);
                this.textContent = `总长度: ${distance.toLocaleString()}km`;
                this.lenValue_el.textContent = this.textContent;
                this.distanceContainer.appendChild(this.lenValue_el);
            } else if (Geometry.getType() == "Polygon") {
                this.jsonPolygon.geometry.coordinates = Geometry.getCoordinates();
                const area = turf.area(this.jsonPolygon);
                if (area < 1000) {
                    this.textContent = `面积：${Math.round(area)}m²`;
                } else {
                    this.textContent = `面积：${(area / 1000000).toFixed(4)}km²`;

                    // this.distanceContainer.appendChild(this.lenValue_el);
                }
                this.lenValue_el.textContent = this.textContent;
                this.distanceContainer.appendChild(this.lenValue_el);
                console.log("distance", area)
            } else if (Geometry.getType() == "Point") {

            }

        },
        pickClick(Coord) {//点击拾取函数
            // let query = {
            //     SERVICE: "WFS",
            //     REQUEST: "GetFeature",
            //     VERSION: "1.0.0",
            //     TYPENAMES: "topp:states",
            //     OUTPUTFORMAT: "json",
            //     SRSNAME: "EPSG:4326",
            //     cql_filter: `SUB_REGION=SUB_REGION`,
            //   };
            //   let url="http://127.0.0.1:8888/geoserver/topp/ows?"
            //   for (let key in query) {
            //       url += `${key}=${query[key]}&`;
            //     }
            //     // 去除最后多余的那一个&
            //   url = url.slice(0, -1);
            //   axios.get("http://127.0.0.1:8888/geoserver/topp/ows",{
            //     params:query, 
            //   }).then(res=>{
            //     // let result = JSON.parse(res);
            //     console.log("feature",res)
            //   })
            // let xhr = new XMLHttpRequest();
            // xhr.open("get", url);
            // xhr.send();
            // xhr.onreadystatechange = function () {
            //   if (xhr.readyState === 4) {
            //     console.log("哪家快递师傅")
            //     if (xhr.status === 200) {
            //         console.log("你哦双方都够")
            //       console.log("xhr",xhr.responseText)
            //     //   callback(xhr.responseText);
            //     }
            //   }
            // };

            this.lenValue_el.remove();
            this.distanceContainer.innerHTML = "";
            // this.filterByPro()
            let lng = Coord[0].toString().substring(0, 7);
            let lat = Coord[1].toString().substring(0, 6);
            this.textContent = `<h4>经度：${lng} <br/>维度：${lat}</h4>`;
            this.lenValue_el.innerHTML = this.textContent;
            this.distanceContainer.appendChild(this.lenValue_el);
        },
        ClickQuery() {
            this.map.on("click", this.ClickQueryBack);
        },
        ClickQueryBack(e) {
            console.log("e", e);
            let style = new Style({
                stroke: new Stroke({
                    color: "red",
                    width: 1,
                }),
                fill: new Fill({
                    color: "rgba(8, 226, 237,0.4)",
                }),
            });
            let FeatureProperties;
            //实现高亮显示和设置中心点
            this.WFSlayer.getFeatures(e.pixel).then((features) => {
                let Feature = features.length ? features[0] : undefined;
                if (Feature) {
                    Feature.setStyle(style);
                    if (this.heightLingFea) this.heightLingFea.setStyle(this.layerStyle);
                    this.heightLingFea = Feature;
                    FeatureProperties = Feature.getProperties();
                    this.map.getView().setCenter(e.coordinate);
                    Object.keys(FeatureProperties).forEach((key) => {
                        if (key != "geometry") {
                            let fieldValue = {};
                            fieldValue.field = key;
                            fieldValue.value = FeatureProperties[key];
                            this.FeaTableData.push(fieldValue);
                        }
                    });
                    const coordinate = e.coordinate;
                    // const hdms = toStringHDMS(toLonLat(coordinate));
                    // console.log("inHTML", inHTML);
                    // this.content.innerHTML = inHTML;
                    this.popupOerlay.setPosition(coordinate);
                } else if (this.heightLingFea && !Feature) {
                    this.heightLingFea.setStyle(this.layerStyle);
                }
            });

        },
        //导出可视范围地图成pdf函数
        exportMap() {
            // const exportButton = document.getElementById("export-pdf");
            // exportButton.addEventListener(
            //     "click",
            //     function () {
            // exportButton.disabled = true;
            document.body.style.cursor = "progress";
            const size = this.map.getSize();
            const viewResolution = this.map.getView().getResolution();
            this.map.once("rendercomplete", function () {
                const mapCanvas = document.createElement("canvas");
                mapCanvas.width = 1754;
                mapCanvas.height = 1240;
                const mapContext = mapCanvas.getContext("2d");
                Array.prototype.forEach.call(
                    document.querySelectorAll(".ol-layer canvas"),
                    function (canvas) {
                        if (canvas.width > 0) {
                            const opacity = canvas.parentNode.style.opacity;
                            mapContext.globalAlpha = opacity === "" ? 1 : Number(opacity);
                            const transform = canvas.style.transform;
                            // Get the transform parameters from the style's transform matrix
                            const matrix = transform
                                .match(/^matrix\(([^\(]*)\)$/)[1]
                                .split(",")
                                .map(Number);
                            // Apply the transform to the export map context
                            CanvasRenderingContext2D.prototype.setTransform.apply(
                                mapContext,
                                matrix
                            );
                            mapContext.drawImage(canvas, 0, 0);
                        }
                    }
                );
                mapContext.globalAlpha = 1;
                mapContext.setTransform(1, 0, 0, 1, 0, 0);
                const pdf = new jspdf.jsPDF("landscape", undefined, "a4");
                pdf.addImage(
                    mapCanvas.toDataURL("image/jpeg"),
                    "JPEG",
                    0,
                    0,
                    297,
                    210
                );
                pdf.save("map.pdf");
                // Reset original map size
                this.map.setSize(size);
                this.map.getView().setResolution(viewResolution);
                document.body.style.cursor = "auto";
            });

            // Set print size
            const printSize = [1754, 1240];
            this.map.setSize(printSize);
            const scaling = Math.min(1754 / size[0], 1240 / size[1]);
            this.map.getView().setResolution(viewResolution / scaling);
            // },
            // false
            // );
        },
        filterByGeo(newgeo, coordinate) {

            const featureRequest = new WFS().writeGetFeature({
                srsName: 'EPSG:4326',//坐标系名称
                featureNS: 'http://127.0.0.1:8888',//工作空间uri
                featurePrefix: 'fistWorkspace',//工作空间名
                featureTypes: ['china'],//图层名
                outputFormat: 'application/json',//输出格式
                // filter:equalToFilter('STATE_NAME','Delaware'),//第一个参数为要素属性名，必须要写对，不然返回结果错误；第二个为字段值，不存在则会返回空feature数组，但不会保存。
                filter: new geoIntersects('the_geom', newgeo, 'EPSG:4326')//创建查询条件
            });
            fetch('http://127.0.0.1:8888/geoserver/fistWorkspace/ows', {
                method: 'POST',
                body: new XMLSerializer().serializeToString(featureRequest),
            }).then(res => {
                return res.json()
            })
                .then((json) => {
                    let features = new GeoJSON().readFeatures(json);
                    if (features.length != 0) {

                        features.forEach((item, index) => {
                            let FeatureProperties = item.getProperties();
                            let fieldValue = {};//保存要素属性
                            console.log(`feaProperties${index}`, FeatureProperties)
                            this.map.getView().setCenter(coordinate);
                            
                            Object.keys(FeatureProperties).forEach((key) => {
                                if (key != "geometry") {
                                    fieldValue[key] = FeatureProperties[key];
                                  
                                }
                            });
                            this.queryFeaTable.push(fieldValue);
                        })
                        this.isQueryTable=true;
                        this.popupOerlay.setPosition(coordinate);
                        this.querySource.addFeatures(features);
                    }

                });
        }
    }
}