from audioop import maxpp
import json
import math
import geopandas
from shapely.geometry import Point, Polygon
import numpy

def pointWithinState(point, state):
    if(state["type"] == "MultiPolygon"):
        for layer1 in state["coordinates"]:
            for layer2 in layer1:
                polylist = []
                for layer3 in layer2:
                    polylist.append((layer3[0],layer3[1]))
                poly = Polygon(polylist)
                if (point.within(poly)):
                    return True
    elif (state["type"] == "Polygon"):
        
        for layer1 in state["coordinates"]:
            polylist = []
            for layer2 in layer1:
                polylist.append((layer2[0],layer2[1]))
            poly = Polygon(polylist)
            if (point.within(poly)):
                return True
    return False

#Borrowed from stack overflow
def rgb_to_hex(rgb):
    return '%02x%02x%02x' % rgb

# [Requirement] A simple point would be just great closer to a small circle or square or any small polygon
def addCity(x,y, scale):
    newFeature = {
      "type": "Feature",
      "properties": {
          "fill": "#ff0000"
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [
              x-scale,
              y+scale
            ],
            [
              x+scale,
              y+scale
            ],
            [
              x+scale,
              y-scale
            ],
            [
              x-scale,
              y-scale
            ],
            [
              x-scale,
              y+scale
            ]
          ]
        ]
      }
    }
    return newFeature

# [Requirement] Load state data into dataframe
file = open("./states.geojson")
stateDataPreScalp = json.load(file)
file.close()
print("Loaded States.geojson")
#scalp data
stateData = {}
for state in stateDataPreScalp["features"]:
    stateData[state["properties"]["name"]] = state["geometry"]
    stateData[state["properties"]["name"]]["population"] = 0
# print(stateData)

# [Requirement] read in city data
file = open("./cities.json")
cityData = json.load(file)
file.close()
print("Read cities.json")

# [Requirement] must do some kind of "point in polygon" test to see which cities go with each state
maxPop = 0
minPop = 999999999
for city in cityData:
    point = Point(city["longitude"], city["latitude"])
    foundPoint = False
    for key in stateData.keys():
        if (pointWithinState(point, stateData[key])):
            # [Requirement] calculate total population
            stateData[key]["population"] += city["population"]
            if stateData[key]["population"] > maxPop:
                maxPop = stateData[key]["population"]
            if stateData[key]["population"] < minPop:
                maxPop = stateData[key]["population"]

for key in stateData.keys():
    print(key, stateData[key]["population"])

for state in stateDataPreScalp["features"]:
    greenValue = 0
    state["properties"]["fill"] = '#'+ rgb_to_hex((239, math.floor((stateData[state["properties"]["name"]]["population"]/maxPop) * 255),245))
    state["properties"]["population"] = stateData[state["properties"]["name"]]["population"]
    state["properties"]["fill-opacity"] = 0.75

with open("./geojson_processed.json", "w") as file:
    json.dump(stateDataPreScalp, file, indent=4)

# [Requirement] Also, you will need to display the cities on our map
for city in cityData:
    newFeat = addCity(city["longitude"], city["latitude"], 0.1)
    stateDataPreScalp["features"].append(newFeat)

with open("./geojson_processed_with_cities.json", "w") as file:
    json.dump(stateDataPreScalp, file, indent=4)

print("Finished with no error")