import osm2geojson
import requests
import json
import geopandas
import os

MAPBOX_API_TOKEN = os.environ["MAPBOX_API_TOKEN"]

file_exists = os.path.exists('./raw-data-france.geojson')

if not file_exists:
    request = requests.get("https://overpass-api.de/api/interpreter?data=%5Bout%3Ajson%5D%5Btimeout%3A1000%5D%3B%0Aarea(id%3A3601403916)-%3E.searchArea%3B%0A(%0A%20%20node%5B%22leisure%22%3D%22pitch%22%5D%5B%22sport%22%3D%22table_tennis%22%5D(area.searchArea)%3B%0A%20%20way%5B%22leisure%22%3D%22pitch%22%5D%5B%22sport%22%3D%22table_tennis%22%5D(area.searchArea)%3B%0A)%3B%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B")
    geojson_request_data = osm2geojson.json2geojson(request.json())
    data_gdf = geopandas.read_file(json.dumps(geojson_request_data), driver='GeoJSON')
    data_gdf.to_file('raw-data-france.geojson',driver='GeoJSON')
else :
    data_gdf = geopandas.read_file('raw-data-france.geojson', driver='GeoJSON')

data_gdf.geometry = data_gdf.geometry.to_crs(epsg=3035)
data_gdf.geometry = data_gdf.geometry.centroid
data_gdf.geometry = data_gdf.geometry.to_crs(epsg=4326)

raw_data = json.loads(data_gdf.to_json())

tag_keys_list = []
tag_values_dict = {}

empty_poi = []
categories = []
no_categorie = []

for feature in raw_data['features']:

    reverse_geocoding_request_address = "https://api.mapbox.com/geocoding/v5/mapbox.places/"+str(feature['geometry']['coordinates'][0])+","+str(feature['geometry']['coordinates'][1])+".json?country=fr&language=fr&types=poi&limit=5&access_token="+MAPBOX_API_TOKEN
    reverse_geocoding_data_address = requests.get(reverse_geocoding_request_address).json()

    if len(reverse_geocoding_data_address['features']) == 0:
        empty_poi.append("no poi")
    else:
        for reverse_geocoding_feature in reverse_geocoding_data_address['features']:
            if 'category' in reverse_geocoding_feature['properties'].keys():
                for i in reverse_geocoding_feature['properties']['category'].strip(' ').split(','):
                    categories.append(i.strip(' '))
            else:
                no_categorie.append("no category in poi")

    tags = feature['properties']['tags']

    for key, value in tags.items():
        if key in tag_values_dict:
            tag_values_dict[key].append(value)
        else:
            tag_values_dict[key] = [value]
        tag_keys_list.append(key)

address_infos = {}
address_infos['nb_empty_poi'] = len(empty_poi)
address_infos['prct_empty_poi'] = round(len(empty_poi)/len(raw_data['features']),2)
address_infos['nb_empty_category'] = len(no_categorie)
address_infos['category_list'] = sorted(list(dict.fromkeys(categories)))

unique_tag_keys_list = list(set(tag_keys_list))
tag_infos = []

for item in unique_tag_keys_list:
    tag_values_infos = []
    for tag_value in tag_values_dict[item]:
        if not any(i['value'] == tag_value for i in tag_values_infos):
            tag_values_infos.append({
                'value':tag_value,
                'count':tag_values_dict[item].count(tag_value),
                'percent':round(tag_values_dict[item].count(tag_value)*100/tag_keys_list.count(item))
                })
    tag_infos.append({
            'key':item,
            'count':tag_keys_list.count(item),
            'percent':round(tag_keys_list.count(item)*100/len(raw_data['features'])),
            'unique':len(tag_values_infos),
            'values':sorted(tag_values_infos, key=lambda d: d['count'])
        })

ouput = {}
ouput['location_infos'] = address_infos
ouput['tag_infos'] = tag_infos_sorted = sorted(tag_infos, key=lambda d: d['count'])

with open("tags-data-description.json", "w",encoding='utf-8') as outfile:
    json.dump(ouput,outfile,ensure_ascii=False,indent = 3)