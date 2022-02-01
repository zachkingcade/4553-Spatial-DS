import json
from pickletools import read_decimalnl_long
from pprint import pprint as print
import random


def getLat(city):
    return city["latitude"]


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

# Let's then order them by lat in a new list

statesList = []
for item in MPStates.keys():
    statesList.append(MPStates[item])

statesList.sort(key=getLat)

resultingGeoJson = []
for x in range(len(statesList)):
    print(x)
    newFeature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [statesList[x]["longitude"], statesList[x]["latitude"]]
        },
        "properties": {
            "name": statesList[x]["city"]
        }
    }
    resultingGeoJson.append(newFeature)
    if x < len(statesList)-1:
        newLine = {
            "type": "LineString",
            "coordinates": [
                [statesList[x]["longitude"], statesList[x]["latitude"]], [statesList[x+1]["longitude"], statesList[x+1]["latitude"]]
            ]
        }
        resultingGeoJson.append(newLine)

print(resultingGeoJson)
