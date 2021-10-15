import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import SceneView from '@arcgis/core/views/SceneView'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import WebTileLayer from '@arcgis/core/layers/WebTileLayer'
import Graphic from '@arcgis/core/Graphic'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import Point from '@arcgis/core/geometry/Point'
import SpatialReference from '@arcgis/core/geometry/SpatialReference'
import Polyline from '@arcgis/core/geometry/Polyline'
import PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol";
import BaseTileLayer from "@arcgis/core/layers/BaseTileLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import Basemap from "@arcgis/core/Basemap";
import TileInfo from "@arcgis/core/layers/support/TileInfo";
import Color from "@arcgis/core/Color";
import esriRequest from "@arcgis/core/request";
import esriConfig from "@arcgis/core/config";
import LineSymbol from "@arcgis/core/symbols/LineSymbol";
import Expand from "@arcgis/core/widgets/Expand";
import Legend from "@arcgis/core/widgets/Legend";
import Search from "@arcgis/core/widgets/Search";
// import popupClusters from "@arcgis/core/smartMapping/popup/clusters";
// import clusterLabelCreator  from "@arcgis/core/smartMapping/labels/clusters";


export {
  Map,
  MapView,
  SceneView,
  FeatureLayer,
  WebTileLayer,
  Graphic,
  GraphicsLayer,
  Point,
  SpatialReference,
  Polyline,
  PictureMarkerSymbol,
  BaseTileLayer,
  TileLayer,
  TileInfo,
  Color,
  Basemap,
  esriRequest,
  esriConfig,
  LineSymbol,
  Expand,
  Legend,
  Search,

  // popupClusters,
  // clusterLabelCreator,
}