// display variables
var displayMap;
let view;
var geocodereturn1 = {};
let graphicsLayer;
var pt;
var pointGraphic;
var pointGraphic01;
var stop1;
var stop2;
let reportroutingdata;
let firstAddress;
let secondAddress;
let totalDistance;
let totalTime;
var RD = document.getElementById("report-data");



let arr = [stop1, stop2];
let returnedGPS = [];

let longLatFromGPS = document.getElementById("long-lat-from");
let longLatToGPS = document.getElementById("long-lat-to");

returnedGPS.push([longLatFromGPS.value], [longLatToGPS.value]);

let coordinates = returnedGPS.map((item) => {
  let [longitude, latitude] = item[0].split(",").map(Number);
  return { longitude, latitude };
});

let firstPt = coordinates[0];
let firstLong = firstPt.longitude;
let firstLat = firstPt.latitude;

let secondPt = coordinates[1];
let secondLong = secondPt.longitude;
let secondLat = secondPt.latitude;

// let firstCoordinate = coordinates[1];
// let firstLongitude = firstCoordinate.longitude;
// let firstLatitude = firstCoordinate.latitude;

// console.log(`First Longitude: ${firstLongitude}, First Latitude: ${firstLatitude}`);

function loadModule(moduleName) {
  return new Promise((resolve, reject) => {
    require([moduleName], (module) => {
      if (module) {
        resolve(module);
      } else {
        reject(new Error(`Module not found: ${moduleName}`));
      }
    }, (error) => {
      reject(error);
    });
  });
}

async function initializeGeocodingAddresses() {
  try {
    const [
      esriConfig,
      Map,
      MapView,
      Graphic,
      locator,
      GraphicsLayer,
      route,
      RouteParameters,
      FeatureSet,
    ] = await Promise.all([
      loadModule("esri/config"),
      loadModule("esri/Map"),
      loadModule("esri/views/MapView"),
      loadModule("esri/Graphic"),
      loadModule("esri/rest/locator"),
      loadModule("esri/layers/GraphicsLayer"),
      loadModule("esri/rest/route"),
      loadModule("esri/rest/support/RouteParameters"),
      loadModule("esri/rest/support/FeatureSet"),
    ]);

    esriConfig.apiKey =
      "AAPT3NKHt6i2urmWtqOuugvr9XOQeEtGf5ANzi2t1xeXjN6t2cM8gfJLDBEmNM3PBiI44eUiCHoFaHpu4QiY-8dfj643ALFdFlTrFVLj2HheIFgNgffToPZZcZlgUuOUJm7pO-62xmf8fv_iWkSvE3NOD_3EOrp_fNVMtCPx-bK9Qbsez5eG6WbLGv5Qb7LGkggEv_nI8xpOsJuVJc-A09IueAcDN0wkdKF7_SwfBNf-9c0."; // Will change it

    const routeUrl =
      "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";
    const routeLayer = new GraphicsLayer();
    const routeParams = new RouteParameters({
      // An authorization string used to access the routing service
      apiKey:
        "AAPT3NKHt6i2urmWtqOuugvr9XOQeEtGf5ANzi2t1xeXjN6t2cM8gfJLDBEmNM3PBiI44eUiCHoFaHpu4QiY-8dfj643ALFdFlTrFVLj2HheIFgNgffToPZZcZlgUuOUJm7pO-62xmf8fv_iWkSvE3NOD_3EOrp_fNVMtCPx-bK9Qbsez5eG6WbLGv5Qb7LGkggEv_nI8xpOsJuVJc-A09IueAcDN0wkdKF7_SwfBNf-9c0.",
      stops: new FeatureSet(),
      outSpatialReference: {
        // autocasts as new SpatialReference()
        wkid: 3857,
      },
    });

    const stopSymbol = {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      style: "cross",
      size: 15,
      outline: {
        // autocasts as new SimpleLineSymbol()
        width: 4,
      },
    };

    const routeSymbol = {
      type: "simple-line", // autocasts as SimpleLineSymbol()
      color: [0, 0, 255, 0.5],
      width: 5,
    };

    displayMap = new Map({
      // basemap: "arcgis-light-gray",
      // basemap: "arcgis/navigation",
      basemap: "topo-vector",
      layers: [routeLayer],
    });

    graphicsLayer = new GraphicsLayer();
    displayMap.add(graphicsLayer);

    view = new MapView({
      center: [30.31, 30.05], // longitude, latitude, centered on Los Angeles
      container: "displayMap",
      map: displayMap,
      zoom: 14,
      // highlightOptions: {
      //   color: "#39ff14",
      //   haloOpacity: 0.9,
      //   fillOpacity: 0,
      // },
    });

    RD.style.display = "none";
    view.ui.add("lab", "top-right");
    view.popup.actions = [];
    view.ui.add("findF", "bottom-left");
    view.ui.add("findS", "bottom-left");
    view.ui.add("startdriving", "bottom-left");
    view.ui.add("reportdata", "bottom-left");

    view.when(() => {
      if (returnedGPS.length <= 2 && coordinates) {
        const point = {
          //Create a point
          type: "point",
          longitude: firstLong,
          latitude: firstLat,
        };
        let pointAtt = {
          Name: "First Point",
        };
        const simpleMarkerSymbol = {
          type: "simple-marker",
          color: [226, 119, 40], // Orange
          outline: {
            color: [255, 255, 255], // White
            width: 1,
          },
        };

        pointGraphic = new Graphic({
          geometry: point,
          symbol: simpleMarkerSymbol,
          attributes: pointAtt,
          popupTemplate: {
            title: "First Point",
            // content: ""
          },
        });
        stop1 = pointGraphic;

        const point01 = {
          //Create a point
          type: "point",
          longitude: secondLong,
          latitude: secondLat,
        };
        let pointAtt01 = {
          Name: "Second Point",
        };
        const simpleMarkerSymbol01 = {
          type: "simple-marker",
          color: [226, 119, 40], // Orange
          outline: {
            color: [255, 255, 255], // White
            width: 1,
          },
        };

        pointGraphic01 = new Graphic({
          geometry: point01,
          attributes: pointAtt01,
          symbol: simpleMarkerSymbol01,
          popupTemplate: {
            title: "Second Point",
            // content: ""
          },
        });
        stop2 = pointGraphic01;

        graphicsLayer.add(pointGraphic);
        graphicsLayer.add(pointGraphic01);
        console.log(graphicsLayer, "GL");
        if (graphicsLayer.graphics.length) {
          view.goTo({ target: graphicsLayer.graphics });
        }
      }

      // for (let i = 0; i < graphicsLayer.graphics.length; i++) {
      //   pt = graphicsLayer.graphics.items[i].geometry;
      //   reverseGeocode(pt);
      // }
    });

    document
    .getElementById("findF")
    .addEventListener("click", function () {
      for (let i = 0; i < graphicsLayer.graphics.length; i++) {
        pt = graphicsLayer.graphics.items[i]
        if (pt.attributes.Name === "First Point") {
          reverseGeocode(pt.geometry);
        }
      }
    });

    document
    .getElementById("findS")
    .addEventListener("click", function () {
      for (let i = 0; i < graphicsLayer.graphics.length; i++) {
        pt = graphicsLayer.graphics.items[i]
        if (pt.attributes.Name === "Second Point") {
          reverseGeocode(pt.geometry);
        }
      }
    });

    document
      .getElementById("reportdata")
      .addEventListener("click", function () {
        console.log(reportroutingdata, "reportroutingdata");
        var calciteNotice02 = document.getElementById("calcite-notice02");
        var dfirstAdd02 = document.createElement("div");
        var dfirstAdd03 = document.createElement("div");
        dfirstAdd02.slot = "message";
        dfirstAdd03.slot = "message";
        totalDistance = reportroutingdata.routeResults[0].route.attributes.Total_Kilometers.toFixed(2);
        totalTime = reportroutingdata.routeResults[0].route.attributes.Total_TravelTime.toFixed(2);
        dfirstAdd02.innerHTML = `Total Distance: ${reportroutingdata.routeResults[0].route.attributes.Total_Kilometers.toFixed(2)} Kilometers`;
        dfirstAdd03.innerHTML = `Total travel time: ${reportroutingdata.routeResults[0].route.attributes.Total_TravelTime.toFixed(2)} Minutes`;
        calciteNotice02.append(dfirstAdd02);
        calciteNotice02.append(dfirstAdd03);

        const baseUrl = window.location.origin + window.location.pathname;
        const newUrl = `${baseUrl}/submit?from=${encodeURIComponent(firstAddress)}&to=${encodeURIComponent(secondAddress)}&distance=${encodeURIComponent(totalDistance)}&time=${encodeURIComponent(totalTime)}`;
        console.log(newUrl);

        history.pushState(null, '', newUrl);
      });


    function showAddressF(response) {
      RD.style.display = "block";
      view.ui.add(RD, "bottom-right");
      var calciteNotice = document.getElementById("calcite-notice");
      var dfirstAdd = document.createElement("div");
      dfirstAdd.slot = "message";
      dfirstAdd.innerHTML = response.address;
      firstAddress = response.address;
      calciteNotice.append(dfirstAdd);
    }

    function showAddressS(response) {
      // RD.style.display = "block";
      // view.ui.add(RD, "bottom-right");
      var calciteNotice01 = document.getElementById("calcite-notice01");
      var dfirstAdd01 = document.createElement("div");
      dfirstAdd01.slot = "message";
      dfirstAdd01.innerHTML = response.address;
      secondAddress = response.address;
      calciteNotice01.append(dfirstAdd01);
    }

    function reverseGeocode(pt) {
      console.log(pt, "inside f");
      const geocodingServiceUrl =
        "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

      const params = {
        location: pt,
      };

      locator.locationToAddress(geocodingServiceUrl, params).then(
        (response) => {
          console.log(response, "response");
          // view.ui.add(RD, "top-right");
          // var calciteNotice = document.getElementById("calcite-notice");
          // var dfirstAdd = document.createElement("div");
          // dfirstAdd.slot = "message";
          // dfirstAdd.innerHTML = response.address;
          // calciteNotice.append(dfirstAdd);

          // document.getElementById('firstAddress').innerHTML = response.address;
          if (response) {
            if (response.attributes.X === firstLong) {
              showPopup(response);
              showAddressF(response);
            } else {
              showPopup(response);
              showAddressS(response);
            }
          }
        },
        (err) => {
          showPopup("No address found.", pt);
        }
      );
    }

    // view.when(() => {
    //   // for (let i = 0; i < graphicsLayer.graphics.length; i++) {
    //   //   pt = graphicsLayer.graphics.items[i].geometry;
    //   //   reverseGeocode(pt);
    //   // }
    // });

    document
      .getElementById("startdriving")
      .addEventListener("click", function () {
        // console.log(stop1, "stop1");
        const stop11 = new Graphic({
          geometry: stop1.geometry,
          symbol: stopSymbol,
        });

        const stop12 = new Graphic({
          geometry: stop2.geometry,
          symbol: stopSymbol,
        });
        routeLayer.add(stop11);
        routeLayer.add(stop12);

        // Execute the route if 2 or more stops are input
        routeParams.stops.features.push(stop11);
        routeParams.stops.features.push(stop12);
        if (routeParams.stops.features.length >= 2) {
          route.solve(routeUrl, routeParams).then(showRoute);
        }
      });

    function showRoute(data) {
      console.log(data, "data");
      reportroutingdata = data;
      const routeResult = data.routeResults[0].route;
      routeResult.symbol = routeSymbol;
      routeLayer.add(routeResult);
    }

    // function reverseGeocode(pt) {
    //   const geocodingServiceUrl =
    //     "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

    //   const params = {
    //     location: pt,
    //   };

    //   locator.locationToAddress(geocodingServiceUrl, params).then(
    //     (response) => {
    //       console.log(response, "response");
    //       var calciteNotice = document.getElementById("calcite-notice");
    //       var dfirstAdd = document.createElement("div");
    //       dfirstAdd.slot = "message";
    //       dfirstAdd.innerHTML = response.address;
    //       calciteNotice.append(dfirstAdd);

    //       // document.getElementById('firstAddress').innerHTML = response.address;
    //       if (response) {
    //         showPopup(response);
    //       }
    //     },
    //     (err) => {
    //       showPopup("No address found.", pt);
    //     }
    //   );

    // }

    //Information shown when map is clicked
    function showPopup(response) {
      view.openPopup({
        title: response.attributes.PlaceName || "Address",
        content:
          response.attributes.LongLabel +
          "<br><br>" +
          response.location.longitude.toFixed(5) +
          ", " +
          response.location.latitude.toFixed(5),
        location: response.location,
      });
      addGraphic(response);
    }

    function addGraphic(response) {
      if (!response.location) {
        return;
      }
      view.graphics.removeAll();
      view.graphics.add(
        new Graphic({
          symbol: {
            type: "simple-marker",
            outline: {
              color: "white",
              width: 1.5,
            },
            color: "black",
            size: 6,
          },
          geometry: response.location,
        })
      );
    }

    await view.when();

    //add widgets
    addWidgets()
      .then(([view, displayMap]) => {
        console.log(
          "Widgets Returned From Require Scope",
          view,
          displayMap,
          featureLayer
        );
        // You can work with the view object here
      })
      .catch((error) => {
        // Handle any errors here
      });

    return [view, displayMap]; // You can return the view object
  } catch (error) {
    console.error("Error initializing map:", error);
    throw error; // Rethrow the error to handle it further, if needed
  }
}

// calling
initializeGeocodingAddresses()
  .then(() => {
    console.log("Map Returned From Require Scope", displayMap);
    // You can work with the view object here
  })
  .catch((error) => {
    // Handle any errors here
  });

async function addWidgets() {
  try {
    // await initializeMap();

    const [BasemapGallery, Expand, ScaleBar, Search, Home] = await Promise.all([
      loadModule("esri/widgets/BasemapGallery"),
      loadModule("esri/widgets/Expand"),
      loadModule("esri/widgets/ScaleBar"),
      loadModule("esri/widgets/Search"),
      loadModule("esri/widgets/Home"),
    ]);

    var basemapGallery = new BasemapGallery({
      view: view,
    });

    var Expand22 = new Expand({
      view: view,
      content: basemapGallery,
      expandIcon: "basemap",
      group: "top-right",
      // expanded: false,
      expandTooltip: "Open Basmap Gallery",
      collapseTooltip: "Close",
    });
    view.ui.add([Expand22], { position: "top-left", index: 6 });

    var scalebar = new ScaleBar({
      view: view,
      unit: "metric",
    });
    view.ui.add(scalebar, "bottom-right");

    var search = new Search({
      //Add Search widget
      view: view,
    });
    view.ui.add(search, { position: "top-left", index: 0 }); //Add to the map

    var homeWidget = new Home({
      view: view,
    });
    view.ui.add(homeWidget, "top-left");

    await view.when();

    return [view, displayMap]; // You can return the view object
  } catch (error) {
    console.error("Error initializing map:", error);
    throw error; // Rethrow the error to handle it further, if needed
  }
}
