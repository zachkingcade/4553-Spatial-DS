#imports
import geopandas
from shapely.geometry import box, Polygon, LineString, Point
from shapely.ops import unary_union
import csv
import json
import geoplot
from geovoronoi import voronoi_regions_from_coords, points_to_coords
from geovoronoi.plotting import subplot_for_map, plot_voronoi_polys_with_points_in_area

# Requirements:
# [Requirement] Load both data files into a geopandas geoseries spatial index.

# [Requirement] read in city data
file = open("./cities.json")
cityData = json.load(file)
file.close()

cityX = []
cityY = []
for city in cityData["features"]:
        cityX.append(city["geometry"]["coordinates"][0])
        cityY.append(city["geometry"]["coordinates"][1])

# [Requirement] read in ufo data
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

# [Requirement] Load the 2 lists into the geo series
citySeries = geopandas.GeoSeries(geopandas.points_from_xy(cityX, cityY))
ufoSeries = geopandas.GeoSeries(geopandas.points_from_xy(ufoX, ufoY))
print("GeoSereis Loaded")

#^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
#Note to self, all state requirments above are from P02
#^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

# [Requirement] Create a voronoi diagram over the US creating polygons around each of the 49 cities
# Load in our united states bounds
border = geopandas.read_file("us_border.shp")

#convert geoseries to dataframe for geoplot use
cityDataframe = geopandas.GeoDataFrame(geometry = citySeries)

area_shape = unary_union(border.geometry)

coords = points_to_coords(citySeries)

region_polys, region_pts = voronoi_regions_from_coords(coords, area_shape)

#print(region_polys)

# [Requirement] Load said polygons into a spatial tree (geopandas rtree)
voroniSeries = geopandas.GeoSeries(region_polys)
# [Requirement] Save your results to a json file to be used later (maybe).
voroniSeries.to_file("voroni.geojson")


# [Requirement] Load each of the UFO sighting points into the same rtree

voroniSeries = voroniSeries.geometry.append(citySeries.geometry)
# [Requirement] Save your results to a json file to be used later (maybe).
voroniSeries.to_file("voroni_with_points.geojson")

# [Requirement] Query the rtree getting the UFO sighting points that are contained within each polygon
result = []
for i in region_polys:
        points_within = geopandas.sjoin(ufoSeries, region_polys[i], op='within')
        print(points_within)
