import osm2geojson
import requests
import json
import geopandas
import os
import uuid
from datetime import datetime
from pymongo import MongoClient

MAPBOX_API_TOKEN = os.environ["MAPBOX_API_TOKEN"]
MONGODB_CONNSTRING = os.environ["MONGODB_CONNSTRING"]

OVERPASS_API_REQUEST = "%5Bout%3Ajson%5D%5Btimeout%3A1000%5D%3B%0Aarea(id%3A3601403916)-%3E.searchArea%3B%0A(%0A%20%20node%5B%22leisure%22%3D%22pitch%22%5D%5B%22sport%22%3D%22table_tennis%22%5D(area.searchArea)%3B%0A%20%20way%5B%22leisure%22%3D%22pitch%22%5D%5B%22sport%22%3D%22table_tennis%22%5D(area.searchArea)%3B%0A)%3B%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B"
MAPBOX_TABLE_TENNIS_LOCATION_TAGS = ["arena","forest","garden","gym","outdoors","park","sport","sports","stadium"]

def get_initial_data(way_to_get):

    if way_to_get == "file":

        file_exists = os.path.exists("./raw-data-france.geojson")

        if not file_exists:
            raise NameError("initial fiile (raw-data-france.geojson) does not exist")
        else:
            data_gdf = geopandas.read_file("raw-data-france.geojson", driver="GeoJSON")
            return data_gdf

    elif way_to_get == "request":
        request = requests.get("https://overpass-api.de/api/interpreter?data="+OVERPASS_API_REQUEST)
        geojson_request_data = osm2geojson.json2geojson(request.json())
        data_gdf = geopandas.read_file(json.dumps(geojson_request_data), driver="GeoJSON")

        # save to file
        data_gdf.to_file("raw-data-france.geojson",driver="GeoJSON")

        return data_gdf
        
    else:
        raise NameError("no such way to get initial data")

def transform_gdf_to_points(gdf):
    gdf.geometry = gdf.geometry.to_crs(epsg=3035)
    gdf.geometry = gdf.geometry.centroid
    gdf.geometry = gdf.geometry.to_crs(epsg=4326)
    return gdf

def generate_place_from_adress(coordinate_list):
    reverse_geocoding_request_address = "https://api.mapbox.com/geocoding/v5/mapbox.places/"+str(coordinate_list[0])+","+str(coordinate_list[1])+".json?country=fr&language=fr&types=address&access_token="+MAPBOX_API_TOKEN
    reverse_geocoding_data_address = requests.get(reverse_geocoding_request_address).json()
    if len(reverse_geocoding_data_address["features"]) == 0:
        return {}
    else:
        place = {}
        place["type"] = "address"
        place["name"] = reverse_geocoding_data_address["features"][0]["text_fr"]
        place["address"] = reverse_geocoding_data_address["features"][0]["place_name_fr"]
        return place

def generate_place_for_table_coordinates(coordinate_list):

    reverse_geocoding_request_string = "https://api.mapbox.com/geocoding/v5/mapbox.places/"+str(coordinate_list[0])+","+str(coordinate_list[1])+".json?country=fr&language=fr&types=poi&access_token="+MAPBOX_API_TOKEN
    reverse_geocoding_data = requests.get(reverse_geocoding_request_string).json()

    features = reverse_geocoding_data["features"]

    if len(features) == 0:
        return generate_place_from_adress(coordinate_list)

    features_interesting = []
    for feature in features:
        if "category" in feature["properties"].keys():
            if any(item in feature["properties"]["category"] for item in MAPBOX_TABLE_TENNIS_LOCATION_TAGS):
                features_interesting.append(feature)

    # features_interesting = [feature for feature in features if any(item in feature["properties"]["category"] for item in MAPBOX_TABLE_TENNIS_LOCATION_TAGS)]

    if len(features_interesting) == 0:
        return generate_place_from_adress(coordinate_list)
    else:
        place = {}
        place["type"] = "poi"
        place["name"] = features_interesting[0]["text_fr"]
        place["address"] = features_interesting[0]["place_name_fr"]
        return place

def generate_lit_property_with_tags(tags):
    if "lit" in tags.keys():
        if tags["lit"] == "yes":
            return True
        elif tags["lit"] == "no":
            return False
        else :
            raise NameError("lit tag is different of yes/no")
    else:
        return None

def generate_last_check_date_property_with_tags(tags):
    if all(value in ["check_date","survey:date"] for value in tags.keys()):
        return min([datetime.strptime(tags["check_date"], "%Y-%m-%d"),datetime.strptime(tags["survey:date"], "%Y-%m-%d")])
    elif "check_date" in tags.keys():
        return datetime.strptime(tags["check_date"], "%Y-%m-%d")
    elif "survey:date" in tags.keys():
        return datetime.strptime(tags["survey:date"], "%Y-%m-%d")
    else:
        return None

def generate_table_surface_property_from_tags(tags):
    if all(value in ["surface","material"] for value in tags.keys()):
        return tags["surface"]
    elif "surface" in tags.keys():
        return tags["surface"]
    elif "material" in tags.keys():
        if tags["material"] == "steel":
            return "metal"
        else:
            return tags["material"]
    else:
        return None

def generate_covered_property_from_tags(tags):
    if all(value in ["covered","indoor"] for value in tags.keys()):
        if tags["covered"] == "yes":
            return True
        elif tags["covered"] == "no":
            return False
        else:
            raise NameError("covered tag has other vaue than yes/no")
    elif "covered" in tags.keys():
        if tags["covered"] == "yes":
            return True
        elif tags["covered"] == "no":
            return False
        else:
            raise NameError("covered tag has other vaue than yes/no")
    elif "indoor" in tags.keys():
        if tags["indoor"] == "yes":
            return True
        elif tags["indoor"] == "no":
            return False
        else:
            raise NameError("indoor tag has other vaue than yes/no")
    else:
        return None

def format_data(geojson):

    cleaned_data = []

    for feature in geojson["features"]:

        tags = feature["properties"]["tags"]

        if "access" in tags.keys():
            if tags["access"] in ["private","customers","no"]:
                continue

        table = {}

        table["_id"] = str(uuid.uuid4())
        table["source"] = {"name":"osm","osmId":feature["properties"]["type"]+"/"+str(feature["properties"]["id"])}

        location = {}

        geometry = {}
        geometry["coordinates"] = feature["geometry"]["coordinates"]
        geometry["type"] = "Point"

        location["geometry"] = geometry
        
        location["place"] = generate_place_for_table_coordinates(feature["geometry"]["coordinates"])

        table["location"] = location
        
        # lit
        lit_property = generate_lit_property_with_tags(tags)
        if lit_property:
            table["lit"] = lit_property
        
        # check_date / survey:date
        last_check_date_property = generate_last_check_date_property_with_tags(tags)
        if last_check_date_property:
            table["lastCheckDate"] = last_check_date_property

        # surface / material
        table_surface_property = generate_table_surface_property_from_tags(tags)
        if table_surface_property:
            table["tableSurface"] = table_surface_property

        # covered / indoor
        generate_covered_property = generate_covered_property_from_tags(tags)
        if generate_covered_property:
            table["covered"] = generate_covered_property

        cleaned_data.append(table)
    
    return cleaned_data

def save_to_mongo(data):
    mongoClient = MongoClient(MONGODB_CONNSTRING)

    street_pongiste_db = mongoClient["street-pongiste"]

    tables_collection = street_pongiste_db["tables"]

    tables_collection.drop()

    if "geometrySpatialIndex" in tables_collection.list_indexes():
        tables_collection.drop_index("geometrySpatialIndex")

    result = {}
    result["insert_many_result"] = tables_collection.insert_many(data)
    result["create_index_result"] = tables_collection.create_index([("location.geometry", "2dsphere")], name="geometrySpatialIndex")

    return result

if __name__ == "__main__":
    initial_data_gdf = get_initial_data("request")
    initial_data_gdf = transform_gdf_to_points(initial_data_gdf)
    initial_data_dict = json.loads(initial_data_gdf.to_json())
    initial_data_dict["features"] = initial_data_dict["features"]
    formated_data = format_data(initial_data_dict)
    insert_to_mongo_response = save_to_mongo(formated_data)
    print(insert_to_mongo_response)