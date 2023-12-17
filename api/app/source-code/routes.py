from fastapi import APIRouter,Request
from typing import Union

tableRouter = APIRouter()

@tableRouter.get("/")
async def get_tables(request: Request,geoFilterPoint : Union[str, None] = None,geoFilterDistance : Union[int, None] = 5000):
    if geoFilterPoint:
        coordinates_str = geoFilterPoint.split(",")
        coordinates = [float(x) for x in coordinates_str]
        db_query_response = request.app.database["tables"].find({ "location.geometry": { "$near" : { "$geometry" : { "type": "Point", "coordinates": coordinates }, "$minDistance": 0, "$maxDistance": geoFilterDistance } } })
        return_db_list = list(db_query_response)
    else:
        db_query_response = request.app.database["tables"].find()
        return_db_list = list(db_query_response)

    features_list = []

    for table in return_db_list:

        properties = {}

        if "name" in table["location"]["place"].keys() :
            properties["place"] = table["location"]["place"]["name"]
        
        if "lit" in table.keys() :
            properties["lit"] = table["lit"]
        
        if "lastCheckDate" in table.keys() :
            properties["lastCheckDate"] = table["lastCheckDate"]
        
        if "tableSurface" in table.keys() :
            properties["tableSurface"] = table["tableSurface"]
        
        if "covered" in table.keys() :
            properties["covered"] = table["covered"]
        
        features_list.append({
            "id":table["_id"],
            "geometry": table["location"]["geometry"],
			"type": "Feature",
            "properties": properties
        })

    return { "type": "FeatureCollection", "features": features_list }