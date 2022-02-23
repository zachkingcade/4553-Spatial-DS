#imports
import geopandas
from shapely.geometry import box, Polygon, LineString, Point
import csv
import json

# Requirements:
# [Requirement] Load both data files into a geopandas geoseries spatial index.

# read in city data
file = open("./cities.json")
cityData = json.load(file)
file.close()

cityX = []
cityY = []
for city in cityData["features"]:
        cityX.append(city["geometry"]["coordinates"][0])
        cityY.append(city["geometry"]["coordinates"][1])

#read in ufo data
file = open('ufo_data.csv')
csvreader = csv.reader(file)
header = next(csvreader)
ufoData = []
ufoX = []
ufoY = []
for row in csvreader:
        ufoData.append(row)
        ufoX.append(row[5])
        ufoY.append(row[6])

# Load the 2 lists into the geo series
citySeries = geopandas.GeoSeries(geopandas.points_from_xy(cityX, cityY))
ufoSeries = geopandas.GeoSeries(geopandas.points_from_xy(ufoX, ufoY))
print("GeoSereis Loaded")

#load both into geopandas groseries

# Calculate the distance from each city to every other city and store those values in either a csv or json file for use at a later time.

distanceTable = []
for point in citySeries:
        distanceTable.append(citySeries.distance(point))

# Determine a metric or threshold to "assign" a UFO sighting to a particular city. Maybe average the distance to the 100 closest UFO's as a start.
closestUfos = []
for city in citySeries:
        #this method averages about 100  ufos per city
        boxSize = 0.03626
        closestUfos.append(ufoSeries.sindex.query(box(city.x -boxSize, city.y +boxSize, city.x +boxSize, city.y -boxSize)))

#average ufo sightings
average = 0
for row in closestUfos:
        average += len(row)/len(closestUfos)
print(average)

# Your files should be in json format.
