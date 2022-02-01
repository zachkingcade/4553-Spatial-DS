import json
from pickletools import read_decimalnl_long
from pprint import pprint as print
import random


def getLon(city):
    return city["longitude"]

def rgb_to_hex(rgb):
    return '%02x%02x%02x' % rgb


# Read in our json from file
with open("./cities_latlon_w_pop.json") as file:
    data = json.load(file)

# Seperate out our most populated cities in each state
MPStates = {}
for item in data:
    state = item["state"]
    if state in MPStates:
        if item["population"] > MPStates[state]["population"]:
            MPStates[state] = item
    else:
        MPStates[state] = item

# we want to exclude Hawaii and Alaska
MPStates.pop("Hawaii")
MPStates.pop("Alaska")
print(len(MPStates))

# Let's then order them by lat in a new list

statesList = []
for item in MPStates.keys():
    statesList.append(MPStates[item])

statesList.sort(key=getLon)

resultingGeoJson = {
    "type": "FeatureCollection",
    "features": []
}
for x in range(len(statesList)):
    newFeature = {
        "type": "Feature",
        "properties": {
            "name": statesList[x]["city"],
            "marker-color": rgb_to_hex((150 - (3*x), 255, 150 - (3*x))),
            "marker-size": "small",
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                statesList[x]["longitude"],
                statesList[x]["latitude"]
            ]
        }
    }
    resultingGeoJson["features"].append(newFeature)
    if x < len(statesList)-1:
        newLine = {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [
                        statesList[x]["longitude"],
                        statesList[x]["latitude"]
                    ],
                    [
                        statesList[x+1]["longitude"],
                        statesList[x+1]["latitude"]
                    ]
                ]
            }
        }
        resultingGeoJson["features"].append(newLine)

with open("./geojson_processed.json", "w") as file:
    json.dump(resultingGeoJson, file, indent=4)
