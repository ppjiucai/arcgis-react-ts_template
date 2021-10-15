import React, { useEffect, useRef, useState } from 'react'
import { Button, Checkbox, Col, Drawer, message, Row, Select, Spin } from 'antd';
import GPS from "./gps"
import {
  Map,
  MapView,
  Graphic,
  GraphicsLayer,
  Point,
  SpatialReference,
  Polyline,
  PictureMarkerSymbol,
  BaseTileLayer,
  esriRequest,
  Color,
  esriConfig,
  LineSymbol,
  Expand,
  Legend,
  Search,
  // popupClusters,
  // labelsCreator,
} from '../../modules/arcgisModules'
import ReactEcharts from 'echarts-for-react';
import './index.css'
// import site from './site.json'
import { url } from 'inspector'
import umirequest from "umi-request";
import sitePng from '@/assets/images/site.png'  // 正常站点颜色 正常站点的样式  绿色图标
import siteDisturbPng from '@/assets/images/site-disturb.png'  // 黄色感叹号 带波浪 干扰 信号丢失
import siteLeakPng from '@/assets/images/site-leak.png'  //  漏水站点样式  红色图标
import siteWarning2Png from '@/assets/images/site-warning2.png'  //  异常站点样式  红色图标
import siteLostPng from '@/assets/images/site-lost.png'  //  站点丢失
import siteleakpointPng from '@/assets/images/siteleakpoint.png'  //  漏水点
import signalTowerPng from '@/assets/images/signal-tower.gif'  //  正常基站
import signalTowerLostPng from '@/assets/images/signal-tower-lost.gif'  //  损坏基站
// import { create } from 'esri/core/promiseUtils'
// import Layer from 'esri/layers/Layer';
import request from '../../unilts/request'
import Item from 'antd/lib/list/Item';

const { Option } = Select;

// 


/**
 * 获取 水管或者 站点点样式  type 1 正常站点 2 干扰信号丢失 3漏水站点 4异常站点 5站点丢失 6漏水点 7正常基站 8损坏基站
 * type站点类型，isLine是否是水管
 */
const getPointSymbol = (type?: number, isLine = false) => {
  let symbol
  let style = {
    width: '38px',
    height: '38px',
  }
  if (isLine) {
    /**水管颜色 */
    return {
      type: "simple-line",
      color: '#1890ff', // blue
      width: 5,
      style: 'solid',
    };
  }
  const rule = [
    {
      match: type === 1,
      action: () => {
        symbol = new PictureMarkerSymbol({
          ...style,
          url: sitePng,
        })
      }
    },
    {
      match: type === 2,
      action: () => {
        symbol = new PictureMarkerSymbol({
          ...style,
          url: siteLeakPng,
        })
      }
    },
    {
      match: type === 3,
      action: () => {
        symbol = new PictureMarkerSymbol({
          ...style,
          url: siteDisturbPng,
        })
      }
    },
    {
      match: type === 4,
      action: () => {
        symbol = new PictureMarkerSymbol({
          ...style,
          url: siteWarning2Png,
        })
      }
    },
    {
      match: type === 5,
      action: () => {
        symbol = new PictureMarkerSymbol({
          ...style,
          url: siteLostPng,
        })
      }
    },
    {
      match: type === 6,
      action: () => {
        symbol = new PictureMarkerSymbol({
          ...style,
          url: siteleakpointPng,
        })
      }
    },
    {
      match: type === 7,
      action: () => {
        symbol = new PictureMarkerSymbol({
          ...style,
          url: signalTowerPng,
        })
      }
    },
    {
      match: type === 8,
      action: () => {
        symbol = new PictureMarkerSymbol({
          ...style,
          url: signalTowerLostPng,
        })
      }
    },
  ]
  rule.forEach((elemet: any) => { if (elemet.match) (elemet.action()) })
  return symbol
}


/**
  * 处理线的坐标参考系
  * @param paths 坐标
  * @param toGoogle 
  * @returns 
  */
const convertPaths = (paths: any, toGoogle = false) => {
  var paths1 = paths[0];
  let bpath: any[][] = [];
  paths1.forEach((item: any, idx: any) => {
    //var LatLng = GPS.gcj_encrypt(item[1], item[0]);
    //var tmp1 = GPS.mercator_encrypt(LatLng.lat, LatLng.lng);
    var tmp1 = null;
    if (toGoogle) tmp1 = GPS.wgs2google(item[0], item[1]);
    else tmp1 = GPS.google2wgs(item[0], item[1]);
    bpath.push([tmp1.lng, tmp1.lat]);
  });
  var final = [];
  final.push(bpath);
  return final;
}



const MapContainer = () => {
  const mapRef = useRef<HTMLDivElement>(null)
  // const spatialReference = SpatialReference.WGS84;   // 
  const [loading, handleloading] = useState<boolean>(true)
  const spatialReference = SpatialReference.WebMercator  // 谷歌，高德
  const [pointLayer, handlePointLayer] = useState<any>()
  const [map, handleMap] = useState<any>()
  const [mapView, handleMapView] = useState<any>()
  const [site, handleSite] = useState<any>(undefined)

  // 防止第一次初始化 闪一下
  const [hiden, handlehiden] = useState({
    dashoard: true,
    legend: true,
  })
  useEffect(() => {
    umirequest
      .get("./site.json")
      .then(function (response) {
        console.log(response)
        let siteids = response.siteInfo.map((item: any) => {
          return item.attributes.SiteNO
        }).join(',')
        request.get('./interface.json').then(res => {
          if (Object.keys(res).length === 0) {
            return
          }
          handleloading(false)
          let tmpSite = response
          tmpSite.SiteMarkData = []
          tmpSite.SiteMarkData = res.SiteMarkData
          // tmpSite.SiteMarkData.push({
          //   "name": "正常站点",
          //   "value": res.site_count.site_normal
          // })
          // tmpSite.SiteMarkData.push({
          //   "name": "异常站点",
          //   "value": res.site_count.site_warning
          // })
          // handleSite(tmpSite)
          Object.keys(res.site_status).forEach((item: any) => {
            tmpSite.siteInfo.forEach((it: any) => {
              if (it.attributes.SiteNO === item) {
                item.type = Number(res.site_status[item])
              }
            })
          })
          handleSite(tmpSite)
        })
        // handleSite(response)

      })
      .catch(function (error) {
        console.log(error);
      });

  }, [])
  useEffect(() => {
    if (site) {
      const { map, mapView } = createMap()
      // addTdtLayers(map)
      handleMap(map)
      handleMapView(mapView)
      const lineLayer = createLine(map, mapView)
      const pointLayer = createPoint(map, mapView)
      handlePointLayer(pointLayer)
      createLegend(map, mapView)
      createSearch(map, mapView, pointLayer)
      // addLayers(map)
      // CreatePoint(map) 
      createDashoard(map, mapView)
      return () => {
        map && map.destroy()
      }
    }
  }, [site])

  const createLegend = (map: Map, mapView: MapView) => {
    // get the first layer in the collection of operational layers in the WebMap
    // when the resources in the MapView have loaded.
    // var featureLayer = map.layers.getItemAt(0);
    // console.log('featureLayer', featureLayer)
    const legend = new Expand({
      content: document.getElementById("legendDiv") as Node,
      view: mapView,
      expanded: false,
      expandIconClass: "esri-icon-legend",  //Expand按钮符号
    });
    if (legend) {
      let data = hiden
      data.legend = false
      handlehiden(data)
    }
    // Add widget to the bottom right corner of the view
    mapView.ui.add(legend, "top-left");
  }

  const createSearch = (map: Map, mapView: MapView, pointLayer: any) => {
    const search = new Expand({
      content: document.getElementById("searchDiv") as Node,
      view: mapView,
      expanded: true,
      expandIconClass: "esri-icon-search",  //Expand按钮符号
    })
    // Add widget to the bottom right corner of the view BasemapGallery
    mapView.ui.add(search, "top-right");

  }


  const getEchartOption = (SiteMarkData: any) => {
    return {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '2%',
        left: 'center'
      },
      series: [
        {
          name: '',
          type: 'pie',
          center: ['50%', '55%'],
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          labelLine: {
            show: false
          },
          data: SiteMarkData
        }
      ]
    };
  }

  // esri-icon-dashboard 
  /**
   * 创建仪表盘 echart
   * @param map 
   * @param mapView 
   */
  const createDashoard = (map: Map, mapView: MapView) => {
    const dashoard = new Expand({
      content: document.getElementById("echartDiv") as Node,
      view: mapView,
      expanded: false,
      expandIconClass: "esri-icon-dashboard",  //Expand按钮符号
    })
    if (dashoard) {
      let data = hiden
      data.dashoard = false
      handlehiden(data)
    }
    // Add widget to the bottom right corner of the view BasemapGallery
    mapView.ui.add(dashoard, "top-left");
  }


  /**
   * 创建地图
   * @returns map mapView  respect
   */

  const createMap = () => {
    // 4326
    // const spatialReference = SpatialReference.WebMercator; //386=57

    // @ts-ignore：无法被执行的代码的错误
    let TintLayer = BaseTileLayer.createSubclass({
      properties: {
        urlTemplate: null,
        tint: {
          value: null,
          type: Color
        }
      },

      // generate the tile url for a given level, row and column
      getTileUrl: function (level: any, row: any, col: any) {
        return this.urlTemplate
          .replace("{z}", level)
          .replace("{x}", col)
          .replace("{y}", row);
      },

      // This method fetches tiles for the specified level and size.
      // Override this method to process the data returned from the server.
      fetchTile: function (level: any, row: any, col: any) {
        // call getTileUrl() method to construct the URL to tiles
        // for a given level, row and col provided by the LayerView
        var url = this.getTileUrl(level, row, col);

        // request for tiles based on the generated url
        // set allowImageDataAccess to true to allow
        // cross-domain access to create WebGL textures for 3D.
        return esriRequest(url, {
          responseType: "image",
          // @ts-ignore：无法被执行的代码的错误
          allowImageDataAccess: true
        }).then(
          // @ts-ignore：无法被执行的代码的错误
          function (response: { data: any }) {
            // when esri request resolves successfully
            // get the image from the response
            var image = response.data;
            // @ts-ignore：无法被执行的代码的错误
            var width = this.tileInfo.size[0];
            // @ts-ignore：无法被执行的代码的错误
            var height = this.tileInfo.size[0];

            // create a canvas with 2D rendering context
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            canvas.width = width;
            canvas.height = height;
            // @ts-ignore：无法被执行的代码的错误
            context.drawImage(image, 0, 0, width, height);

            return canvas;
          }.bind(this)
        );
      }
    });

    // *******************************************************
    // Start of JavaScript application
    // *******************************************************

    // // @ts-ignore：无法被执行的代码的错误
    // esriConfig.request.corsEnabledServers.push("webst02.is.autonavi.com");
    // // @ts-ignore：无法被执行的代码的错误
    // esriConfig.request.corsEnabledServers.push("webst03.is.autonavi.com");
    // // @ts-ignore：无法被执行的代码的错误
    // esriConfig.request.corsEnabledServers.push("webst04.is.autonavi.com");
    // @ts-ignore：无法被执行的代码的错误
    esriConfig.request.corsEnabledServers.push("webst01.is.autonavi.com");
    // esriConfig.request.proxyUrl = "webst01.is.autonavi.com";
    // Create a new instance of the TintLayer and set its properties
    //  urlTemplate: "http://mt3.google.cn/vt/lyrs=p&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali",
    //  urlTemplate: "http://webst01.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}",
    let urlTemplate = "http://webst01.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}"
    if (site.mapType === "google") {
      urlTemplate = "http://mt0.google.cn/vt/lyrs=p&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali"

    }
    let stamenTileLayer = new TintLayer({
      urlTemplate: urlTemplate, // 谷歌浏览器
      tint: new Color("#004FBB"),
      title: "高德"
    });
    //     //这里以我的一个切片图层为例
    // var layer = new MapImageLayer({
    //   url: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer"
    // });
    // add the new instance of the custom tile layer the map
    let map = new Map({
      layers: [stamenTileLayer],
    });

    let mapView = new MapView({
      map: map,
      // center: [-118.805, 34.027],
      center: site.center,
      zoom: 14,
      spatialReference,
      container: 'mapView',
      constraints: {
        minZoom: 20,
        maxZoom: 4
      }
    })
    // @ts-ignore
    // MapView.on("click", function (event:any) {
    //   console.log('event',event)
    // })
    // const legend = new Legend({
    //   mapView,
    //   container: "legendDiv"
    // });

    // Override the default symbol representing the cluster extent

    return { map: map, mapView: mapView }
  }


  /**
   *  创建点和线
   * @param map 
   * @param mapView 
   */
  const createPoint = (map: Map, mapView: MapView) => {
    let layer = new GraphicsLayer();
    site.siteInfo.forEach((element: any) => {
      let LatLng = GPS.wgs2google(element.attributes.Lng, element.attributes.Lat);
      let points = new Point({
        y: LatLng.lat,
        x: LatLng.lng,
        spatialReference: spatialReference
      }
      )
      let popupTemplate: any = {
        title: "基本信息",
        content: [
          {
            // It is also possible to set the fieldInfos outside of the content
            // directly in the popupTemplate. If no fieldInfos is specifically set
            // in the content, it defaults to whatever may be set within the popupTemplate.
            type: "fields",
            fieldInfos: element.fieldInfos
          },
        ]
      }
      element.mediaInfos.forEach((element: any) => {
        popupTemplate.content.push(
          {
            type: "media", // MediaContentElement
            mediaInfos: [
              {
                type: "image",
                value: {
                  sourceURL: element
                }
              },
            ]
          }
        )
      })


      layer.graphics.add(new Graphic({
        geometry: points,
        symbol: getPointSymbol(element.attributes.type),
        attributes: element.attributes,
        popupTemplate: popupTemplate,
      }))
    })
    map.add(layer);
    return layer
  }

  const createLine = (map: Map, mapView: MapView) => {
    let layer = new GraphicsLayer();
    site.pipeInfo.forEach((element: any) => {
      let paths = eval("(" + element.Paths + ")")
      paths = convertPaths(paths, true)
      const polyline = new Polyline(
        {
          paths: paths,
          spatialReference: { wkid: 102100 }
        })
      let lineSymbol = {
        type: "simple-line",
        color: element.Symbol.split(',')[1], // blue
        width: element.Symbol.split(',')[2],
        style: element.Symbol.split(',')[0]
      }

      let polylineGraphic = new Graphic({
        geometry: polyline,
        symbol: lineSymbol
      });
      layer.graphics.add(polylineGraphic)
    });
    map.add(layer)
    return layer
  }



  const echartTemplate =
    (
      <div id="echartDiv" style={{ display: hiden.dashoard ? 'none' : 'block' }}>
        {
          site &&
          <ReactEcharts option={getEchartOption(site?.SiteMarkData)} theme="Imooc" style={{ height: '340px' }} />
        }
      </div>
    )


  /**
   *  图例筛选功能
   * @param checkedValues 
   */
  const onChange = (checkedValues: any) => {
    let arr1 = ["1", "2", "3", "4", "5", "6", "7", "8"];
    let arr2 = checkedValues
    for (var i = arr1.length - 1; i >= 0; i--) {
      let a = arr1[i];
      for (var j = arr2.length - 1; j >= 0; j--) {
        let b = arr2[j];
        if (a == b) {
          arr1.splice(i, 1);
          arr2.splice(j, 1);
          break;
        }
      }
    }
    pointLayer.graphics.items.forEach((item: any) => {
      item.visible = true
    })
    pointLayer.graphics.items.forEach((item: any) => {
      item.visible = true
      if (arr1.indexOf(item.attributes.type.toString()) > -1) {
        item.visible = false
      }
    })
    console.log('checked = ', arr1);
  }

  const legenTemplate =
    (
      <div id="legendDiv" style={{ display: hiden.legend ? 'none' : 'block' }}>
        <Checkbox.Group style={{ width: '100%', display: 'flex' }} onChange={onChange} defaultValue={['1', '2', '3', '4', '5', '6', '7', '8']}>
          <Row>
            <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 45, width: 200, background: '#f5f5f5', margin: 10 }}>
              <Checkbox value="1">正常站点</Checkbox>
              <img className="img" src={sitePng}></img>
            </Col>
            <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 45, width: 200, background: '#f5f5f5', margin: 10 }}>
              <Checkbox value="2">漏水站点</Checkbox>
              <img className="img" src={siteLeakPng}></img>
            </Col>
            <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 45, width: 200, background: '#f5f5f5', margin: 10 }}>
              <Checkbox value="3">干扰站点</Checkbox>
              <img className="img" src={siteDisturbPng}></img>
            </Col>
            <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 45, width: 200, background: '#f5f5f5', margin: 10 }}>
              <Checkbox value="4">异常站点</Checkbox>
              <img className="img" src={siteWarning2Png}></img>
            </Col>
            <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 45, width: 200, background: '#f5f5f5', margin: 10 }}>
              <Checkbox value="5">丢失站点</Checkbox>
              <img className="img" src={siteLostPng}></img>
            </Col>
            <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 45, width: 200, background: '#f5f5f5', margin: 10 }}>
              <Checkbox value="6">漏水点</Checkbox>
              <img className="img" src={siteleakpointPng}></img>
            </Col>
            <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 45, width: 200, background: '#f5f5f5', margin: 10 }}>
              <Checkbox value="7">正常基站</Checkbox>
              <img className="img" src={signalTowerPng}></img>
            </Col>
            <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 45, width: 200, background: '#f5f5f5', margin: 10 }}>
              <Checkbox value="8">损坏基站</Checkbox>
              <img className="img" src={signalTowerLostPng}></img>
            </Col>
          </Row>
        </Checkbox.Group>
      </div>
    )


  /**
   * 
   * @param val FeatureLayer
   */
  const onSearch = (val: string) => {
    pointLayer.graphics.items.forEach((item: any) => {
      if (item.attributes.SiteNO.toString() === val) {
        let pt = new Point({
          latitude:item.geometry.latitude,
          longitude:item.geometry.longitude,
        });
        let opts = {
          duration: 3000  // Duration of animation will be 5 seconds
        };
        mapView.goTo({
          target: pt,
          zoom: 19
        }, opts);
        mapView.popup.open({
          ...item.popupTemplate,
          location: item.geometry,
          // features: item
          fetchFeatures: true
        })
      }
    })
  }
  const searchTemplate = (
    <div
      id="searchDiv"
    >
      {
        site &&
        <Select
          showSearch
          placeholder="搜索设备号"
          // onSearch={onSearch}
          onChange={onSearch}
          style={{ width: 250 }}
          filterOption={(input, option) => {
            // console.log(option)
            return option?.children.toString().indexOf(input.toString()) >= 0
          }
          }
        >
          {
            site.siteInfo.map((element: any, index: number) => {
              return (<Option value={element.attributes.SiteNO.toString()}>{element.attributes.SiteNO.toString()}</Option>)
            })
          }
        </Select>
      }
    </div>
  )


  return (
    <div>
      <div ref={mapRef} id="mapView" className="map-container">
      </div>
      {
        loading &&
        <div style={{ marginTop: 300 }} >
          <Spin spinning={loading} delay={500} size="large">
          </Spin>
        </div>
      }


      {legenTemplate}
      {searchTemplate}
      {site?.SiteMarkData.length > 0 && echartTemplate}


    </div>

  )
}

export default MapContainer
